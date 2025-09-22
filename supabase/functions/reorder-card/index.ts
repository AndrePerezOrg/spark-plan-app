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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Parse request body
    const { cardId, newColumnId, newPosition } = await req.json()

    if (!cardId) {
      return new Response(
        JSON.stringify({ error: 'cardId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Start a transaction-like operation
    // First, get the current card info
    const { data: currentCard, error: cardError } = await supabaseClient
      .from('cards')
      .select('column_id, position')
      .eq('id', cardId)
      .single()

    if (cardError) {
      throw cardError
    }

    const oldColumnId = currentCard.column_id
    const oldPosition = currentCard.position
    const targetColumnId = newColumnId || oldColumnId
    const targetPosition = newPosition !== undefined ? newPosition : oldPosition

    // If nothing changed, return success
    if (oldColumnId === targetColumnId && oldPosition === targetPosition) {
      return new Response(
        JSON.stringify({ success: true, message: 'No changes needed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all cards that need position updates
    let cardsToUpdate = []

    if (oldColumnId === targetColumnId) {
      // Moving within the same column
      const { data: columnCards } = await supabaseClient
        .from('cards')
        .select('id, position')
        .eq('column_id', targetColumnId)
        .order('position')

      if (columnCards) {
        if (oldPosition < targetPosition) {
          // Moving down: shift cards between old and new position up
          cardsToUpdate = columnCards
            .filter(card => card.position > oldPosition && card.position <= targetPosition)
            .map(card => ({ id: card.id, position: card.position - 1 }))
        } else {
          // Moving up: shift cards between new and old position down
          cardsToUpdate = columnCards
            .filter(card => card.position >= targetPosition && card.position < oldPosition)
            .map(card => ({ id: card.id, position: card.position + 1 }))
        }
      }
    } else {
      // Moving between columns

      // Get cards from old column that need to shift up
      const { data: oldColumnCards } = await supabaseClient
        .from('cards')
        .select('id, position')
        .eq('column_id', oldColumnId)
        .gt('position', oldPosition)

      // Get cards from new column that need to shift down
      const { data: newColumnCards } = await supabaseClient
        .from('cards')
        .select('id, position')
        .eq('column_id', targetColumnId)
        .gte('position', targetPosition)

      cardsToUpdate = [
        ...(oldColumnCards || []).map(card => ({ id: card.id, position: card.position - 1 })),
        ...(newColumnCards || []).map(card => ({ id: card.id, position: card.position + 1 }))
      ]
    }

    // Update all affected cards
    for (const cardUpdate of cardsToUpdate) {
      await supabaseClient
        .from('cards')
        .update({ position: cardUpdate.position })
        .eq('id', cardUpdate.id)
    }

    // Finally, update the moved card
    const { data: updatedCard, error: updateError } = await supabaseClient
      .from('cards')
      .update({
        column_id: targetColumnId,
        position: targetPosition,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: updatedCard,
        message: 'Card reordered successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error reordering card:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})