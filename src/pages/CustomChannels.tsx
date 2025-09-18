import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddChannelForm } from '@/components/AddChannelForm';
import { EditChannelForm } from '@/components/EditChannelForm';
import { ChannelGrid } from '@/components/ChannelGrid';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useCustomChannels } from '@/hooks/useCustomChannels';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Tv } from 'lucide-react';
import { Channel } from '@/data/channels';

const CustomChannels = () => {
  const { customChannels, isLoading, deleteCustomChannel, reloadChannels } = useCustomChannels();
  const { isAdminOrModerator } = useUserRole();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredChannels = customChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (channel.category && channel.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    toast({
      title: "Playing Channel",
      description: `Now playing: ${channel.name}`,
    });
  };

  const handleClosePlayer = () => {
    setSelectedChannel(null);
  };

  const handleDeleteChannel = (channelName: string) => {
    deleteCustomChannel(channelName);
  };

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel);
  };

  const handleEditComplete = () => {
    setEditingChannel(null);
    reloadChannels();
    toast({
      title: "Channel Updated",
      description: "The channel has been successfully updated.",
    });
  };

  const handleEditCancel = () => {
    setEditingChannel(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-primary-foreground">Loading your channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            My Custom Channels
          </h1>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            Manage and watch your personally added IPTV channels
          </p>
        </div>

        {/* Video Player */}
        {selectedChannel && (
          <div className="mb-8">
            <VideoPlayer
              channel={selectedChannel}
              onClose={handleClosePlayer}
            />
          </div>
        )}

        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search your channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border/30"
            />
          </div>
          <div className="flex items-center gap-4 text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4" />
              <span className="text-sm">
                {filteredChannels.length} channel{filteredChannels.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Channels Grid */}
        {filteredChannels.length > 0 ? (
          <ChannelGrid
            channels={filteredChannels}
            onChannelSelect={handleChannelSelect}
            onDelete={handleDeleteChannel}
            onEdit={isAdminOrModerator ? handleEditChannel : undefined}
            hiddenChannels={new Set()}
            customChannels={customChannels}
          />
        ) : customChannels.length === 0 ? (
          /* Empty State - No Channels */
          <Card className="bg-gradient-card border-border/30 backdrop-blur-sm max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="bg-accent/10 p-4 rounded-full w-fit mx-auto mb-4">
                <Plus className="w-12 h-12 text-accent" />
              </div>
              <CardTitle className="text-xl text-foreground">No Custom Channels Yet</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                You haven't added any custom channels yet. Start by adding your first IPTV channel below!
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Add M3U8 stream links</p>
                <p>• Customize channel names and logos</p>
                <p>• Access your channels anywhere</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* No Search Results */
          <Card className="bg-gradient-card border-border/30 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No channels found</h3>
              <p className="text-muted-foreground">
                No channels match your search "{searchTerm}"
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="mt-4"
              >
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add Channel Section */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
              Add New Channel
            </h2>
            <p className="text-primary-foreground/70">
              Expand your collection with more IPTV channels
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <AddChannelForm />
          </div>
        </section>

        {/* Edit Channel Dialog */}
        <Dialog open={!!editingChannel} onOpenChange={() => setEditingChannel(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Channel</DialogTitle>
            </DialogHeader>
            {editingChannel && (
              <EditChannelForm
                channel={editingChannel}
                onChannelUpdated={handleEditComplete}
                onCancel={handleEditCancel}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomChannels;