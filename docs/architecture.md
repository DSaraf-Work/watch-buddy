# Watch-Buddy Architecture Documentation

**Last Updated**: 2025-10-20
**Version**: 1.1.0 (Phase 1 Complete)

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Database Architecture](#4-database-architecture)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [API Design](#6-api-design)
7. [Frontend Architecture](#7-frontend-architecture)
8. [External Integrations](#8-external-integrations)
9. [Security](#9-security)
10. [Performance & Caching](#10-performance--caching)
11. [Deployment](#11-deployment)

---

## 1. System Overview

### 1.1 Purpose
Watch-Buddy is a cross-platform application that centralizes users' watch history and watchlists across major OTT services, providing detailed metadata, search capabilities, and viewing insights.

### 1.2 Core Capabilities
- User authentication and profile management
- Movie/series search with detailed metadata
- Personal and shared watchlist management
- Watch history tracking with ratings and reviews
- Viewing insights and personalized recommendations
- Multi-user collaborative features

### 1.3 Architecture Pattern
- **Frontend**: Server-Side Rendering (SSR) with Next.js App Router
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Deployment**: Vercel Edge Network

---

## 2. Technology Stack

### 2.1 Frontend
- **Framework**: Next.js 14+ (App Router, React Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (accessible primitives)
- **Icons**: Lucide React
- **State Management**: React Context + Hooks (Zustand for complex state)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts / Chart.js

### 2.2 Backend
- **Runtime**: Node.js (Vercel serverless)
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Supabase Client (direct SQL where needed)
- **Authentication**: Supabase Auth

### 2.3 External Services
- **Movie Data**: TMDB API (primary), OMDB API (fallback)
- **OTT Availability**: JustWatch API / Manual curation
- **Email**: Supabase Auth (email templates)

### 2.4 Development Tools
- **Testing**: Playwright (E2E), Jest (unit tests)
- **Linting**: ESLint
- **Formatting**: Prettier
- **Version Control**: Git
- **CI/CD**: Vercel (automatic deployments)

---

## 3. Project Structure

```
watch-buddy/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── reset-password/
│   │   ├── (protected)/              # Protected route group
│   │   │   ├── dashboard/
│   │   │   ├── search/
│   │   │   ├── watchlist/
│   │   │   ├── history/
│   │   │   └── insights/
│   │   ├── api/                      # API routes
│   │   │   ├── auth/
│   │   │   ├── content/
│   │   │   ├── watchlist/
│   │   │   ├── history/
│   │   │   └── insights/
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── modal.tsx
│   │   ├── features/                 # Feature-specific components
│   │   │   ├── auth/
│   │   │   ├── search/
│   │   │   ├── watchlist/
│   │   │   └── history/
│   │   └── layout/                   # Layout components
│   │       ├── header.tsx
│   │       ├── footer.tsx
│   │       └── sidebar.tsx
│   ├── lib/
│   │   ├── supabase/                 # Supabase utilities
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── api/                      # API utilities
│   │   │   ├── tmdb.ts               # TMDB integration
│   │   │   └── cache.ts              # Caching utilities
│   │   └── utils/                    # General utilities
│   │       ├── format.ts
│   │       └── validation.ts
│   ├── types/                        # TypeScript types
│   │   ├── database.ts               # Database types
│   │   ├── api.ts                    # API types
│   │   └── content.ts                # Content types
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useContent.ts
│   │   └── useWatchlist.ts
│   └── constants/                    # App constants
│       ├── routes.ts
│       └── config.ts
├── supabase/
│   ├── migrations/                   # Database migrations
│   │   └── 001_initial_schema.sql
│   └── seed.sql                      # Seed data
├── public/                           # Static assets
│   ├── images/
│   └── icons/
├── tests/
│   ├── e2e/                          # Playwright tests
│   └── unit/                         # Jest tests
├── dev/
│   ├── feature/                      # Feature requirements
│   └── impl/                         # Implementation plans
├── docs/
│   └── architecture.md               # This file
├── .env.local                        # Environment variables
├── .env.example                      # Example env file
├── next.config.js                    # Next.js config
├── tailwind.config.js                # Tailwind config
├── tsconfig.json                     # TypeScript config
├── playwright.config.ts              # Playwright config
└── package.json
```

---

## 4. Database Architecture

### 4.1 Schema Overview
The database follows a normalized relational model with the following core entities:

- **profiles**: User profiles (extends Supabase auth.users)
- **content**: Movies and series metadata
- **ott_platforms**: OTT platform information
- **content_availability**: Content availability on platforms
- **watchlists**: User watchlists
- **watchlist_members**: Shared watchlist members
- **watchlist_items**: Items in watchlists
- **watch_history**: User watch history
- **watch_sessions**: Episode-level tracking
- **user_preferences**: Computed user preferences
- **recommendations**: Cached recommendations

### 4.2 Key Relationships
```
profiles (1) ──< (N) watchlists
profiles (1) ──< (N) watchlist_members
profiles (1) ──< (N) watch_history
watchlists (1) ──< (N) watchlist_items
watchlists (1) ──< (N) watchlist_members
content (1) ──< (N) watchlist_items
content (1) ──< (N) watch_history
content (1) ──< (N) content_availability
ott_platforms (1) ──< (N) content_availability
```

### 4.3 Indexing Strategy
- Primary keys on all tables (UUID)
- Foreign key indexes for joins
- Composite indexes for common queries
- Text search indexes on content.title
- Timestamp indexes for date-based queries

### 4.4 Row Level Security (RLS)
All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- Shared watchlists accessible to members
- Public content data readable by all authenticated users

---

## 5. Authentication & Authorization

### 5.1 Authentication Flow (✅ Implemented)
1. User signs up with email/password via `/auth/signup`
2. Supabase Auth creates user in auth.users
3. Database trigger `on_auth_user_created` creates profile in profiles table
4. Session token stored in HTTP-only cookie
5. Middleware validates session on protected routes
6. User redirected to dashboard on successful authentication

**Implemented Pages:**
- `/auth/login` - Email/password login
- `/auth/signup` - User registration with display name
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset completion
- `/auth/callback` - OAuth callback handler

### 5.2 Session Management (✅ Implemented)
- Sessions stored in HTTP-only cookies via Supabase Auth
- Automatic refresh before expiration (handled by Supabase client)
- Server-side session validation in middleware
- Client-side auth state via AuthProvider context
- Real-time auth state updates via `onAuthStateChange` listener

**Implementation Details:**
```typescript
// Client-side auth hook
const { user, session, loading, isAuthenticated } = useAuth()

// Server-side session check
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### 5.3 Protected Routes (✅ Implemented)
**Middleware Protection:**
- Checks session validity on every request
- Redirects unauthenticated users to `/auth/login`
- Preserves intended destination in `redirectTo` parameter
- Redirects authenticated users away from auth pages

**Protected Pages:**
- `/dashboard` - User dashboard
- `/profile` - Profile management
- `/search` - Content search (future)
- `/watchlist` - Watchlist management (future)
- `/history` - Watch history (future)
- `/insights` - Viewing insights (future)

### 5.4 Authorization Levels
- **Unauthenticated**: Public pages, auth pages only
- **Authenticated**: Access to all user features
- **Watchlist Owner**: Full control over watchlist (future)
- **Watchlist Member**: View and add to shared watchlist (future)

### 5.5 Authentication Components (✅ Implemented)
**Hooks:**
- `useAuth()` - Session and user state management
- `useUser()` - User profile data with update functionality

**Context:**
- `AuthProvider` - Global authentication state provider

**Forms:**
- `LoginForm` - Email/password login with validation
- `SignupForm` - Registration with display name, password confirmation
- `ForgotPasswordForm` - Password reset request
- `ResetPasswordForm` - Password reset completion

**UI Components:**
- `Button` - Reusable button with loading states
- `Input` - Form input with labels, errors, helper text

---

## 6. API Design

### 6.1 API Structure
- RESTful API routes under `/api/*`
- Consistent response format
- Error handling middleware
- Request validation with Zod

### 6.2 Response Format
```typescript
{
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### 6.3 Error Handling
- Standardized error codes
- User-friendly error messages
- Logging for debugging
- Graceful degradation

---

## 7. Frontend Architecture

### 7.1 Component Hierarchy
- **Pages**: Route-level components (App Router)
- **Features**: Feature-specific components
- **UI**: Reusable presentational components
- **Layout**: Structural components

### 7.2 State Management
- **Server State**: React Server Components
- **Client State**: React Context + Hooks
- **Form State**: React Hook Form
- **Cache**: SWR / React Query (if needed)

### 7.3 Rendering Strategy
- **SSR**: Initial page loads
- **CSR**: Interactive features
- **ISR**: Content pages (revalidation)
- **Static**: Marketing pages

---

## 8. External Integrations

### 8.1 TMDB API
- Movie/series metadata
- Search functionality
- Cast and crew information
- Images and trailers
- Rate limiting: 40 requests/10 seconds

### 8.2 Caching Strategy
- Cache API responses in database
- TTL: 7 days for metadata
- Invalidate on user request
- Reduce API calls by 80%+

---

## 9. Security

### 9.1 Security Measures
- Row Level Security (RLS) on all tables
- HTTP-only cookies for sessions
- CSRF protection
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping)

### 9.2 Data Privacy
- User data isolated by RLS
- No sharing of personal data
- Secure password hashing (Supabase)
- GDPR-compliant data handling

---

## 10. Performance & Caching

### 10.1 Caching Layers
- **Browser**: Static assets, images
- **CDN**: Vercel Edge Network
- **Application**: API response caching
- **Database**: Query result caching

### 10.2 Optimization Techniques
- Image optimization (Next.js Image)
- Code splitting (automatic)
- Lazy loading components
- Database query optimization
- Debounced search inputs

---

## 11. Deployment

### 11.1 Vercel Deployment
- Automatic deployments from Git
- Preview deployments for PRs
- Environment variables management
- Edge Network distribution
- Serverless functions

### 11.2 Environment Configuration
- **Development**: Local Supabase + TMDB test key
- **Staging**: Staging Supabase + TMDB test key
- **Production**: Production Supabase + TMDB production key

---

**End of Architecture Document**

