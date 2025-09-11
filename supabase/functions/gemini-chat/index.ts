import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, useSearch = false } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: "Gemini API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let systemPrompt = "You are a helpful assistant. Provide clear and concise answers in Filipino or English as appropriate.";
    let searchResults = "";

    // Perform web search if requested
    if (useSearch) {
      try {
        const googleApiKey = Deno.env.get('GOOGLE_SEARCH_API_KEY');
        const searchEngineId = Deno.env.get('GOOGLE_SEARCH_ENGINE_ID');
        
        if (googleApiKey && searchEngineId) {
          const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(message)}`;
          const searchResponse = await fetch(searchUrl);
          const searchData = await searchResponse.json();
          
          if (searchData.items && searchData.items.length > 0) {
            searchResults = searchData.items.slice(0, 3).map((item: any) => 
              `Title: ${item.title}\nSnippet: ${item.snippet}\nURL: ${item.link}`
            ).join('\n\n');
            
            systemPrompt = `You are a helpful assistant with access to current web search results. Use the following search results to provide accurate and up-to-date information. Always cite your sources when using information from the search results. Answer in Filipino or English as appropriate.

Search Results:
${searchResults}

Based on these search results and your knowledge, provide a comprehensive answer.`;
          }
        }
      } catch (searchError) {
        console.error('Search error:', searchError);
        // Continue without search results if search fails
      }
    }

    // Gemini API call
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser: ${message}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ 
      response: aiResponse,
      hasSearchResults: !!searchResults 
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error('Error in gemini-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});