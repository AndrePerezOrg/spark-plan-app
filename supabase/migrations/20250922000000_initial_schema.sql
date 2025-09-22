-- BIX Kanban Ideas - Clean Initial Schema
-- This migration creates a simple, working kanban system with multi-tenancy

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (skip if already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
        CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'card_status') THEN
        CREATE TYPE public.card_status AS ENUM ('active', 'archived');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'super_admin');
    END IF;
END$$;

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations table (for multi-tenancy)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User organizations membership table
CREATE TABLE IF NOT EXISTS public.user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  role user_role DEFAULT 'user',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('planning', 'active', 'paused', 'completed', 'archived')) DEFAULT 'planning',
  priority priority_level DEFAULT 'medium',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_project_name_per_org UNIQUE(organization_id, name)
);

-- Boards table
CREATE TABLE IF NOT EXISTS public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  background_color TEXT DEFAULT '#6366f1',
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_template BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Columns table (workflow stages)
CREATE TABLE IF NOT EXISTS public.columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#6B7280',
  card_limit INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cards table (idea cards)
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  column_id UUID REFERENCES public.columns(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  priority priority_level DEFAULT 'medium',
  status card_status DEFAULT 'active',
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(card_id, user_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user ON public.user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org ON public.user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_organization ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_boards_project ON public.boards(project_id);
CREATE INDEX IF NOT EXISTS idx_boards_organization ON public.boards(organization_id);
CREATE INDEX IF NOT EXISTS idx_cards_column ON public.cards(column_id);
CREATE INDEX IF NOT EXISTS idx_cards_creator ON public.cards(creator_id);
-- Position index removed since we don't use position anymore
CREATE INDEX IF NOT EXISTS idx_votes_card ON public.votes(card_id);
CREATE INDEX IF NOT EXISTS idx_comments_card ON public.comments(card_id);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies (drop existing first to avoid conflicts)

-- User profiles: anyone can read, users can update their own
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.user_profiles;
CREATE POLICY "Public profiles are viewable" ON public.user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations: viewable by members
CREATE POLICY "Organizations viewable by members" ON public.organizations FOR SELECT
USING (id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can create organizations" ON public.organizations FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update organizations" ON public.organizations FOR UPDATE
USING (auth.uid() = created_by);

-- User organizations: users can see their own memberships
DROP POLICY IF EXISTS "Users see own memberships" ON public.user_organizations;
CREATE POLICY "Users see own memberships" ON public.user_organizations FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can join organizations" ON public.user_organizations;
CREATE POLICY "Users can join organizations" ON public.user_organizations FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Projects: viewable by organization members
CREATE POLICY "Projects viewable by org members" ON public.projects FOR SELECT
USING (organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()));

CREATE POLICY "Org members can create projects" ON public.projects FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()));

-- Boards: viewable by organization members or if public
CREATE POLICY "Boards viewable by org members or public" ON public.boards FOR SELECT
USING (
  is_public = true
  OR organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid())
);

CREATE POLICY "Org members can create boards" ON public.boards FOR INSERT
WITH CHECK (organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid()));

-- Columns, cards, votes, comments: same access as their board
CREATE POLICY "Columns viewable via boards" ON public.columns FOR SELECT
USING (board_id IN (
  SELECT id FROM public.boards
  WHERE is_public = true
  OR organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid())
));

CREATE POLICY "Cards viewable via boards" ON public.cards FOR SELECT
USING (column_id IN (
  SELECT c.id FROM public.columns c
  JOIN public.boards b ON c.board_id = b.id
  WHERE b.is_public = true
  OR b.organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid())
));

DROP POLICY IF EXISTS "Authenticated users can manage columns" ON public.columns;
CREATE POLICY "Authenticated users can manage columns" ON public.columns FOR ALL
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can create cards" ON public.cards;
CREATE POLICY "Authenticated users can create cards" ON public.cards FOR INSERT
WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Users can update cards" ON public.cards;
CREATE POLICY "Users can update cards" ON public.cards FOR UPDATE
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete cards" ON public.cards;
CREATE POLICY "Votes viewable via boards" ON public.votes FOR SELECT
USING (card_id IN (
  SELECT ca.id FROM public.cards ca
  JOIN public.columns co ON ca.column_id = co.id
  JOIN public.boards b ON co.board_id = b.id
  WHERE b.is_public = true
  OR b.organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid())
));

DROP POLICY IF EXISTS "Users can manage own votes" ON public.votes;
CREATE POLICY "Users can manage own votes" ON public.votes FOR ALL
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create votes" ON public.votes;
CREATE POLICY "Comments viewable via boards" ON public.comments FOR SELECT
USING (card_id IN (
  SELECT ca.id FROM public.cards ca
  JOIN public.columns co ON ca.column_id = co.id
  JOIN public.boards b ON co.board_id = b.id
  WHERE b.is_public = true
  OR b.organization_id IN (SELECT organization_id FROM public.user_organizations WHERE user_id = auth.uid())
));

DROP POLICY IF EXISTS "Users can manage own comments" ON public.comments;
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE
USING (user_id = auth.uid());

-- Functions

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_columns_updated_at
  BEFORE UPDATE ON public.columns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime (only add if not already added)
DO $$
BEGIN
    -- Add tables to realtime publication if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'user_profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'organizations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.organizations;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'user_organizations'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_organizations;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'projects'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'boards'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.boards;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'columns'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.columns;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'cards'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'votes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND tablename = 'comments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
    END IF;
END $$;