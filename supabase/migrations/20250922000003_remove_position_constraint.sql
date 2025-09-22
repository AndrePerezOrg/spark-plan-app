-- Remove the position constraint since we're using timestamps for ordering

-- Drop the unique constraint on (column_id, position)
ALTER TABLE public.cards DROP CONSTRAINT IF EXISTS cards_column_id_position_key;

-- Drop the position column entirely since we're not using it
ALTER TABLE public.cards DROP COLUMN IF EXISTS position;

-- Also remove position from columns table since we're not using it
ALTER TABLE public.columns DROP CONSTRAINT IF EXISTS columns_board_id_position_key;