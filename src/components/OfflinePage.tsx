import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflinePage = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="bg-gradient-card border-border/30 backdrop-blur-sm max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="bg-accent/10 p-4 rounded-full w-fit mx-auto">
            <WifiOff className="w-12 h-12 text-accent" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              You're Offline
            </h1>
            <p className="text-muted-foreground">
              It looks like you're not connected to the internet. Some features may not be available.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can still browse previously cached content while offline.
            </p>
            
            <Button 
              onClick={handleRetry}
              className="bg-accent hover:bg-accent/90 text-accent-foreground w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};