-- Add function to reorder cards in a column
-- This function cleans up position gaps and ensures sequential numbering

CREATE OR REPLACE FUNCTION public.reorder_cards_in_column(column_id UUID)
RETURNS void AS $$
DECLARE
    card_record RECORD;
    new_position INTEGER := 1;
BEGIN
    -- Update positions to be sequential starting from 1
    FOR card_record IN
        SELECT id FROM public.cards
        WHERE cards.column_id = reorder_cards_in_column.column_id
        ORDER BY position, created_at
    LOOP
        UPDATE public.cards
        SET position = new_position
        WHERE id = card_record.id;

        new_position := new_position + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;