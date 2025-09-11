import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OnlineUser {
  user_id: string;
  country_code: string;
  country_name: string;
  online_at: string;
}

interface CountryStats {
  [countryCode: string]: {
    name: string;
    count: number;
  };
}

export const useOnlineUsers = () => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [countryStats, setCountryStats] = useState<CountryStats>({});

  useEffect(() => {
    const channel = supabase.channel('online-users');

    // Function to update stats from presence state
    const updateStats = (state: any) => {
      const users = Object.values(state).flat() as OnlineUser[];
      setOnlineCount(users.length);

      // Count users by country
      const stats: CountryStats = {};
      users.forEach(user => {
        const code = user.country_code || 'PH';
        const name = user.country_name || 'Philippines';
        
        if (!stats[code]) {
          stats[code] = { name, count: 0 };
        }
        stats[code].count++;
      });
      
      setCountryStats(stats);
    };

    // Subscribe to presence events
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        updateStats(state);
      })
      .on('presence', { event: 'join' }, () => {
        const state = channel.presenceState();
        updateStats(state);
      })
      .on('presence', { event: 'leave' }, () => {
        const state = channel.presenceState();
        updateStats(state);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            // Get user's location
            const { data: locationData } = await supabase.functions.invoke('get-user-location');
            
            // Track this user as online with location
            const userId = Math.random().toString(36).substring(7);
            await channel.track({
              user_id: userId,
              country_code: locationData?.country_code || 'PH',
              country_name: locationData?.country_name || 'Philippines',
              online_at: new Date().toISOString(),
            });
          } catch (error) {
            console.error('Error getting location:', error);
            // Fallback to Philippines
            const userId = Math.random().toString(36).substring(7);
            await channel.track({
              user_id: userId,
              country_code: 'PH',
              country_name: 'Philippines',
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { onlineCount, countryStats };
};