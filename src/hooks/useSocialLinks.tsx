import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

export const useSocialLinks = () => {
  const queryClient = useQueryClient();

  const { data: links, isLoading, error } = useQuery({
    queryKey: ['social-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_links' as any)
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as unknown as SocialLink[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('social-links-sync')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'social_links',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['social-links'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { links, loading: isLoading, error };
};
