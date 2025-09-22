-- Add sample data for testing
-- This migration creates sample organizations, projects, boards, and cards

-- Create default organization
INSERT INTO public.organizations (id, name, slug, description, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'BIX Innovation Hub',
  'bix-innovation',
  'Central hub for BIX innovation projects and hackathons',
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Create default project
INSERT INTO public.projects (id, name, description, status, organization_id, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'IA Hackathon 2025',
  'Annual hackathon focused on Artificial Intelligence solutions.',
  'active',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Create default board
INSERT INTO public.boards (id, name, description, project_id, organization_id, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Kanban Principal',
  'Quadro principal para o hackathon de IA',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM auth.users LIMIT 1)
)
ON CONFLICT (id) DO NOTHING;

-- Create columns for the board
INSERT INTO public.columns (name, board_id, color) VALUES
  ('💡 Novas Ideias', '00000000-0000-0000-0000-000000000001', '#f59e0b'),
  ('🔍 Em Análise', '00000000-0000-0000-0000-000000000001', '#3b82f6'),
  ('⚡ Em Desenvolvimento', '00000000-0000-0000-0000-000000000001', '#8b5cf6'),
  ('✅ Finalizadas', '00000000-0000-0000-0000-000000000001', '#10b981')
ON CONFLICT (id) DO NOTHING;

-- Add sample cards (only if we have a user)
DO $$
DECLARE
    first_user_id UUID;
    column_novas_ideias UUID;
    column_em_analise UUID;
    column_em_desenvolvimento UUID;
    column_finalizadas UUID;
BEGIN
    -- Get the first user
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at LIMIT 1;

    -- Get column IDs
    SELECT id INTO column_novas_ideias FROM public.columns
    WHERE board_id = '00000000-0000-0000-0000-000000000001' AND name = '💡 Novas Ideias';

    SELECT id INTO column_em_analise FROM public.columns
    WHERE board_id = '00000000-0000-0000-0000-000000000001' AND name = '🔍 Em Análise';

    SELECT id INTO column_em_desenvolvimento FROM public.columns
    WHERE board_id = '00000000-0000-0000-0000-000000000001' AND name = '⚡ Em Desenvolvimento';

    SELECT id INTO column_finalizadas FROM public.columns
    WHERE board_id = '00000000-0000-0000-0000-000000000001' AND name = '✅ Finalizadas';

    -- Add sample cards if user exists
    IF first_user_id IS NOT NULL THEN
        -- Novas Ideias
        INSERT INTO public.cards (title, description, column_id, creator_id, priority, tags) VALUES
        ('IA para Análise de Sentimentos', 'Desenvolver uma ferramenta que analise sentimentos em feedbacks de clientes usando processamento de linguagem natural', column_novas_ideias, first_user_id, 'high', ARRAY['IA', 'NLP', 'Análise']),
        ('Chatbot Inteligente para Atendimento', 'Criar um chatbot com IA conversacional para melhorar o atendimento ao cliente 24/7', column_novas_ideias, first_user_id, 'medium', ARRAY['Chatbot', 'IA', 'Atendimento']),
        ('Predição de Demanda com Machine Learning', 'Sistema de ML para prever demanda de produtos e otimizar estoque', column_novas_ideias, first_user_id, 'medium', ARRAY['ML', 'Predição', 'Estoque'])
        ON CONFLICT (id) DO NOTHING;
        -- Em Análise
        INSERT INTO public.cards (title, description, column_id, creator_id, priority, tags) VALUES
        ('Automatização de Processos com RPA', 'Implementar RPA com IA para automatizar tarefas repetitivas nos processos internos', column_em_analise, first_user_id, 'high', ARRAY['RPA', 'Automação', 'IA']),
        ('Reconhecimento de Imagem para Qualidade', 'Sistema de visão computacional para controle de qualidade na produção', column_em_analise, first_user_id, 'medium', ARRAY['Visão', 'Qualidade', 'IA'])
        ON CONFLICT (id) DO NOTHING;
        -- Em Desenvolvimento
        INSERT INTO public.cards (title, description, column_id, creator_id, priority, tags) VALUES
        ('Dashboard Analytics com IA', 'Painel inteligente que gera insights automaticamente a partir dos dados de negócio', column_em_desenvolvimento, first_user_id, 'high', ARRAY['Analytics', 'Dashboard', 'IA'])
        ON CONFLICT (id) DO NOTHING;
        -- Finalizadas
        INSERT INTO public.cards (title, description, column_id, creator_id, priority, tags) VALUES
        ('Modelo de Recomendação Personalizada', 'Sistema de recomendação que sugere produtos baseado no comportamento do usuário', column_finalizadas, first_user_id, 'high', ARRAY['Recomendação', 'ML', 'Personalização'])
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;