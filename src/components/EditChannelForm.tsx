import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomChannels } from '@/hooks/useCustomChannels';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, X } from 'lucide-react';
import { Channel } from '@/data/channels';

interface EditChannelFormProps {
  channel: Channel;
  onChannelUpdated?: () => void;
  onCancel: () => void;
}

interface ChannelFormData {
  name: string;
  manifestUri: string;
  type: 'hls' | 'mpd' | 'youtube';
  logo: string;
  embedUrl?: string;
  category?: string;
  clearKey?: string;
}

export const EditChannelForm = ({ channel, onChannelUpdated, onCancel }: EditChannelFormProps) => {
  const { updateCustomChannel } = useCustomChannels();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ChannelFormData>({
    name: channel.name,
    manifestUri: channel.manifestUri,
    type: (channel.type as 'hls' | 'mpd' | 'youtube') || 'hls',
    logo: channel.logo || '',
    embedUrl: channel.embedUrl || '',
    category: channel.category || 'Custom',
    clearKey: '',
  });

  useEffect(() => {
    // Parse clear key if it exists in channel data
    if (channel.clearKey) {
      try {
        const clearKeyData = typeof channel.clearKey === 'string' 
          ? JSON.parse(channel.clearKey) 
          : channel.clearKey;
        if (clearKeyData?.keyId && clearKeyData?.key) {
          setFormData(prev => ({
            ...prev,
            clearKey: `${clearKeyData.keyId}:${clearKeyData.key}`
          }));
        }
      } catch (error) {
        console.error('Error parsing clear key:', error);
      }
    }
  }, [channel]);

  const handleInputChange = (field: keyof ChannelFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.manifestUri.trim()) {
      toast({
        title: "Validation Error",
        description: "Channel name and stream URL are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let processedData = { ...formData };

      // Process YouTube URL if type is YouTube
      if (formData.type === 'youtube' && formData.manifestUri.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(formData.manifestUri.split('?')[1]);
        const videoId = urlParams.get('v');
        if (videoId) {
          processedData.embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // Process clear key for MPD streams
      let clearKeyData = null;
      if (formData.type === 'mpd' && formData.clearKey?.trim()) {
        const [keyId, key] = formData.clearKey.split(':');
        if (keyId && key) {
          clearKeyData = { keyId: keyId.trim(), key: key.trim() };
        }
      }

      const channelData = {
        name: processedData.name.trim(),
        manifestUri: processedData.manifestUri.trim(),
        type: processedData.type,
        logo: processedData.logo.trim(),
        embedUrl: processedData.embedUrl?.trim() || undefined,
        category: processedData.category || 'Custom',
        clearKey: clearKeyData,
      };

      await updateCustomChannel(channel.name, channelData);

      toast({
        title: "Channel Updated",
        description: `${channelData.name} has been successfully updated.`,
      });

      onChannelUpdated?.();
    } catch (error) {
      console.error('Error updating channel:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update the channel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-foreground flex items-center gap-2">
          <Save className="w-5 h-5" />
          Edit Channel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Channel Name *
              </label>
              <Input
                type="text"
                placeholder="Enter channel name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-background/50 border-border/30"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Stream Type *
              </label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'hls' | 'mpd' | 'youtube') => handleInputChange('type', value)}
              >
                <SelectTrigger className="bg-background/50 border-border/30">
                  <SelectValue placeholder="Select stream type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hls">HLS (.m3u8)</SelectItem>
                  <SelectItem value="mpd">MPD (DASH)</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Stream URL *
            </label>
            <Input
              type="url"
              placeholder={
                formData.type === 'youtube' 
                  ? "https://www.youtube.com/watch?v=..." 
                  : formData.type === 'hls'
                  ? "https://example.com/stream.m3u8"
                  : "https://example.com/stream.mpd"
              }
              value={formData.manifestUri}
              onChange={(e) => handleInputChange('manifestUri', e.target.value)}
              className="bg-background/50 border-border/30"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Logo URL
              </label>
              <Input
                type="url"
                placeholder="https://example.com/logo.png"
                value={formData.logo}
                onChange={(e) => handleInputChange('logo', e.target.value)}
                className="bg-background/50 border-border/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <Input
                type="text"
                placeholder="Custom"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="bg-background/50 border-border/30"
              />
            </div>
          </div>

          {formData.type === 'mpd' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Clear Key (Optional)
              </label>
              <Input
                type="text"
                placeholder="keyId:key (e.g., abcd1234:5678efgh)"
                value={formData.clearKey}
                onChange={(e) => handleInputChange('clearKey', e.target.value)}
                className="bg-background/50 border-border/30"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: keyId:key (for encrypted MPD streams)
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Channel
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};