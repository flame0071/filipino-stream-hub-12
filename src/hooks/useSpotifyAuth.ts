import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const LS_KEYS = {
  accessToken: "spotify_access_token",
  refreshToken: "spotify_refresh_token",
  expiresAt: "spotify_expires_at",
  state: "spotify_oauth_state",
};

export function useSpotifyAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    const at = localStorage.getItem(LS_KEYS.accessToken);
    setAccessToken(at);
  }, []);

  const saveSession = (access_token: string, refresh_token?: string, expires_in?: number) => {
    const expiresAt = Date.now() + (expires_in ? expires_in * 1000 : 3600 * 1000);
    localStorage.setItem(LS_KEYS.accessToken, access_token);
    if (refresh_token) localStorage.setItem(LS_KEYS.refreshToken, refresh_token);
    localStorage.setItem(LS_KEYS.expiresAt, String(expiresAt));
    setAccessToken(access_token);
  };

  const getAccessToken = useCallback(async () => {
    const at = localStorage.getItem(LS_KEYS.accessToken);
    const rt = localStorage.getItem(LS_KEYS.refreshToken);
    const exp = Number(localStorage.getItem(LS_KEYS.expiresAt) || 0);

    if (at && Date.now() < exp - 30_000) return at;
    if (!rt) return null;

    const { data, error } = await supabase.functions.invoke("spotify-refresh", {
      body: { refresh_token: rt },
    });

    if (error) {
      console.error("spotify-refresh error", error);
      return null;
    }

    saveSession(data.access_token, data.refresh_token ?? rt, data.expires_in);
    return data.access_token as string;
  }, []);

  const login = useCallback(async () => {
    const redirectUri = `${window.location.origin}/spotify/callback`;
    const { data, error } = await supabase.functions.invoke("spotify-auth", {
      body: { redirectUri },
    });
    if (error) throw error;
    localStorage.setItem(LS_KEYS.state, data.state);
    window.location.href = data.url;
  }, []);

  const handleCallback = useCallback(async (code: string, state?: string) => {
    const saved = localStorage.getItem(LS_KEYS.state);
    if (saved && state && saved !== state) {
      console.warn("State mismatch in Spotify OAuth");
    }
    const redirectUri = `${window.location.origin}/spotify/callback`;
    const { data, error } = await supabase.functions.invoke("spotify-token", {
      body: { code, redirectUri },
    });
    if (error) throw error;
    saveSession(data.access_token, data.refresh_token, data.expires_in);
  }, []);

  const logout = useCallback(() => {
    Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
    setAccessToken(null);
  }, []);

  const ensurePremium = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return false;
    const resp = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return false;
    const me = await resp.json();
    const premium = me.product === "premium";
    setIsPremium(premium);
    return premium;
  }, [getAccessToken]);

  return { accessToken, getAccessToken, login, handleCallback, logout, ensurePremium, isPremium };
}
