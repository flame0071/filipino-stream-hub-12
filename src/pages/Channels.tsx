import { useState, useMemo } from 'react';
import { ChannelGrid } from '@/components/ChannelGrid';
import { VideoPlayer } from '@/components/VideoPlayer';
import { PromoPopup } from '@/components/PromoPopup';
import { channels, Channel } from '@/data/channels';
import { useToast } from '@/hooks/use-toast';
import { useCustomChannels } from '@/hooks/useCustomChannels';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye, EyeOff, Facebook } from 'lucide-react';

const Channels = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const { customChannels, deleteCustomChannel } = useCustomChannels();
  const { toast } = useToast();

  // Combine static and custom channels
  const allChannels = useMemo(() => {
    return [...channels, ...customChannels];
  }, [customChannels]);

  const filteredChannels = useMemo(() => {
    return allChannels.filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
      const isHidden = hiddenChannels.has(channel.name);
      
      if (showHidden) {
        return matchesSearch && isHidden;
      } else {
        return matchesSearch && !isHidden;
      }
    });
  }, [searchTerm, hiddenChannels, showHidden, allChannels]);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    toast({
      title: "Loading Channel",
      description: `Starting ${channel.name}...`,
    });
  };

  const handleClosePlayer = () => {
    setSelectedChannel(null);
  };

  const handleToggleHide = (channelName: string) => {
    const newHiddenChannels = new Set(hiddenChannels);
    if (newHiddenChannels.has(channelName)) {
      newHiddenChannels.delete(channelName);
      toast({
        title: "Channel Shown",
        description: `${channelName} is now visible`,
      });
    } else {
      newHiddenChannels.add(channelName);
      toast({
        title: "Channel Hidden",
        description: `${channelName} has been hidden`,
      });
    }
    setHiddenChannels(newHiddenChannels);
  };

  const handleDeleteChannel = (channelName: string) => {
    deleteCustomChannel(channelName);
  };

  return (
    <div className="min-h-screen bg-background">
      <PromoPopup />
      {/* Search and Filter Section */}
      <div className="bg-card border-b border-border p-4">
        <div className="container mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Hide/Show Toggle */}
            <Button
              variant={showHidden ? "default" : "outline"}
              onClick={() => setShowHidden(!showHidden)}
              className="flex items-center gap-2"
            >
              {showHidden ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hidden Channels ({hiddenChannels.size})
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  All Channels
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-200px)]">
          {/* Video Player */}
          <div className="w-full lg:w-2/3 flex-shrink-0">
            <div className="sticky top-6">
              <VideoPlayer
                channel={selectedChannel}
                onClose={handleClosePlayer}
              />
            </div>
          </div>

          {/* Channel List */}
          <div className="w-full lg:w-1/3 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  All Channels
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
              <ChannelGrid
                channels={filteredChannels}
                onChannelSelect={handleChannelSelect}
                onToggleHide={handleToggleHide}
                onDelete={handleDeleteChannel}
                hiddenChannels={hiddenChannels}
                customChannels={customChannels}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            flameiptv
          </p>
          
          {/* Promo Load Section */}
          <div className="mt-6 p-6 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-accent mb-4">⊰DISCOUNTED PROMO LOAD FOR SMART &TNT⊱</h3>
            
            <div className="text-left space-y-3 text-sm">
              <div className="p-3 bg-background/50 rounded border border-border/50">
                <p className="font-semibold text-primary">✩All Access 99 (smart & tnt user only)</p>
                <p className="text-muted-foreground">- 7GB all apps + 2GB FB</p>
                <p className="text-muted-foreground">- 15 days</p>
                <p className="font-medium text-accent">• ₱65</p>
              </div>
              
              <div className="p-3 bg-background/50 rounded border border-border/50">
                <p className="font-semibold text-primary">✩Power All 99 FB/TIKTOK (smart user only)</p>
                <p className="text-muted-foreground">- 10GB data + unli FB/TikTok</p>
                <p className="text-muted-foreground">- Unli call & text</p>
                <p className="text-muted-foreground">- 7 days</p>
                <p className="font-medium text-accent">•₱65</p>
              </div>
              
              <div className="p-3 bg-background/50 rounded border border-border/50">
                <p className="font-semibold text-primary">✩Saya All 99 (tnt user only)</p>
                <p className="text-muted-foreground">- 6GB + unli FB, ML, TikTok</p>
                <p className="text-muted-foreground">- Unli call & text</p>
                <p className="text-muted-foreground">- 7 days</p>
                <p className="font-medium text-accent">• ₱65</p>
              </div>
              
              <div className="p-3 bg-background/50 rounded border border-border/50">
                <p className="font-semibold text-primary">✩Power all 149 FB/TIKTOK (smart user only)</p>
                <p className="text-muted-foreground">- 16gb + Unli 5g</p>
                <p className="text-muted-foreground">- Unli FB/TikTok</p>
                <p className="text-muted-foreground">- Unli call & text</p>
                <p className="text-muted-foreground">- 7 days</p>
                <p className="font-medium text-accent">• ₱145</p>
              </div>
              
              <div className="p-3 bg-background/50 rounded border border-border/50">
                <p className="font-semibold text-primary">✩Saya all 149 (tnt user only)</p>
                <p className="text-muted-foreground">- 12gb + Unli 5g</p>
                <p className="text-muted-foreground">- Unli FB/TikTok/MLBB</p>
                <p className="text-muted-foreground">- Unli call & text</p>
                <p className="text-muted-foreground">- 7 days</p>
                <p className="font-medium text-accent">• ₱145</p>
              </div>
              
              <div className="p-3 bg-background/50 rounded border border-border/50">
                <p className="font-semibold text-primary">✩Tiktok Saya 50 (tnt user only)</p>
                <p className="text-muted-foreground">- 3gb all apps & sites</p>
                <p className="text-muted-foreground">- Unli call & text</p>
                <p className="text-muted-foreground">- 3 days</p>
                <p className="font-medium text-accent">• ₱45</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-primary/10 rounded border border-primary/20">
              <p className="font-medium text-primary">PM ME TO AVAIL THE DISCOUNTED PROMO LOAD.</p>
              <div className="mt-2 flex justify-center">
                <a 
                  href="https://www.facebook.com/share/1FJiMs1jEJ/"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20 max-w-md mx-auto">
            <p className="text-sm font-medium text-primary">💰 GCASH: 09310799262</p>
            <p className="text-xs text-muted-foreground mt-1">Support the stream</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Channels;