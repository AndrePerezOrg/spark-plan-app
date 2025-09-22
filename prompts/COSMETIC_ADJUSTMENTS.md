# KANBAN DASHBOARD PROJECT - COSMETIC ADJUSTMENTS

**Project Overview:**
This is a full-stack collaborative Kanban Dashboard built with React + TypeScript + Vite + Supabase. The application features real-time collaborative kanban boards with drag-and-drop functionality, authentication, voting, commenting, and live updates. Originally built using the Lovable platform, now being developed with Claude Code.

**Key Technologies & Stack:**
- **Frontend**: React 18, TypeScript, Vite (dev server on port 8080)
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom configuration
- **Backend**: Supabase (PostgreSQL + Auth + Realtime subscriptions)
- **State Management**: TanStack Query (React Query) for server state
- **Drag & Drop**: @dnd-kit libraries for kanban functionality
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation

**Project Structure:**
```
/home/andrepz/Documentos/Projetos/bix/OKR/3_2025/kanban_dashboard/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── kanban/         # Kanban board components
│   │   ├── layout/         # Layout components (Header, etc.)
│   │   └── ui/             # shadcn/ui reusable components
│   ├── hooks/              # Custom React hooks (useKanban, useAuth, useRealtime)
│   ├── integrations/       # External service integrations
│   ├── lib/                # Utility functions
│   ├── pages/              # Route components
│   └── types/              # TypeScript type definitions (database.ts)
├── CLAUDE.md              # Complete development guide and architecture docs
├── PROJECT_JOURNAL.md     # MUST be updated with every prompt and outcome
└── package.json           # npm scripts: dev, build, build:dev, lint, preview
```

**Critical Files & Hooks:**
- **`src/hooks/useKanban.ts`**: All kanban data operations (CRUD for cards, columns, votes, comments)
- **`src/hooks/useAuth.ts`**: Authentication state and operations management
- **`src/hooks/useRealtime.ts`**: Real-time subscription management for collaborative features
- **`src/types/database.ts`**: Complete TypeScript types generated from Supabase schema

**Database Schema (Supabase Project ID: ltaqzxynnssnfzstjmrp):**
- `user_profiles`: Extended user information (display_name, avatar_url)
- `boards`: Kanban boards (currently using default board)
- `columns`: Board columns (To Do, In Progress, Done, etc.)
- `cards`: Individual cards with title, description, priority, tags
- `votes`: User votes on cards
- `comments`: Comments on cards
- Real-time subscriptions enable collaborative features across all tables

**Development Commands:**
- `npm run dev` (starts development server on port 8080)
- `npm run build` (production build)
- `npm run lint` (ESLint check)

**Architecture Patterns:**
- TanStack Query manages all server state and caching with optimistic updates
- Custom hooks abstract complex operations and provide reactive data
- AuthGuard component protects routes requiring authentication
- @dnd-kit handles drag-and-drop with database sync via useMoveCard hook
- Import alias: `@/` maps to `src/` directory

**MANDATORY WORKFLOW REQUIREMENTS:**
1. **CRITICAL**: ALL prompts and outcomes must be documented in `PROJECT_JOURNAL.md`
2. Always follow existing code conventions and patterns found in the codebase
3. Use TanStack Query for all server state management - never bypass this pattern
4. Maintain real-time functionality when making changes to data operations
5. Preserve TypeScript strict typing throughout the codebase

**Before starting any work:**
1. Read relevant files to understand current implementation
2. Add new PROJECT_JOURNAL.md entry documenting the prompt and planned approach
3. Follow established patterns in useKanban.ts, useAuth.ts, and useRealtime.ts
4. Update PROJECT_JOURNAL.md with outcome after completion

This project emphasizes maintainable, type-safe code with real-time collaborative features. Always preserve existing functionality when making changes.

The cosmetics choices by Lovable AI are very bad. It basically turned the project unusable with a yellow-based theme and almost no contrast. I want a simpler and more material design approach.
You are allowed to change all components and styles that were made in order to properly follow my design choice.

Also, implement a Dark mode scheme.