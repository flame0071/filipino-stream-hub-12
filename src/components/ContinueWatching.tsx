import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Play, X, Clock } from 'lucide-react';
import { useRecentlyWatched } from '@/hooks/useRecentlyWatched';

interface ContinueWatchingProps {
  onPlayContent: (contentId: number, contentType: 'movie' | 'tv', title: string, server?: string) => void;
}

export const ContinueWatching = ({ onPlayContent }: ContinueWatchingProps) => {
  const { items, isLoading, removeItem } = useRecentlyWatched();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground mb-6">Continue Watching</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-card/50 animate-pulse">
              <CardContent className="p-0">
                <div className="aspect-[2/3] bg-muted rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-2 bg-muted rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const formatTime = (progress: number, duration?: number) => {
    if (!duration) return `${Math.round(progress * 100)}%`;
    
    const watched = Math.floor(duration * progress);
    const hours = Math.floor(watched / 3600);
    const minutes = Math.floor((watched % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Continue Watching</h2>
        <p className="text-sm text-muted-foreground">Resume where you left off</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="group hover:shadow-lg transition-all duration-200 bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-0">
              <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
                {item.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Play className="w-12 h-12 text-primary/60" />
                  </div>
                )}
                
                {/* Progress overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 shadow-lg"
                    onClick={() => onPlayContent(item.content_id, item.content_type, item.title, 'Server 1')}
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Resume
                  </Button>
                </div>

                {/* Remove button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(item.progress, item.duration)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <Progress value={item.progress * 100} className="h-1" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(item.progress * 100)}% watched
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onPlayContent(item.content_id, item.content_type, item.title, 'Server 1')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume Watching
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};