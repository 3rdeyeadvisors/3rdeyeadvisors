import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to set up real-time subscriptions for critical application data.
 * This ensures that the UI stays in sync with the backend without manual refreshes.
 */
export const useRealtimeSync = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // 1. Subscribe to User Points updates
    const pointsChannel = supabase
      .channel('user-points-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Invalidate points-related queries
          queryClient.invalidateQueries({ queryKey: ['user-points'] });
          queryClient.invalidateQueries({ queryKey: ['points-history'] });
        }
      )
      .subscribe();

    // 2. Subscribe to Roadmap updates
    const roadmapChannel = supabase
      .channel('roadmap-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'roadmap_items',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['roadmap-items'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'roadmap_votes',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['roadmap-items'] });
          queryClient.invalidateQueries({ queryKey: ['roadmap-vote-counts'] });
        }
      )
      .subscribe();

    // 3. Subscribe to In-App Notifications (if applicable)
    // Add more subscriptions as needed

    return () => {
      supabase.removeChannel(pointsChannel);
      supabase.removeChannel(roadmapChannel);
    };
  }, [user, queryClient]);
};
