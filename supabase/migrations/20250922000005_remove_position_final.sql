-- Final fix: Remove position constraint and column from existing database
-- This addresses the duplicate key violation error when updating cards

-- Drop the position constraint from cards table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'cards_column_id_position_key'
        AND table_name = 'cards'
    ) THEN
        ALTER TABLE public.cards DROP CONSTRAINT cards_column_id_position_key;
    END IF;
END $$;

-- Drop the position column from cards table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cards'
        AND column_name = 'position'
    ) THEN
        ALTER TABLE public.cards DROP COLUMN position;
    END IF;
END $$;

-- Drop position constraint from columns table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'columns_board_id_position_key'
        AND table_name = 'columns'
    ) THEN
        ALTER TABLE public.columns DROP CONSTRAINT columns_board_id_position_key;
    END IF;
END $$;

-- Drop position column from columns table if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'columns'
        AND column_name = 'position'
    ) THEN
        ALTER TABLE public.columns DROP COLUMN position;
    END IF;
END $$;