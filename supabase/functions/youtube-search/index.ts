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
    const { query } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!youtubeApiKey) {
      return new Response(JSON.stringify({ error: "YouTube API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Search for videos using YouTube Data API v3
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&type=video&` +
      `maxResults=24&q=${encodeURIComponent(query)}&` +
      `key=${youtubeApiKey}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error("YouTube API error:", searchData);
      throw new Error(searchData.error?.message || "YouTube search failed");
    }

    // Get video durations
    const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(",");
    
    let videosWithDuration = searchData.items || [];
    
    if (videoIds) {
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
        `part=contentDetails&id=${videoIds}&key=${youtubeApiKey}`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      
      if (detailsResponse.ok) {
        // Merge duration data
        videosWithDuration = searchData.items.map((item: any) => {
          const details = detailsData.items?.find((d: any) => d.id === item.id.videoId);
          return {
            id: item.id.videoId,
            title: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            duration: details?.contentDetails?.duration
          };
        });
      }
    }

    // Convert ISO 8601 duration to readable format
    const formatDuration = (duration: string) => {
      if (!duration) return "";
      const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (!match) return "";
      
      const hours = parseInt(match[1] || "0");
      const minutes = parseInt(match[2] || "0");
      const seconds = parseInt(match[3] || "0");
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const formattedVideos = videosWithDuration.map((video: any) => ({
      ...video,
      duration: formatDuration(video.duration || "")
    }));

    return new Response(JSON.stringify({ videos: formattedVideos }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("YouTube search error:", error);
    return new Response(JSON.stringify({ error: "Search failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});