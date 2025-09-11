import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useRecentlyWatched } from '@/hooks/useRecentlyWatched';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl: string;
  contentId?: number;
  contentType?: 'movie' | 'tv';
  posterPath?: string;
  overview?: string;
}

export const VideoModal = ({ 
  isOpen, 
  onClose, 
  title, 
  videoUrl, 
  contentId, 
  contentType, 
  posterPath, 
  overview 
}: VideoModalProps) => {
  const { updateProgress } = useRecentlyWatched();
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Track progress every 30 seconds
  useEffect(() => {
    if (isOpen && contentId && contentType) {
      let startTime = Date.now();
      const estimatedDuration = 90 * 60 * 1000; // Assume 90 minutes for movies/episodes
      
      // Save initial progress immediately when starting
      updateProgress(
        contentId,
        contentType,
        title,
        0.06, // Start with 6% to ensure it shows in Continue Watching
        estimatedDuration / 1000,
        posterPath,
        overview
      );
      
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / estimatedDuration) + 0.06, 0.95); // Add initial 6% + elapsed time, cap at 95%
        
        updateProgress(
          contentId,
          contentType,
          title,
          progress,
          estimatedDuration / 1000,
          posterPath,
          overview
        );
      }, 30000); // Update every 30 seconds
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isOpen, contentId, contentType, title, posterPath, overview, updateProgress]);

  const handleClose = () => {
    // Save final progress when closing
    if (contentId && contentType && progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl w-full h-[80vh] p-0">
        <div className="w-full h-full">
          <iframe
            ref={iframeRef}
            src={videoUrl}
            title={title}
            className="w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};