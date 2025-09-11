import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface RecentlyWatchedItem {
  id: string;
  content_id: number;
  title: string;
  content_type: 'movie' | 'tv';
  poster_path?: string;
  overview?: string;
  progress: number;
  duration?: number;
  watched_at: string;
}

export const useRecentlyWatched = () => {
  const [items, setItems] = useState<RecentlyWatchedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecentlyWatched = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('recently_watched')
        .select('*')
        .eq('user_id', user.id)
        .gt('progress', 0.05) // Only show items with more than 5% progress
        .lt('progress', 0.95) // Only show items with less than 95% progress (not completed)
        .order('watched_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setItems((data || []).map(item => ({
        ...item,
        content_type: item.content_type as 'movie' | 'tv'
      })));
    } catch (error) {
      console.error('Error fetching recently watched:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (
    contentId: number,
    contentType: 'movie' | 'tv',
    title: string,
    progress: number,
    duration?: number,
    posterPath?: string,
    overview?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('recently_watched')
        .upsert({
          user_id: user.id,
          content_id: contentId,
          content_type: contentType,
          title,
          progress,
          duration,
          poster_path: posterPath,
          overview,
          watched_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,content_id,content_type'
        });

      if (error) throw error;
      
      // Refresh the list
      fetchRecentlyWatched();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recently_watched')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Removed",
        description: "Item removed from continue watching",
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRecentlyWatched();
  }, []);

  return {
    items,
    isLoading,
    updateProgress,
    removeItem,
    refetch: fetchRecentlyWatched,
  };
};