# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (runs on port 8080)
- **Build for production**: `npm run build`
- **Build for development**: `npm run build:dev`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Technology Stack

This is a full-stack Kanban dashboard application built with:
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL database + Auth + Realtime)
- **State Management**: TanStack Query (React Query) for server state
- **Drag & Drop**: @dnd-kit libraries for kanban functionality
- **Routing**: React Router DOM

## Architecture Overview

### Authentication Flow
- Uses Supabase Auth with email/password authentication
- `AuthGuard` component protects routes requiring authentication
- `useAuth` hook manages authentication state
- Authentication pages accessible at `/auth` route

### Database Schema
Key tables in Supabase:
- `user_profiles`: Extended user information (display_name, avatar_url)
- `boards`: Kanban boards (currently using default board)
- `columns`: Board columns (To Do, In Progress, Done, etc.)
- `cards`: Individual cards with title, description, priority, tags
- `votes`: User votes on cards
- `comments`: Comments on cards

### Real-time Features
- `useRealtime` hook subscribes to Supabase realtime updates
- Automatically syncs card updates, votes, and comments across clients
- Uses TanStack Query for optimistic updates and cache management

### Component Structure
```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── kanban/         # Kanban board components
│   ├── layout/         # Layout components (Header, etc.)
│   └── ui/             # shadcn/ui reusable components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility functions
├── pages/              # Route components
└── types/              # TypeScript type definitions
```

### Key Hooks
- `useKanban.ts`: All kanban-related data operations (CRUD for cards, columns, votes, comments)
- `useAuth.ts`: Authentication state and operations
- `useRealtime.ts`: Real-time subscription management

### Data Flow
1. TanStack Query manages all server state and caching
2. Supabase client handles database operations and real-time subscriptions
3. Custom hooks abstract complex operations and provide reactive data
4. Components consume hooks for data and mutations

## Development Notes

### Environment Variables
- Supabase configuration is in `.env` file
- Project uses Supabase project ID: `ltaqzxynnssnfzstjmrp`

### Styling Conventions
- Uses Tailwind CSS with custom configuration in `tailwind.config.ts`
- shadcn/ui components provide consistent design system
- Custom CSS variables for theming support

### Import Aliases
- `@/` maps to `src/` directory via Vite configuration

### Drag and Drop
- Uses @dnd-kit for kanban card drag and drop functionality
- Handles both column-to-column and position reordering
- Optimistic updates with database sync via `useMoveCard` hook

### Type Safety
- Comprehensive TypeScript types in `src/types/database.ts`
- Generated types from Supabase schema
- Custom extended types for UI-specific data (vote counts, etc.)

## Testing and Quality

- ESLint configuration in `eslint.config.js`
- TypeScript strict mode enabled
- No test framework currently configured

## Project Documentation Workflow

**IMPORTANT**: All prompts made to Claude Code and their outcomes must be documented in `PROJECT_JOURNAL.md`. When working with Claude Code:

1. **Document Every Prompt**: Add a new entry to `PROJECT_JOURNAL.md` for each significant prompt or request made to Claude Code
2. **Include the Outcome**: Document the general result and impact of each prompt, not just the specific code changes
3. **Maintain Chronological Order**: Entries should be numbered and dated to track project evolution
4. **Focus on Intent and Results**: Describe what was asked for and what was accomplished, helping future developers understand decision-making processes

This workflow ensures complete traceability of all AI-assisted development decisions and maintains project context for future work.