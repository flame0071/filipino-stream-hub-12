import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useYouTubeMusic } from "@/hooks/useYouTubeMusic";
import { Play, Search, Youtube } from "lucide-react";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const Music = () => {
  const { searchVideos, videos, loading } = useYouTubeMusic();
  const [query, setQuery] = useState("OPM");
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  // SEO
  useEffect(() => {
    document.title = "YouTube | FlameIPTV";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Stream OPM videos for free. Search and discover Filipino content on YouTube.");
    const linkCanonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    linkCanonical.setAttribute("rel", "canonical");
    linkCanonical.setAttribute("href", window.location.href);
    if (!linkCanonical.parentNode) document.head.appendChild(linkCanonical);
  }, []);

  // Load initial search
  useEffect(() => {
    searchVideos(query);
  }, []);

  const handleSearch = async () => {
    await searchVideos(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const playVideo = (videoId: string) => {
    setCurrentVideoId(videoId);
  };

  const closePlayer = () => {
    setCurrentVideoId(null);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-foreground flex items-center gap-2">
          <Youtube className="h-8 w-8 text-red-500" />
          YouTube
        </h1>
      </header>

      <section className="mb-6 flex items-center gap-2">
        <Input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder="Search OPM artist or song…" 
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          {loading ? "Searching…" : "Search"}
        </Button>
      </section>

      {/* YouTube Player Modal */}
      {currentVideoId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative bg-black rounded-lg overflow-hidden max-w-4xl w-full">
            <button
              onClick={closePlayer}
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full w-8 h-8 flex items-center justify-center z-10"
            >
              ✕
            </button>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={video.thumbnailUrl}
                alt={`Thumbnail for ${video.title}`}
                loading="lazy"
                className="w-full aspect-video object-cover"
              />
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
                  {video.duration}
                </div>
              )}
            </div>
            <CardContent className="p-3 space-y-2">
              <div className="text-sm font-semibold line-clamp-2 text-primary-foreground">{video.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">{video.channelTitle}</div>
              <Button 
                size="sm" 
                onClick={() => playVideo(video.id)}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-1" /> Play
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {videos.length === 0 && !loading && (
        <div className="text-center py-12">
          <Youtube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No videos found. Try searching for your favorite OPM artists!</p>
        </div>
      )}
    </main>
  );
};

export default Music;
