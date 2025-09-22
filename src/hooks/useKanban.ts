import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  Board,
  Column,
  Card,
  CardWithDetails,
  ColumnWithCards,
  BoardWithColumns,
  Comment,
  CommentWithUser,
  Priority,
} from '../types/database'

// Boards
export function useBoards() {
  return useQuery({
    queryKey: ['boards'],
    queryFn: async (): Promise<BoardWithColumns[]> => {
      const { data, error } = await supabase
        .from('boards')
        .select(`
          *,
          creator:user_profiles(display_name, avatar_url),
          columns:columns(
            *,
            cards:cards(
              *,
              creator:user_profiles(display_name, avatar_url)
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
  })
}

export function useBoard(id?: string) {
  return useQuery({
    queryKey: ['board', id],
    queryFn: async (): Promise<BoardWithColumns> => {
      if (!id) throw new Error('Board ID is required')

      const { data, error } = await supabase
        .from('boards')
        .select(`
          *,
          creator:user_profiles(display_name, avatar_url),
          columns:columns(
            *,
            cards:cards(
              *,
              creator:user_profiles(display_name, avatar_url)
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// Columns
export function useColumns(boardId?: string) {
  return useQuery({
    queryKey: ['columns', boardId],
    queryFn: async (): Promise<ColumnWithCards[]> => {
      let query = supabase
        .from('columns')
        .select(`
          *,
          cards:cards(
            *,
            creator:user_profiles(display_name, avatar_url)
          )
        `)
        .order('position', { referencedTable: 'cards' })

      if (boardId) {
        query = query.eq('board_id', boardId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    enabled: !!boardId,
  })
}

export function useCreateColumn() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (newColumn: {
      name: string
      board_id: string
      position: number
      color?: string
    }) => {
      const { data, error } = await supabase
        .from('columns')
        .insert(newColumn)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] })
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    },
  })
}

// Cards
export function useCards() {
  return useQuery({
    queryKey: ['cards'],
    queryFn: async (): Promise<CardWithDetails[]> => {
      // Call the Edge Function to get all cards with counts
      const { data, error } = await supabase.functions.invoke('get-cards-with-counts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (error) throw error

      return data || []
    },
  })
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (newCard: {
      title: string
      description?: string
      column_id: string
      priority?: Priority
      tags?: string[]
    }) => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('cards')
        .insert({
          ...newCard,
          creator_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['columns'] })
    },
  })
}

export function useUpdateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: {
      id: string
      title?: string
      description?: string
      column_id?: string
      position?: number
      priority?: Priority
      tags?: string[]
    }) => {
      console.log('🔥 useUpdateCard mutation called with:', updates)

      // Handle column moves and position updates using edge function
      if (updates.column_id || updates.position !== undefined) {
        const { data, error } = await supabase.functions.invoke('reorder-card', {
          body: {
            cardId: updates.id,
            newColumnId: updates.column_id,
            newPosition: updates.position
          }
        })

        if (error) {
          console.error('❌ Edge function error:', error)
          throw error
        }

        if (!data.success) {
          console.error('❌ Reorder failed:', data.error)
          throw new Error(data.error || 'Failed to reorder card')
        }

        console.log('✅ Card reordered successfully:', data.data)
        return data.data
      }

      // For other updates (title, description, etc.), do a simple update
      const { data, error } = await supabase
        .from('cards')
        .update(updates)
        .eq('id', updates.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Database update error:', error)
        throw error
      }

      console.log('✅ Database update successful:', data)
      return data
    },
    // Optimistic updates for both columns and cards queries
    onMutate: async (updates) => {
      // Only do optimistic updates for column moves, position changes, and priority changes
      if (!updates.column_id && !updates.priority && updates.position === undefined) return

      console.log('🚀 Optimistic update for card:', updates.id, updates)

      // Cancel outgoing refetches for all related queries
      await queryClient.cancelQueries({ queryKey: ['columns'] })
      await queryClient.cancelQueries({ queryKey: ['cards'] })

      // Get current data
      const previousColumns = queryClient.getQueryData(['columns'])
      const previousCards = queryClient.getQueryData(['cards'])

      // Update columns query with proper position shifting
      queryClient.setQueryData(['columns'], (oldData: ColumnWithCards[]) => {
        if (!oldData || !Array.isArray(oldData)) return oldData

        // Find the card being moved
        const movedCard = oldData
          .flatMap((col) => col.cards || [])
          .find((card) => card.id === updates.id)

        if (!movedCard) return oldData

        const oldColumnId = movedCard.column_id
        const oldPosition = movedCard.position || 0
        const targetColumnId = updates.column_id || oldColumnId
        const targetPosition = updates.position !== undefined ? updates.position : oldPosition

        return oldData.map((column) => {
          const cards = column.cards || []

          if (column.id === oldColumnId && column.id === targetColumnId) {
            // Moving within same column
            return {
              ...column,
              cards: cards.map((card) => {
                if (card.id === updates.id) {
                  // The moved card
                  return {
                    ...card,
                    position: targetPosition,
                    priority: updates.priority || card.priority,
                    updated_at: new Date().toISOString()
                  }
                } else {
                  // Other cards need position adjustment
                  if (oldPosition < targetPosition) {
                    // Moving down: shift cards between old and new position up
                    if (card.position > oldPosition && card.position <= targetPosition) {
                      return { ...card, position: card.position - 1 }
                    }
                  } else {
                    // Moving up: shift cards between new and old position down
                    if (card.position >= targetPosition && card.position < oldPosition) {
                      return { ...card, position: card.position + 1 }
                    }
                  }
                  return card
                }
              }).sort((a, b) => (a.position || 0) - (b.position || 0))
            }
          } else if (column.id === oldColumnId) {
            // Old column: remove card and shift others up
            return {
              ...column,
              cards: cards
                .filter((card) => card.id !== updates.id)
                .map((card) => card.position > oldPosition ? { ...card, position: card.position - 1 } : card)
                .sort((a, b) => (a.position || 0) - (b.position || 0))
            }
          } else if (column.id === targetColumnId) {
            // New column: add card and shift others down
            return {
              ...column,
              cards: [
                ...cards.map((card) => card.position >= targetPosition ? { ...card, position: card.position + 1 } : card),
                {
                  ...movedCard,
                  column_id: targetColumnId,
                  position: targetPosition,
                  priority: updates.priority || movedCard.priority,
                  updated_at: new Date().toISOString()
                }
              ].sort((a, b) => (a.position || 0) - (b.position || 0))
            }
          } else {
            // Unaffected column
            return column
          }
        })
      })

      // Update all cards queries (with different filter combinations)
      const cardsQueries = queryClient.getQueriesData({ queryKey: ['cards'] })
      cardsQueries.forEach(([queryKey, oldData]) => {
        if (oldData && Array.isArray(oldData)) {
          queryClient.setQueryData(queryKey, oldData.map((card: CardWithDetails) => {
            if (card.id === updates.id) {
              return {
                ...card,
                column_id: updates.column_id || card.column_id,
                position: updates.position !== undefined ? updates.position : card.position,
                priority: updates.priority || card.priority,
                updated_at: new Date().toISOString()
              }
            }
            return card
          }))
        }
      })

      return { previousColumns, previousCardsQueries: cardsQueries }
    },
    onError: (err, newCard, context) => {
      console.error('❌ Optimistic update failed, reverting:', err)
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['columns'], context?.previousColumns)

      // Restore all cards queries
      if (context?.previousCardsQueries) {
        context.previousCardsQueries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData)
        })
      }
    },
    onSettled: () => {
      console.log('🔄 Mutation settled, invalidating queries')
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['columns'] })
    }
  })
}

// Votes
export function useVoteCard() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (cardId: string) => {
      if (!user) throw new Error('User not authenticated')

      // Check if user has already voted
      const { data: existingVotes } = await supabase
        .from('votes')
        .select('id')
        .eq('card_id', cardId)
        .eq('user_id', user.id)

      const existingVote = existingVotes && existingVotes.length > 0 ? existingVotes[0] : null

      if (existingVote) {
        // Remove vote
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('id', existingVote.id)

        if (error) throw error
        return { action: 'remove', cardId }
      } else {
        // Add vote
        const { error } = await supabase
          .from('votes')
          .insert({
            card_id: cardId,
            user_id: user.id,
          })

        if (error) throw error
        return { action: 'add', cardId }
      }
    },
    onMutate: async (cardId: string) => {
      if (!user) return

      console.log('🚀 Optimistic vote update for card:', cardId)

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cards'] })
      await queryClient.cancelQueries({ queryKey: ['columns'] })

      // Get current cards data to check if user has already voted
      const cardsQueries = queryClient.getQueriesData({ queryKey: ['cards'] })
      const currentCard = cardsQueries
        .flatMap(([, data]) => (Array.isArray(data) ? data : []))
        .find((card: CardWithDetails) => card.id === cardId)

      if (!currentCard) return { cardsQueries }

      const hasUserVoted = currentCard.user_has_voted
      const voteCountChange = hasUserVoted ? -1 : 1

      // Update all cards queries
      cardsQueries.forEach(([queryKey, oldData]) => {
        if (oldData && Array.isArray(oldData)) {
          queryClient.setQueryData(queryKey, oldData.map((card: CardWithDetails) => {
            if (card.id === cardId) {
              return {
                ...card,
                vote_count: (card.vote_count || 0) + voteCountChange,
                user_has_voted: !hasUserVoted
              }
            }
            return card
          }))
        }
      })

      // Update columns queries
      const columnsQueries = queryClient.getQueriesData({ queryKey: ['columns'] })
      columnsQueries.forEach(([queryKey, oldData]) => {
        if (oldData && Array.isArray(oldData)) {
          queryClient.setQueryData(queryKey, oldData.map((column: ColumnWithCards) => ({
            ...column,
            cards: (column.cards || []).map((card) => {
              if (card.id === cardId) {
                return {
                  ...card,
                  vote_count: (card.vote_count || 0) + voteCountChange,
                  user_has_voted: !hasUserVoted
                }
              }
              return card
            })
          })))
        }
      })

      return { cardsQueries, columnsQueries }
    },
    onError: (err, cardId, context) => {
      console.error('❌ Vote update failed, reverting:', err)

      // Restore all queries
      if (context?.cardsQueries) {
        context.cardsQueries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData)
        })
      }

      if (context?.columnsQueries) {
        context.columnsQueries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData)
        })
      }
    },
    onSettled: () => {
      console.log('🔄 Vote mutation settled, invalidating queries')
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      queryClient.invalidateQueries({ queryKey: ['columns'] })
    },
  })
}

// Comments
export function useComments(cardId: string) {
  return useQuery({
    queryKey: ['comments', cardId],
    queryFn: async (): Promise<CommentWithUser[]> => {
      // First get the comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('card_id', cardId)
        .order('created_at', { ascending: true })

      if (commentsError) throw commentsError

      if (!comments || comments.length === 0) {
        return []
      }

      // Get unique user IDs
      const userIds = [...new Set(comments.map(comment => comment.user_id))]

      // Fetch user profiles
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds)

      if (profilesError) throw profilesError

      // Create a map for quick lookup
      const userMap = new Map(
        (userProfiles || []).map(user => [user.id, user])
      )

      // Combine comments with user data
      const commentsWithUsers = comments.map(comment => ({
        ...comment,
        user: userMap.get(comment.user_id) || null
      }))

      return commentsWithUsers
    },
    enabled: !!cardId,
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (newComment: {
      cardId: string
      content: string
    }) => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('comments')
        .insert({
          card_id: newComment.cardId,
          user_id: user.id,
          content: newComment.content,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}