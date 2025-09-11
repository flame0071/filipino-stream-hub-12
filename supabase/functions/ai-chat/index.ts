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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let systemMessage = "You are a helpful assistant. Provide clear and concise answers.";
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
            
            systemMessage = `You are a helpful assistant with access to current web search results. Use the following search results to provide accurate and up-to-date information. Always cite your sources when using information from the search results.

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      hasSearchResults: !!searchResults 
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});