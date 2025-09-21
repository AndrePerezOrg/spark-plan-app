import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeCards() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = supabase
      .channel('cards-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['cards'] });
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['cards'] });
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['cards'] });
          queryClient.invalidateQueries({ queryKey: ['comments'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [queryClient]);
}