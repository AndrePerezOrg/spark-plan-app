import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useRealtimeCards(columnId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const subscription = supabase
      .channel('cards-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: columnId ? `column_id=eq.${columnId}` : undefined,
        },
        (payload) => {
          // Invalidate relevant queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['cards'] })
          queryClient.invalidateQueries({ queryKey: ['columns'] })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [columnId, queryClient])
}

export function useRealtimeComments(cardId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!cardId) return

    const subscription = supabase
      .channel(`comments-${cardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `card_id=eq.${cardId}`,
        },
        (payload) => {
          // Invalidate comments for this specific card
          queryClient.invalidateQueries({ queryKey: ['comments', cardId] })
          // Also invalidate cards to update comment counts
          queryClient.invalidateQueries({ queryKey: ['cards'] })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [cardId, queryClient])
}

export function useRealtimeVotes() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const subscription = supabase
      .channel('votes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
        },
        (payload) => {
          // Invalidate cards to update vote counts and user vote status
          queryClient.invalidateQueries({ queryKey: ['cards'] })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient])
}

export function useRealtimeColumns(boardId?: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const subscription = supabase
      .channel('columns-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'columns',
          filter: boardId ? `board_id=eq.${boardId}` : undefined,
        },
        (payload) => {
          // Invalidate columns and boards to refetch data
          queryClient.invalidateQueries({ queryKey: ['columns'] })
          queryClient.invalidateQueries({ queryKey: ['boards'] })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [boardId, queryClient])
}

// Combined hook for all real-time features
export function useRealtimeBoard(boardId?: string) {
  useRealtimeCards()
  useRealtimeVotes()
  useRealtimeColumns(boardId)
}