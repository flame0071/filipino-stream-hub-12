import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user');
        } else if (roles && roles.length > 0) {
          // If user has admin role, prioritize it
          const hasAdmin = roles.some(r => r.role === 'admin');
          const hasModerator = roles.some(r => r.role === 'moderator');
          
          if (hasAdmin) {
            setUserRole('admin');
          } else if (hasModerator) {
            setUserRole('moderator');
          } else {
            setUserRole('user');
          }
        } else {
          setUserRole('user');
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setUserRole('user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator';
  const isAdminOrModerator = isAdmin || isModerator;

  return {
    userRole,
    isLoading,
    isAdmin,
    isModerator,
    isAdminOrModerator,
  };
};