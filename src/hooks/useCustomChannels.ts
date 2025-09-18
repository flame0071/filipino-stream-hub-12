import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CustomChannel {
  id?: string;
  name: string;
  manifestUri: string;
  type: 'hls' | 'mpd' | 'youtube';
  logo: string;
  category?: string;
  clearKey?: Record<string, string>;
  embedUrl?: string;
  youtubeChannelId?: string;
  hasMultipleStreams?: boolean;
}

export const useCustomChannels = () => {
  const [customChannels, setCustomChannels] = useState<CustomChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadCustomChannels = async () => {
    setIsLoading(true);
    
    try {
      // Load from localStorage first
      const localChannels: CustomChannel[] = JSON.parse(localStorage.getItem('customChannels') || '[]');
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Load from Supabase for authenticated users
        const { data: supabaseChannels, error } = await supabase
          .from('custom_channels')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error loading channels from Supabase:', error);
          // Fall back to localStorage if Supabase fails
          setCustomChannels(localChannels);
        } else {
          // Convert Supabase format to local format
          const convertedChannels: CustomChannel[] = supabaseChannels.map(channel => ({
            id: channel.id,
            name: channel.name,
            manifestUri: channel.manifest_uri,
            type: channel.type as 'hls' | 'mpd' | 'youtube',
            logo: channel.logo,
            category: channel.category || 'Custom',
            clearKey: channel.clear_key as Record<string, string> | undefined,
            embedUrl: channel.embed_url || undefined,
            youtubeChannelId: channel.youtube_channel_id || undefined,
            hasMultipleStreams: channel.has_multiple_streams || false
          }));
          
          setCustomChannels(convertedChannels);
          
          // Migrate local channels to Supabase if they don't exist there
          if (localChannels.length > 0 && supabaseChannels.length === 0) {
            await migrateLocalChannels(localChannels);
          }
        }
      } else {
        // Use localStorage for non-authenticated users
        setCustomChannels(localChannels);
      }
    } catch (error) {
      console.error('Error loading custom channels:', error);
      // Fall back to localStorage
      const localChannels: CustomChannel[] = JSON.parse(localStorage.getItem('customChannels') || '[]');
      setCustomChannels(localChannels);
    } finally {
      setIsLoading(false);
    }
  };

  const migrateLocalChannels = async (localChannels: CustomChannel[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const channelsToInsert = localChannels.map(channel => ({
        user_id: session.user.id,
        name: channel.name,
        manifest_uri: channel.manifestUri,
        type: channel.type,
        logo: channel.logo,
        category: channel.category || 'Custom',
        clear_key: channel.clearKey || null,
        embed_url: channel.embedUrl || null,
        youtube_channel_id: channel.youtubeChannelId || null,
        has_multiple_streams: channel.hasMultipleStreams || false
      }));

      const { error } = await supabase
        .from('custom_channels')
        .insert(channelsToInsert);

      if (error) {
        console.error('Error migrating channels to Supabase:', error);
      } else {
        console.log('Successfully migrated channels to Supabase');
        // Clear localStorage after successful migration
        localStorage.removeItem('customChannels');
      }
    } catch (error) {
      console.error('Error during migration:', error);
    }
  };

  const addCustomChannel = async (channel: Omit<CustomChannel, 'id'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Save to Supabase for authenticated users
        const { data, error } = await supabase
          .from('custom_channels')
          .insert({
            user_id: session.user.id,
            name: channel.name,
            manifest_uri: channel.manifestUri,
            type: channel.type,
            logo: channel.logo,
            category: channel.category || 'Custom',
            clear_key: channel.clearKey || null,
            embed_url: channel.embedUrl || null,
            youtube_channel_id: channel.youtubeChannelId || null,
            has_multiple_streams: channel.hasMultipleStreams || false
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Add to local state
        const newChannel: CustomChannel = {
          id: data.id,
          name: data.name,
          manifestUri: data.manifest_uri,
          type: data.type as 'hls' | 'mpd' | 'youtube',
          logo: data.logo,
          category: data.category || 'Custom',
          clearKey: data.clear_key as Record<string, string> | undefined,
          embedUrl: data.embed_url || undefined,
          youtubeChannelId: data.youtube_channel_id || undefined,
          hasMultipleStreams: data.has_multiple_streams || false
        };

        setCustomChannels(prev => [newChannel, ...prev]);
        
        toast({
          title: "Channel Added Successfully!",
          description: `${channel.name} has been saved to your account`,
        });
      } else {
        // Save to localStorage for non-authenticated users
        const existingChannels = JSON.parse(localStorage.getItem('customChannels') || '[]');
        const updatedChannels = [channel, ...existingChannels];
        localStorage.setItem('customChannels', JSON.stringify(updatedChannels));
        setCustomChannels(updatedChannels);
        
        toast({
          title: "Channel Added Successfully!",
          description: `${channel.name} has been added locally`,
        });
      }
    } catch (error) {
      console.error('Error adding channel:', error);
      toast({
        title: "Error Adding Channel",
        description: "Failed to save channel. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadCustomChannels();

    // Listen for auth state changes to reload channels
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadCustomChannels();
    });

    return () => subscription.unsubscribe();
  }, []);

  const deleteCustomChannel = async (channelName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Delete from Supabase for authenticated users
        const { error } = await supabase
          .from('custom_channels')
          .delete()
          .eq('name', channelName)
          .eq('user_id', session.user.id);

        if (error) {
          throw error;
        }

        // Remove from local state
        setCustomChannels(prev => prev.filter(channel => channel.name !== channelName));
        
        toast({
          title: "Channel Deleted",
          description: `${channelName} has been removed from your account`,
        });
      } else {
        // Delete from localStorage for non-authenticated users
        const existingChannels = JSON.parse(localStorage.getItem('customChannels') || '[]');
        const updatedChannels = existingChannels.filter((channel: CustomChannel) => channel.name !== channelName);
        localStorage.setItem('customChannels', JSON.stringify(updatedChannels));
        setCustomChannels(updatedChannels);
        
        toast({
          title: "Channel Deleted",
          description: `${channelName} has been removed locally`,
        });
      }
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast({
        title: "Error Deleting Channel",
        description: "Failed to delete channel. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateCustomChannel = async (channelName: string, updatedData: Omit<CustomChannel, 'id' | 'user_id'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Update in Supabase
        const { error } = await supabase
          .from('custom_channels')
          .update({
            name: updatedData.name,
            manifest_uri: updatedData.manifestUri,
            type: updatedData.type,
            logo: updatedData.logo,
            embed_url: updatedData.embedUrl,
            category: updatedData.category,
            clear_key: updatedData.clearKey,
          })
          .eq('name', channelName);

        if (error) {
          console.error('Error updating channel in Supabase:', error);
          throw error;
        }
      } else {
        // Update in localStorage
        const stored = localStorage.getItem('customChannels');
        if (stored) {
          const channels: CustomChannel[] = JSON.parse(stored);
          const channelIndex = channels.findIndex(ch => ch.name === channelName);
          
          if (channelIndex !== -1) {
            channels[channelIndex] = {
              ...channels[channelIndex],
              ...updatedData,
            };
            localStorage.setItem('customChannels', JSON.stringify(channels));
          }
        }
      }

      // Reload channels to reflect changes
      await loadCustomChannels();
    } catch (error) {
      console.error('Error updating custom channel:', error);
      throw error;
    }
  };

  return {
    customChannels,
    isLoading,
    addCustomChannel,
    updateCustomChannel,
    deleteCustomChannel,
    reloadChannels: loadCustomChannels
  };
};