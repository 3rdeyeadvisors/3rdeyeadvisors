import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PageVisibility {
  id: string;
  path: string;
  is_visible: boolean;
  updated_at: string;
}

export const usePageVisibility = () => {
  const queryClient = useQueryClient();

  const { data: pages, isLoading, error } = useQuery({
    queryKey: ['page-visibility'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_visibility' as any)
        .select('*');

      if (error) throw error;
      return data as unknown as PageVisibility[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('page-visibility-sync')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'page_visibility',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['page-visibility'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const isPageVisible = (path: string): boolean => {
    if (!pages) return true; // Fail-open
    const page = pages.find(p => p.path === path);
    if (!page) return true; // Fail-open for unknown paths
    return page.is_visible;
  };

  return { pages, loading: isLoading, isPageVisible, error };
};
