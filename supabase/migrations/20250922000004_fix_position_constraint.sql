-- Emergency fix: Remove position constraint from cards table
-- This fixes the duplicate key violation error when updating cards

-- Drop the unique constraint on (column_id, position) if it exists
ALTER TABLE public.cards DROP CONSTRAINT IF EXISTS cards_column_id_position_key;

-- Drop the position column entirely since we're using timestamps for ordering
ALTER TABLE public.cards DROP COLUMN IF EXISTS position;

-- Also remove position constraint from columns table if it exists
ALTER TABLE public.columns DROP CONSTRAINT IF EXISTS columns_board_id_position_key;