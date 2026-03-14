import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  id: string;
  site_name: string;
  site_tagline: string;
  default_meta_title: string;
  default_meta_description: string;
  default_meta_keywords: string;
  og_image_url: string;
  twitter_handle: string;
  robots_default: string;
  google_site_verification: string | null;
  updated_at: string;
  updated_by: string | null;
}

export const useSiteSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings' as any)
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error) throw error;
      return data as unknown as SiteSettings | null;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('site-settings-sync')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: "id=eq.default",
        },
        (payload) => {
          console.log('[useSiteSettings] Real-time update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['site-settings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { settings, loading: isLoading, error };
};
