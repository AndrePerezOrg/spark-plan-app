-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.card_status AS ENUM ('active', 'archived');

-- User profiles table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boards table
CREATE TABLE public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  background_color TEXT DEFAULT '#6366f1',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Columns table (workflow stages)
CREATE TABLE public.columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  color TEXT DEFAULT '#6B7280',
  card_limit INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(board_id, position)
);

-- Cards table (idea cards)
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  column_id UUID REFERENCES public.columns(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  priority priority_level DEFAULT 'medium',
  status card_status DEFAULT 'active',
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(column_id, position)
);

-- Votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(card_id, user_id)
);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_cards_column_id ON public.cards(column_id);
CREATE INDEX idx_cards_creator_id ON public.cards(creator_id);
CREATE INDEX idx_cards_position ON public.cards(column_id, position);
CREATE INDEX idx_votes_card_id ON public.votes(card_id);
CREATE INDEX idx_comments_card_id ON public.comments(card_id);
CREATE INDEX idx_cards_search ON public.cards USING gin(to_tsvector('portuguese', title || ' ' || COALESCE(description, '')));

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for boards
CREATE POLICY "Boards are viewable by authenticated users"
  ON public.boards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create boards"
  ON public.boards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Board creators can update boards"
  ON public.boards FOR UPDATE
  USING (auth.uid() = created_by);

-- RLS Policies for columns
CREATE POLICY "Columns are viewable by authenticated users"
  ON public.columns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage columns"
  ON public.columns FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for cards
CREATE POLICY "Cards are viewable by authenticated users"
  ON public.cards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create cards"
  ON public.cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Card creators can update their cards"
  ON public.cards FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Anyone can move cards between columns"
  ON public.cards FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for votes
CREATE POLICY "Votes are viewable by authenticated users"
  ON public.votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own votes"
  ON public.votes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by authenticated users"
  ON public.comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Comment creators can manage their comments"
  ON public.comments FOR ALL
  USING (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON public.boards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_columns_updated_at
  BEFORE UPDATE ON public.columns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.boards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.columns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Insert default board and columns for demonstration
INSERT INTO public.boards (id, name, description, created_by) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'BIX IA Hackathon - Ideias',
  'Quadro colaborativo para organizar e votar nas melhores ideias do hackathon',
  (SELECT id FROM auth.users LIMIT 1)
);

INSERT INTO public.columns (name, board_id, position, color) VALUES
  ('💡 Novas Ideias', '00000000-0000-0000-0000-000000000001', 1, '#f59e0b'),
  ('🔍 Em Análise', '00000000-0000-0000-0000-000000000001', 2, '#3b82f6'),
  ('⚡ Em Desenvolvimento', '00000000-0000-0000-0000-000000000001', 3, '#8b5cf6'),
  ('✅ Finalizadas', '00000000-0000-0000-0000-000000000001', 4, '#10b981');