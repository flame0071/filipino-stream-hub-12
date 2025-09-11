import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import { Loader2 } from "lucide-react";

const SpotifyCallback = () => {
  const navigate = useNavigate();
  const { handleCallback } = useSpotifyAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state") || undefined;

    if (code) {
      handleCallback(code, state)
        .then(() => navigate("/music", { replace: true }))
        .catch(() => navigate("/music?error=auth", { replace: true }));
    } else {
      navigate("/music?error=missing_code", { replace: true });
    }
  }, [handleCallback, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-primary-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Connecting to Spotify…</span>
      </div>
    </main>
  );
};

export default SpotifyCallback;
