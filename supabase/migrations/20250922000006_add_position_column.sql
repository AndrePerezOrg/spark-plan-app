-- Add position column back to cards table for proper ordering
-- This enables drag-and-drop reordering within columns

-- Add position column to cards table
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Update existing cards with position based on created_at order
DO $$
DECLARE
    card_record RECORD;
    column_record RECORD;
    position_counter INTEGER;
BEGIN
    -- For each column, set positions based on creation order
    FOR column_record IN (SELECT DISTINCT column_id FROM public.cards ORDER BY column_id) LOOP
        position_counter := 0;

        -- Update each card in this column with sequential positions
        FOR card_record IN (
            SELECT id FROM public.cards
            WHERE column_id = column_record.column_id
            ORDER BY created_at ASC
        ) LOOP
            UPDATE public.cards
            SET position = position_counter
            WHERE id = card_record.id;

            position_counter := position_counter + 1;
        END LOOP;
    END LOOP;
END $$;

-- Make position NOT NULL after setting values
ALTER TABLE public.cards ALTER COLUMN position SET NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_cards_column_position ON public.cards(column_id, position);

-- Add comment for documentation
COMMENT ON COLUMN public.cards.position IS 'Position of card within its column for drag-and-drop ordering';