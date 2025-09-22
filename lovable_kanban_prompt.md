# Lovable Prompt: Full-Stack Kanban Application with Supabase

## Project Overview
Create a production-ready full-stack Kanban application for the "BIX IA Hackathon: Kanban de Ideias" project. This application will manage idea cards through workflow stages with real-time collaboration features, user authentication, and comprehensive access controls.

## Technical Stack Requirements

### Backend: Supabase
- **Database**: PostgreSQL with Supabase
- **Authentication**: Supabase Auth with JWT tokens
- **Real-time**: Supabase Realtime subscriptions
- **Security**: Row Level Security (RLS) policies
- **Edge Functions**: For complex business logic if needed

### Frontend: React
- **Framework**: React 18+ with TypeScript
- **State Management**: React Query/TanStack Query for server state
- **UI Library**: Tailwind CSS with Headless UI or Radix UI
- **Drag & Drop**: @dnd-kit/core for Kanban functionality
- **Internationalization**: react-i18next for PT-BR/EN support
- **Build Tool**: Vite for development and bundling

## Database Schema

### Core Tables

```sql
-- Users (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boards
CREATE TABLE public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Columns (workflow stages)
CREATE TABLE public.columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  board_id UUID REFERENCES public.boards(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(board_id, position)
);

-- Cards (idea cards)
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  column_id UUID REFERENCES public.columns(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(column_id, position)
);

-- Votes
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(card_id, user_id)
);

-- Comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes for Performance
```sql
CREATE INDEX idx_cards_column_id ON public.cards(column_id);
CREATE INDEX idx_cards_creator_id ON public.cards(creator_id);
CREATE INDEX idx_votes_card_id ON public.votes(card_id);
CREATE INDEX idx_comments_card_id ON public.comments(card_id);
CREATE INDEX idx_cards_search ON public.cards USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
```

## Row Level Security (RLS) Policies

### User Profiles
```sql
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Boards
```sql
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all boards
CREATE POLICY "Boards are viewable by authenticated users"
  ON public.boards FOR SELECT
  TO authenticated
  USING (true);

-- Only board creators can update boards
CREATE POLICY "Board creators can update boards"
  ON public.boards FOR UPDATE
  USING (auth.uid() = created_by);
```

### Columns
```sql
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all columns
CREATE POLICY "Columns are viewable by authenticated users"
  ON public.columns FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can manage columns
CREATE POLICY "Authenticated users can manage columns"
  ON public.columns FOR ALL
  TO authenticated
  USING (true);
```

### Cards
```sql
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all cards
CREATE POLICY "Cards are viewable by authenticated users"
  ON public.cards FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create cards
CREATE POLICY "Authenticated users can create cards"
  ON public.cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

-- Only card creators can update their cards (except column_id and position)
CREATE POLICY "Card creators can update their cards"
  ON public.cards FOR UPDATE
  USING (auth.uid() = creator_id);

-- Anyone can move cards between columns
CREATE POLICY "Anyone can move cards"
  ON public.cards FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

### Votes
```sql
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all votes
CREATE POLICY "Votes are viewable by authenticated users"
  ON public.votes FOR SELECT
  TO authenticated
  USING (true);

-- Users can manage their own votes
CREATE POLICY "Users can manage their own votes"
  ON public.votes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);
```

### Comments
```sql
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all comments
CREATE POLICY "Comments are viewable by authenticated users"
  ON public.comments FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only comment creators can update/delete their comments
CREATE POLICY "Comment creators can manage their comments"
  ON public.comments FOR ALL
  USING (auth.uid() = user_id);
```

## Frontend Architecture Requirements

### Component Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── AuthGuard.tsx
│   ├── kanban/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── KanbanCard.tsx
│   │   └── CardModal.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   └── LoadingSpinner.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Layout.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useCards.ts
│   ├── useColumns.ts
│   ├── useRealtime.ts
│   └── useLocalStorage.ts
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   ├── database.ts
│   └── utils.ts
├── types/
│   ├── database.ts
│   ├── auth.ts
│   └── kanban.ts
├── i18n/
│   ├── index.ts
│   ├── locales/
│   │   ├── en.json
│   │   └── pt-br.json
└── App.tsx
```

### Key Implementation Requirements

#### 1. Supabase Configuration
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
```

#### 2. Real-time Subscriptions
```typescript
// hooks/useRealtime.ts
export const useRealtimeCards = (columnId?: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const subscription = supabase
      .channel('cards-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: columnId ? `column_id=eq.${columnId}` : undefined
        },
        (payload) => {
          queryClient.invalidateQueries(['cards'])
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [columnId, queryClient])
}
```

#### 3. Drag and Drop Implementation
```typescript
// components/kanban/KanbanBoard.tsx
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCorners
} from '@dnd-kit/core'

export const KanbanBoard = () => {
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const updateCardMutation = useUpdateCard()

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const activeCard = cards.find(card => card.id === active.id)
    if (!activeCard) return

    // Update card position and column
    await updateCardMutation.mutateAsync({
      id: activeCard.id,
      column_id: over.id as string,
      position: calculateNewPosition(over.id, cards)
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Kanban columns and cards */}
    </DndContext>
  )
}
```

#### 4. Search and Filter Functionality
```typescript
// hooks/useCards.ts
export const useCards = (filters: CardFilters) => {
  return useQuery({
    queryKey: ['cards', filters],
    queryFn: async () => {
      let query = supabase
        .from('cards')
        .select(`
          *,
          creator:user_profiles(display_name, avatar_url),
          votes(count),
          comments(count)
        `)

      if (filters.search) {
        query = query.textSearch('fts', filters.search)
      }

      if (filters.columnId) {
        query = query.eq('column_id', filters.columnId)
      }

      if (filters.creator) {
        query = query.eq('creator_id', filters.creator)
      }

      const { data, error } = await query.order('position')

      if (error) throw error
      return data
    }
  })
}
```

#### 5. Internationalization Setup
```typescript
// i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ptBR from './locales/pt-br.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'pt-BR': { translation: ptBR }
    },
    lng: 'pt-BR', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
```

### Feature Implementation Requirements

#### 1. Authentication System
- Login/signup forms with email/password
- Social login options (Google, GitHub)
- Password reset functionality
- Protected routes with AuthGuard component
- User profile management

#### 2. Kanban Board Interface
- Responsive drag-and-drop columns and cards
- Real-time updates for all users
- Card preview with vote count and comment count
- Quick actions (vote, add to favorites)
- Column management (add, edit, reorder)

#### 3. Card Management
- Modal for creating/editing cards
- Rich text editor for descriptions
- Tag system for categorization
- Priority levels (low, medium, high)
- Attachment support (future enhancement)

#### 4. Voting and Comments
- One vote per user per card
- Real-time vote count updates
- Threaded comments with real-time updates
- Comment editing and deletion
- User mentions in comments

#### 5. Search and Filtering
- Full-text search across title and description
- Filter by column, creator, tags, priority
- Search suggestions and autocomplete
- Saved searches (future enhancement)

#### 6. Real-time Collaboration
- Live cursor tracking (future enhancement)
- User presence indicators
- Real-time notifications for card updates
- Activity feed for board changes

### Performance Optimizations

#### 1. Query Optimization
- Use React Query for caching and background updates
- Implement pagination for large card lists
- Optimize Supabase queries with proper indexes
- Use select() to limit data transfer

#### 2. Real-time Efficiency
- Selective subscriptions based on current view
- Debounce frequent updates
- Batch multiple changes together
- Unsubscribe from channels when components unmount

#### 3. UI Performance
- Virtual scrolling for large lists
- Lazy loading of card details
- Optimistic updates for immediate feedback
- Memoize expensive computations

### Security Considerations

#### 1. Data Protection
- Validate all inputs on both client and server
- Sanitize user-generated content
- Implement rate limiting for API calls
- Use HTTPS for all communications

#### 2. Access Control
- Enforce RLS policies consistently
- Validate user permissions before mutations
- Audit log for sensitive operations
- Session management with automatic refresh

### Error Handling and UX

#### 1. Error Boundaries
- Global error boundary for uncaught errors
- Component-level error handling
- User-friendly error messages
- Retry mechanisms for failed operations

#### 2. Loading States
- Skeleton screens for initial loads
- Progress indicators for long operations
- Optimistic updates with rollback
- Background sync indicators

### Mobile Responsiveness

#### 1. Touch Interactions
- Touch-friendly drag and drop
- Swipe gestures for mobile navigation
- Responsive breakpoints
- Mobile-optimized modals and forms

#### 2. PWA Features
- Service worker for offline functionality
- App manifest for installability
- Push notifications for updates
- Background sync for offline changes

## Environment Configuration

### Required Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME="BIX Kanban Ideas"
```

### Supabase Project Setup
1. Create new Supabase project
2. Enable Row Level Security
3. Set up authentication providers
4. Configure realtime for required tables
5. Set up Edge Functions if needed

## Success Criteria

### Functional Requirements
- ✅ User authentication with Supabase Auth
- ✅ Real-time Kanban board with drag-and-drop
- ✅ Card creation, editing, and management
- ✅ Voting and commenting system
- ✅ Search and filter functionality
- ✅ Multi-language support (PT-BR/EN)
- ✅ Mobile-responsive design

### Technical Requirements
- ✅ Type-safe TypeScript implementation
- ✅ Proper RLS policies for security
- ✅ Real-time subscriptions working
- ✅ Optimized database queries
- ✅ Error handling and loading states
- ✅ Performance optimizations
- ✅ Accessibility compliance (WCAG 2.1)

### Code Quality
- ✅ Clean, maintainable component architecture
- ✅ Proper separation of concerns
- ✅ Comprehensive type definitions
- ✅ Consistent coding standards
- ✅ Reusable UI components
- ✅ Proper error boundaries

## Additional Notes

This application should serve as a solid foundation for the BIX IA Hackathon project, with room for future enhancements like AI-powered idea categorization, advanced analytics, and integration with external tools. The architecture is designed to be scalable and maintainable, following modern React and Supabase best practices.

Generate all necessary files, components, and configurations to create a production-ready application that can be immediately deployed and used for the hackathon event.