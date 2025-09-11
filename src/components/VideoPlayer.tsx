import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, List } from 'lucide-react';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Channel } from '@/data/channels';
import { StreamSelector } from './StreamSelector';

// Declare shaka as a global variable (loaded via script tag)
declare global {
  interface Window {
    shaka: any;
  }
}

interface VideoPlayerProps {
  channel: Channel | null;
  onClose: () => void;
}

export const VideoPlayer = ({ channel, onClose }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qualities, setQualities] = useState<any[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [showStreamSelector, setShowStreamSelector] = useState(false);
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState<string>('');

  useEffect(() => {
    // Load Shaka Player script dynamically
    const loadShaka = async () => {
      if (!window.shaka) {
        const script = document.createElement('script');
        script.src = 'https://ajax.googleapis.com/ajax/libs/shaka-player/4.3.6/shaka-player.compiled.js';
        script.onload = () => {
          if (window.shaka) {
            // Install built-in polyfills to patch browser incompatibilities
            window.shaka.polyfill.installAll();

            if (!window.shaka.Player.isBrowserSupported()) {
              setError('Browser not supported');
            }
          }
        };
        document.head.appendChild(script);
      } else {
        // Shaka is already loaded
        window.shaka.polyfill.installAll();
        if (!window.shaka.Player.isBrowserSupported()) {
          setError('Browser not supported');
        }
      }
    };

    loadShaka();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const loadChannel = async () => {
      if (!videoRef.current) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // Clean up previous player
        if (playerRef.current) {
          await playerRef.current.destroy();
        }

        // For YouTube channels, handle stream selection
        if (channel.type === 'youtube') {
          // Check if channel has multiple streams capability
          if (channel.hasMultipleStreams && channel.youtubeChannelId) {
            setShowStreamSelector(true);
          } else {
            setCurrentEmbedUrl(channel.embedUrl || '');
          }
          setIsLoading(false);
          return;
        }

        // Wait for Shaka to be available
        if (!window.shaka) {
          setError('Shaka Player not loaded');
          setIsLoading(false);
          return;
        }

        // Create new player
        const player = new window.shaka.Player(videoRef.current);
        playerRef.current = player;

        // Configure DRM if clearKey is provided
        if (channel.clearKey) {
          player.configure({
            drm: {
              clearKeys: channel.clearKey
            }
          });
        }

        // Load the manifest
        await player.load(channel.manifestUri);
        
        // Get available video tracks for quality selection
        const tracks = player.getVariantTracks();
        const uniqueQualities = tracks
          .filter((track: any) => track.height)
          .map((track: any) => ({
            id: track.id,
            height: track.height,
            bandwidth: track.bandwidth,
            label: `${track.height}p`
          }))
          .sort((a: any, b: any) => b.height - a.height);
        
        setQualities([{ id: 'auto', label: 'Auto' }, ...uniqueQualities]);
        setIsLoading(false);
        
        // Auto play
        if (videoRef.current) {
          videoRef.current.play();
          setIsPlaying(true);
        }

      } catch (err) {
        console.error('Error loading channel:', err);
        setError(`Failed to load ${channel.name}`);
        setIsLoading(false);
      }
    };

    loadChannel();
  }, [channel]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      videoRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleQualityChange = (qualityId: string) => {
    if (!playerRef.current) return;
    
    setSelectedQuality(qualityId);
    
    if (qualityId === 'auto') {
      playerRef.current.configure({ abr: { enabled: true } });
    } else {
      playerRef.current.configure({ abr: { enabled: false } });
      const tracks = playerRef.current.getVariantTracks();
      const selectedTrack = tracks.find((track: any) => track.id.toString() === qualityId);
      if (selectedTrack) {
        playerRef.current.selectVariantTrack(selectedTrack, true);
      }
    }
  };

  const handleStreamSelect = (stream: any) => {
    setCurrentEmbedUrl(stream.embedUrl);
    setShowStreamSelector(false);
  };

  const handleShowStreamSelector = () => {
    if (channel?.youtubeChannelId) {
      setShowStreamSelector(true);
    }
  };

  // If showing stream selector, render it instead of video player
  if (showStreamSelector && channel?.youtubeChannelId) {
    return (
      <div className="w-full aspect-video">
        <StreamSelector
          channelId={channel.youtubeChannelId}
          channelName={channel.name}
          onStreamSelect={handleStreamSelect}
          onClose={() => setShowStreamSelector(false)}
        />
      </div>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-elegant border-primary/20 overflow-hidden w-full">
      {!channel ? (
        <div className="aspect-video bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="bg-muted/20 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Select a Channel</h3>
            <p className="text-sm text-muted-foreground">Choose a channel from the list to start watching</p>
          </div>
        </div>
      ) : (
        <div className="relative bg-black w-full aspect-video">
        {/* YouTube Embed */}
        {channel.type === 'youtube' && (currentEmbedUrl || channel.embedUrl) ? (
          <div className="relative w-full h-full">
            <iframe
              src={`${currentEmbedUrl || channel.embedUrl}&autoplay=1&mute=0`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            {/* Stream Selector Button for YouTube channels with multiple streams */}
            {channel.hasMultipleStreams && channel.youtubeChannelId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowStreamSelector}
                className="absolute top-4 left-4 text-white bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                title="Select different stream"
              >
                <List className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Video Element */}
            <video
              ref={videoRef}
              className="w-full h-full"
              controls={false}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadStart={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
            />

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center animate-fade-in">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-accent rounded-full animate-spin" style={{ animationDelay: '150ms' }}></div>
                </div>
                <div className="mt-6 text-center animate-pulse">
                  <h3 className="text-white font-semibold text-lg mb-2">Loading {channel.name}</h3>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {error && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center animate-fade-in">
                <div className="text-center text-white">
                  <p className="text-lg font-semibold mb-2">Playback Error</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            )}

            {/* Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {qualities.length > 1 && (
                    <Select value={selectedQuality} onValueChange={handleQualityChange}>
                      <SelectTrigger className="w-20 h-8 bg-black/60 border-white/20 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/20">
                        {qualities.map((quality) => (
                          <SelectItem 
                            key={quality.id} 
                            value={quality.id.toString()}
                            className="text-white focus:bg-white/20"
                          >
                            {quality.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                  >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Close Button - only show when channel is selected */}
        {channel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            ✕
          </Button>
        )}
      </div>
      )}
    </Card>
  );
};