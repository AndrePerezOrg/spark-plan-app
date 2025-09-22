import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the current user
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build the main cards query - fetch ALL cards (filtering will be done client-side)
    const { data: cards, error: cardsError } = await supabaseClient
      .from('cards')
      .select(`
        id,
        title,
        description,
        column_id,
        creator_id,
        position,
        priority,
        status,
        tags,
        created_at,
        updated_at,
        creator:user_profiles(display_name, avatar_url)
      `)
      .order('position', { ascending: true })

    if (cardsError) throw cardsError

    if (!cards || cards.length === 0) {
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get card IDs for batch queries
    const cardIds = cards.map(card => card.id)

    // Get vote counts, comment counts, and user votes in parallel
    const [voteCounts, commentCounts, userVotes] = await Promise.all([
      // Get vote counts for all cards
      supabaseClient
        .from('votes')
        .select('card_id')
        .in('card_id', cardIds)
        .then(({ data }) => {
          const counts = new Map()
          data?.forEach(vote => {
            counts.set(vote.card_id, (counts.get(vote.card_id) || 0) + 1)
          })
          return counts
        }),

      // Get comment counts for all cards
      supabaseClient
        .from('comments')
        .select('card_id')
        .in('card_id', cardIds)
        .then(({ data }) => {
          const counts = new Map()
          data?.forEach(comment => {
            counts.set(comment.card_id, (counts.get(comment.card_id) || 0) + 1)
          })
          return counts
        }),

      // Get user's votes for all cards
      supabaseClient
        .from('votes')
        .select('card_id')
        .in('card_id', cardIds)
        .eq('user_id', user.id)
        .then(({ data }) => {
          const userVotes = new Set()
          data?.forEach(vote => {
            userVotes.add(vote.card_id)
          })
          return userVotes
        })
    ])

    // Combine cards with their counts
    const cardsWithDetails = cards.map(card => ({
      ...card,
      vote_count: voteCounts.get(card.id) || 0,
      comment_count: commentCounts.get(card.id) || 0,
      user_has_voted: userVotes.has(card.id)
    }))

    return new Response(
      JSON.stringify(cardsWithDetails),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})