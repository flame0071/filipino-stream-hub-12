import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tv, Film, Users, Plus, Star, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup every time the homepage loads
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to <span className="text-accent">flame</span><span className="text-primary">iptv</span>!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-center text-muted-foreground">
            Discover everything you can do on our premium streaming platform
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-card border-border/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Tv className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Watch Live TV</h3>
                </div>
                <p className="text-sm text-muted-foreground">Access hundreds of premium IPTV channels from around the world</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 p-2 rounded-lg">
                    <Film className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="font-semibold">Movies & TV Series</h3>
                </div>
                <p className="text-sm text-muted-foreground">Enjoy the latest movies and binge-worthy TV series on demand</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <Plus className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-semibold">Add Custom Channels</h3>
                </div>
                <p className="text-sm text-muted-foreground">Add your own IPTV channels with M3U8 links and customize your experience</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Community Comments</h3>
                </div>
                <p className="text-sm text-muted-foreground">Join discussions and share your thoughts with other users</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-center">Quick Navigation</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" className="justify-start" onClick={handleClose}>
                <Link to="/channels">
                  <Tv className="w-4 h-4 mr-2" />
                  IPTV Channels
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start" onClick={handleClose}>
                <Link to="/movies">
                  <Film className="w-4 h-4 mr-2" />
                  Movies
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start" onClick={handleClose}>
                <Link to="/custom-channels">
                  <Plus className="w-4 h-4 mr-2" />
                  Custom Channels
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start" onClick={handleClose}>
                <Link to="/comments">
                  <Users className="w-4 h-4 mr-2" />
                  Community
                </Link>
              </Button>
            </div>
          </div>

          {/* GCash Support Section */}
          <div className="border-t pt-4">
            <Card className="bg-gradient-to-r from-accent/10 to-secondary/10 border-accent/20">
              <CardContent className="p-4 text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">💰</span>
                  <h4 className="font-semibold text-accent">Support FlameIPTV</h4>
                </div>
                <p className="text-sm text-muted-foreground">Help us keep the service running smoothly</p>
                <div className="bg-background/50 p-3 rounded-lg border">
                  <p className="font-bold text-accent text-lg">GCASH: 09310799262</p>
                  <p className="text-xs text-muted-foreground">Every donation helps improve our service</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <Button onClick={handleClose} className="bg-primary hover:bg-primary/90">
              Start Watching
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};