import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, Column, Vote, Comment, Priority } from '@/types/database';

export function useColumns(boardId: string) {
  return useQuery({
    queryKey: ['columns', boardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('board_id', boardId)
        .order('position');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCards(columnId?: string) {
  return useQuery({
    queryKey: ['cards', columnId],
    queryFn: async () => {
      let query = supabase
        .from('cards')
        .select(`
          *,
          creator:user_profiles!cards_creator_id_fkey(id, display_name, avatar_url)
        `);

      if (columnId) {
        query = query.eq('column_id', columnId);
      }

      const { data, error } = await query
        .eq('status', 'active')
        .order('position');

      if (error) throw error;

      // Get vote counts and comment counts separately
      const cardsWithCounts = await Promise.all((data || []).map(async (card) => {
        const [voteResult, commentResult] = await Promise.all([
          supabase.from('votes').select('id').eq('card_id', card.id),
          supabase.from('comments').select('id').eq('card_id', card.id)
        ]);

        return {
          ...card,
          vote_count: voteResult.data?.length || 0,
          comment_count: commentResult.data?.length || 0,
          user_has_voted: false, // Will be updated by real-time
        };
      }));

      return cardsWithCounts;
    },
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cardData: {
      title: string;
      description?: string;
      column_id: string;
      priority?: Priority;
      tags?: string[];
    }) => {
      // Get next position
      const { data: cards } = await supabase
        .from('cards')
        .select('position')
        .eq('column_id', cardData.column_id)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = cards?.[0]?.position ? cards[0].position + 1 : 1;

      const { data, error } = await supabase
        .from('cards')
        .insert({
          ...cardData,
          position: nextPosition,
          creator_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['cards', data.column_id] });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Card> & { id: string }) => {
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useMoveCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      cardId,
      newColumnId,
      newPosition,
    }: {
      cardId: string;
      newColumnId: string;
      newPosition: number;
    }) => {
      const { error } = await supabase
        .from('cards')
        .update({
          column_id: newColumnId,
          position: newPosition,
        })
        .eq('id', cardId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useVoteCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cardId: string) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('card_id', cardId)
        .eq('user_id', user.data.user.id)
        .single();

      if (existingVote) {
        // Remove vote
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id);
        
        if (error) throw error;
        return { action: 'removed' };
      } else {
        // Add vote
        const { error } = await supabase
          .from('votes')
          .insert({
            card_id: cardId,
            user_id: user.data.user.id,
          });
        
        if (error) throw error;
        return { action: 'added' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useComments(cardId: string) {
  return useQuery({
    queryKey: ['comments', cardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_profiles!comments_user_id_fkey(id, display_name, avatar_url)
        `)
        .eq('card_id', cardId)
        .order('created_at');

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ cardId, content }: { cardId: string; content: string }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          card_id: cardId,
          content,
          user_id: user.data.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.cardId] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}