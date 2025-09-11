import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const IPGEOLOCATION_API_KEY = Deno.env.get('IPGEOLOCATION_API_KEY');
    
    if (!IPGEOLOCATION_API_KEY) {
      throw new Error('IPGEOLOCATION_API_KEY is not configured');
    }

    // Get user's IP address from headers
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    '127.0.0.1';

    console.log('Client IP:', clientIP);

    // Call IP geolocation API
    const geoResponse = await fetch(
      `https://api.ipgeolocation.io/ipgeo?apiKey=${IPGEOLOCATION_API_KEY}&ip=${clientIP}`
    );

    if (!geoResponse.ok) {
      throw new Error(`Geolocation API error: ${geoResponse.status}`);
    }

    const geoData = await geoResponse.json();
    
    const locationData = {
      country_code: geoData.country_code2 || 'PH', // Default to Philippines
      country_name: geoData.country_name || 'Philippines',
      city: geoData.city || 'Unknown',
      ip: clientIP
    };

    console.log('Location data:', locationData);

    return new Response(JSON.stringify(locationData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error getting location:', error);
    
    // Return default Philippines data on error
    const defaultData = {
      country_code: 'PH',
      country_name: 'Philippines',
      city: 'Unknown',
      ip: 'unknown'
    };

    return new Response(JSON.stringify(defaultData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});