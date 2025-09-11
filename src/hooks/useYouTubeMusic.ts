import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration?: string;
}

export const useYouTubeMusic = () => {
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const { toast } = useToast();

  const searchVideos = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-search', {
        body: { query }
      });

      if (error) throw error;

      setVideos(data.videos || []);
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    searchVideos,
    videos,
    loading
  };
};