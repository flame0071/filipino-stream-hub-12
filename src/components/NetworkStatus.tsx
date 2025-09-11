import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const NetworkStatus = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm animate-fade-in">
      <WifiOff className="w-4 h-4 inline mr-2" />
      You're offline. Some features may not be available.
    </div>
  );
};