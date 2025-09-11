import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Link, Play } from 'lucide-react';
import { useCustomChannels, type CustomChannel } from '@/hooks/useCustomChannels';

interface ChannelFormData {
  name: string;
  manifestUri: string;
  type: 'mpd' | 'hls' | 'youtube';
  logo: string;
  embedUrl?: string;
  category?: string;
  clearKey?: string;
}

interface AddChannelFormProps {
  onChannelAdded?: (channel: CustomChannel) => void;
}

const AddChannelForm = ({ onChannelAdded }: AddChannelFormProps) => {
  const [formData, setFormData] = useState<ChannelFormData>({
    name: '',
    manifestUri: '',
    type: 'hls',
    logo: '',
    category: '',
    clearKey: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addCustomChannel } = useCustomChannels();
  const { toast } = useToast();

  const handleInputChange = (field: keyof ChannelFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'type' && value === 'youtube' ? { embedUrl: prev.manifestUri } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.manifestUri || !formData.logo) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Process YouTube URL to get embed format
    let processedUrl = formData.manifestUri;
    let embedUrl = '';
    let youtubeChannelId = '';
    let hasMultipleStreams = false;
    
    if (formData.type === 'youtube') {
      // Handle different YouTube URL formats
      if (formData.manifestUri.includes('youtube.com/channel/')) {
        youtubeChannelId = formData.manifestUri.split('/channel/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/live_stream?channel=${youtubeChannelId}`;
        hasMultipleStreams = true; // Enable multi-stream detection for channel URLs
      } else if (formData.manifestUri.includes('embed/live_stream?channel=')) {
        const urlParams = new URLSearchParams(formData.manifestUri.split('?')[1]);
        youtubeChannelId = urlParams.get('channel') || '';
        embedUrl = formData.manifestUri;
        hasMultipleStreams = true; // Enable multi-stream detection for embed URLs
      } else if (formData.manifestUri.includes('youtu.be/') || formData.manifestUri.includes('youtube.com/watch')) {
        // For regular YouTube video URLs, use as-is for embed
        embedUrl = formData.manifestUri.replace('youtu.be/', 'www.youtube.com/embed/').replace('watch?v=', 'embed/');
        hasMultipleStreams = false; // Individual videos don't have multiple streams
      } else {
        embedUrl = formData.manifestUri;
      }
    }

    // Process clearKey for MPD streams
    let processedClearKey: Record<string, string> | undefined = undefined;
    if (formData.type === 'mpd' && formData.clearKey && formData.clearKey.trim()) {
      try {
        console.log('Processing clearKey:', formData.clearKey);
        
        // Convert clearKey from "keyId:key" format to object format expected by Shaka Player
        const [keyId, key] = formData.clearKey.split(':');
        if (keyId && key && keyId.trim().length > 0 && key.trim().length > 0) {
          processedClearKey = { [keyId.trim()]: key.trim() };
          console.log('ClearKey converted successfully:', processedClearKey);
        } else {
          console.error('Invalid clearKey format. Expected format: "keyId:key"');
          toast({
            title: "Invalid Clear Key Format",
            description: "Please use format: keyId:key (e.g., 436b69f987924fcbbc06d40a69c2799a:c63d5b0d7e52335b61aeba4f6537d54d)",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        console.error('Error processing clearKey:', error);
        toast({
          title: "Clear Key Processing Error",
          description: "Failed to process the clear key. Please check the format.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Create new channel object
    const newChannel: Omit<CustomChannel, 'id'> = {
      name: formData.name,
      manifestUri: processedUrl,
      type: formData.type,
      logo: formData.logo,
      category: formData.category || 'Custom',
      ...(processedClearKey ? { clearKey: processedClearKey } : {}),
      ...(formData.type === 'youtube' ? { 
        embedUrl,
        ...(youtubeChannelId ? { youtubeChannelId } : {}),
        hasMultipleStreams 
      } : {})
    };

    // Save using the hook (handles both localStorage and Supabase)
    try {
      await addCustomChannel(newChannel);
      
      if (onChannelAdded) {
        onChannelAdded(newChannel as CustomChannel);
      }
      
      // Reset form
      setFormData({
        name: '',
        manifestUri: '',
        type: 'hls',
        logo: '',
        category: '',
        clearKey: ''
      });
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to add channel:', error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card className="bg-gradient-card border-border/30 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-foreground">
          <Plus className="w-5 h-5 text-accent" />
          Add Your Own Channel
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Add IPTV channels from M3U8, MPD, or YouTube sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name" className="text-foreground">Channel Name *</Label>
              <Input
                id="channel-name"
                placeholder="e.g., CNN International"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="channel-type" className="text-foreground">Stream Type *</Label>
              <Select value={formData.type} onValueChange={(value: 'mpd' | 'hls' | 'youtube') => handleInputChange('type', value)}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hls">M3U8 (HLS)</SelectItem>
                  <SelectItem value="mpd">DASH (MPD)</SelectItem>
                  <SelectItem value="youtube">YouTube Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stream-url" className="text-foreground flex items-center gap-2">
              <Link className="w-4 h-4" />
              Stream URL *
            </Label>
            <Input
              id="stream-url"
              placeholder={
                formData.type === 'youtube' 
                  ? "https://www.youtube.com/channel/UCxxxxxx or https://www.youtube.com/embed/live_stream?channel=UCxxxxxx"
                  : formData.type === 'mpd'
                  ? "https://example.com/stream.mpd"
                  : "https://example.com/stream.m3u8"
              }
              value={formData.manifestUri}
              onChange={(e) => handleInputChange('manifestUri', e.target.value)}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo-url" className="text-foreground">Logo URL *</Label>
            <Input
              id="logo-url"
              placeholder="https://example.com/channel-logo.png"
              value={formData.logo}
              onChange={(e) => handleInputChange('logo', e.target.value)}
              className="bg-background/50"
            />
          </div>

          {formData.type === 'mpd' && (
            <div className="space-y-2">
              <Label htmlFor="clear-key" className="text-foreground">Clear Key (for encrypted MPD)</Label>
              <Input
                id="clear-key"
                placeholder="Format: keyId:key (e.g., 436b69f987924fcbbc06d40a69c2799a:c63d5b0d7e52335b61aeba4f6537d54d)"
                value={formData.clearKey}
                onChange={(e) => handleInputChange('clearKey', e.target.value)}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter in format: keyId:key - This will be converted to proper object format for Shaka Player
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground">Category (Optional)</Label>
            <Input
              id="category"
              placeholder="e.g., News, Sports, Entertainment"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="bg-background/50"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Adding Channel...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Add Channel
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setFormData({
                name: '',
                manifestUri: '',
                type: 'hls',
                logo: '',
                category: '',
                clearKey: ''
              })}
              className="border-primary/20 hover:bg-primary/10"
            >
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export { AddChannelForm };