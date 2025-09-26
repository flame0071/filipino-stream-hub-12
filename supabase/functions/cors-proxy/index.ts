// supabase/functions/cors-proxy/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const streamUrl = url.searchParams.get('url');

  if (!streamUrl) {
    return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Ito ang mga bagong headers na idinagdag
    const requestHeaders = {
      'Origin': 'https://www.bilibili.tv',
      'Referer': 'https://www.bilibili.tv/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    };

    const response = await fetch(streamUrl, { headers: requestHeaders }); // Ginamit natin ang mga bagong headers dito

    if (!response.ok) {
      return new Response(response.body, {
        status: response.status,
        headers: { ...corsHeaders },
      });
    }

    // Stream the response back to the client
    return new Response(response.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch the stream' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
