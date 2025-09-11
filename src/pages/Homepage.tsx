import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tv, Film, Play, Star, Users, Globe, Plus, Facebook, Wifi, WifiOff } from 'lucide-react';
import { AddChannelForm } from '@/components/AddChannelForm';
import { ContinueWatching } from '@/components/ContinueWatching';
import { VideoModal } from '@/components/VideoModal';
import { WelcomePopup } from '@/components/WelcomePopup';
import { useOnlineUsers } from '@/hooks/useOnlineUsers';
import { useTotalVisits } from '@/hooks/useTotalVisits';
import { tmdbApi } from '@/lib/tmdb';

const Homepage = () => {
  const { onlineCount, countryStats } = useOnlineUsers();
  const { uniqueVisitsToday, totalUniqueVisitors, totalDailyUniqueVisits, loading: visitsLoading } = useTotalVisits();
  const [selectedContent, setSelectedContent] = useState<{
    id: number;
    type: 'movie' | 'tv';
    title: string;
    server: string;
    posterPath?: string;
    overview?: string;
  } | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handlePlayContent = (contentId: number, contentType: 'movie' | 'tv', title: string, server: string = 'Server 1') => {
    setSelectedContent({
      id: contentId,
      type: contentType,
      title,
      server,
    });
    setIsVideoModalOpen(true);
  };

  const handleClosePlayer = () => {
    setIsVideoModalOpen(false);
    setSelectedContent(null);
  };

  const getVideoUrl = () => {
    if (!selectedContent) return '';
    
    if (selectedContent.type === 'movie') {
      const streamUrls = tmdbApi.getMovieStreamUrls(selectedContent.id);
      return streamUrls[selectedContent.server as keyof typeof streamUrls] || streamUrls['Server 1'];
    } else {
      // For TV shows, we'll default to season 1 episode 1 for now
      const streamUrls = tmdbApi.getTVEpisodeStreamUrls(selectedContent.id, 1, 1);
      return streamUrls[selectedContent.server as keyof typeof streamUrls] || streamUrls['Server 1'];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <WelcomePopup />
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
              flame<span className="text-accent">iptv</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto">
              Your ultimate destination for premium IPTV channels, movies, and TV series
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground shadow-glow hover:shadow-glow-intense">
              <Link to="/channels" className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Live TV
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/movies" className="flex items-center gap-2">
                <Film className="w-5 h-5" />
                Browse Movies
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Why Choose FlameIPTV?
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            Experience the best in streaming entertainment with our premium features
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-gradient-card border-border/30 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-4">
              <div className="bg-accent/10 p-4 rounded-full w-fit mx-auto">
                <Tv className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Live Channels</h3>
              <p className="text-muted-foreground">
                Access hundreds of premium live TV channels from around the world
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/30 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-4">
              <div className="bg-accent/10 p-4 rounded-full w-fit mx-auto">
                <Film className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Movies & Series</h3>
              <p className="text-muted-foreground">
                Enjoy the latest movies and binge-worthy TV series on demand
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/30 backdrop-blur-sm">
            <CardContent className="p-8 text-center space-y-4">
              <div className="bg-accent/10 p-4 rounded-full w-fit mx-auto">
                <Star className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">HD Quality</h3>
              <p className="text-muted-foreground">
                Crystal clear HD streaming with minimal buffering and delays
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Quick Access
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Button asChild className="h-24 bg-gradient-primary hover:shadow-glow">
            <Link to="/channels" className="flex flex-col items-center gap-2">
              <Tv className="w-8 h-8" />
              <span className="font-medium">IPTV Channels</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-24 border-primary/20 hover:bg-primary/10">
            <Link to="/movies" className="flex flex-col items-center gap-2 text-primary-foreground">
              <Film className="w-8 h-8" />
              <span className="font-medium">Movies</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-24 border-primary/20 hover:bg-primary/10">
            <Link to="/tv-series" className="flex flex-col items-center gap-2 text-primary-foreground">
              <Tv className="w-8 h-8" />
              <span className="font-medium">TV Series</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-24 border-primary/20 hover:bg-primary/10">
            <Link to="/custom-channels" className="flex flex-col items-center gap-2 text-primary-foreground">
              <Plus className="w-8 h-8" />
              <span className="font-medium">Custom Channels</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-24 border-primary/20 hover:bg-primary/10">
            <Link to="/comments" className="flex flex-col items-center gap-2 text-primary-foreground">
              <Users className="w-8 h-8" />
              <span className="font-medium">Community</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold text-accent">500+</div>
            <div className="text-primary-foreground/70">Live Channels</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-accent">1000+</div>
            <div className="text-primary-foreground/70">Movies & Shows</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-accent">24/7</div>
            <div className="text-primary-foreground/70">Streaming</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-accent">
              {visitsLoading ? '...' : uniqueVisitsToday.toLocaleString()}
            </div>
            <div className="text-primary-foreground/70">Visitors Today</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-accent">{onlineCount}</div>
            <div className="text-primary-foreground/70">Online Ngayon</div>
            {/* Country flags display */}
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {Object.entries(countryStats).map(([code, stats]) => (
                <div
                  key={code}
                  className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full text-xs"
                  title={`${stats.name}: ${stats.count} users`}
                >
                  <img
                    src={`https://flagcdn.com/16x12/${code.toLowerCase()}.png`}
                    alt={`${stats.name} flag`}
                    className="w-4 h-3"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-primary-foreground/70">{stats.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Continue Watching Section */}
      <section className="container mx-auto px-4 py-16">
        <ContinueWatching onPlayContent={handlePlayContent} />
      </section>

      {/* Add Channel Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Add Your Own Channels
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            Expand your viewing experience by adding custom IPTV channels
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <AddChannelForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-primary-foreground/60">
            flameiptv - Premium Streaming Experience
          </p>
          <div className="mt-3 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20 max-w-md mx-auto">
            <p className="text-sm font-medium text-accent">💰 GCASH: 09310799262</p>
            <p className="text-xs text-primary-foreground/60 mt-1">Support the stream</p>
            <div className="mt-2 flex justify-center">
              <a 
                href="https://web.facebook.com/james.benavides.921" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80 transition-colors"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={handleClosePlayer}
        title={selectedContent?.title || ''}
        videoUrl={getVideoUrl()}
        contentId={selectedContent?.id}
        contentType={selectedContent?.type}
        posterPath={selectedContent?.posterPath}
        overview={selectedContent?.overview}
      />
    </div>
  );
};

export default Homepage;