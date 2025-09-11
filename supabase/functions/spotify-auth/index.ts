// Supabase Edge Function: spotify-auth
// Returns Spotify authorization URL for client-side redirect

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { redirectUri } = await req.json();

    if (!redirectUri) {
      return new Response(JSON.stringify({ error: "Missing redirectUri" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
    if (!clientId) {
      return new Response(JSON.stringify({ error: "Missing SPOTIFY_CLIENT_ID" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Scopes required for Web Playback SDK and control
    const scopes = [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-read-playback-state",
      "user-modify-playback-state",
    ].join(" ");

    const state = crypto.randomUUID();

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: scopes,
      state,
      show_dialog: "true",
    });

    const url = `https://accounts.spotify.com/authorize?${params.toString()}`;

    return new Response(JSON.stringify({ url, state }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("spotify-auth error", e);
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
