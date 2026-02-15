# Snap Live - Social Live Streaming Platform

## Overview

Snap Live (also referred to as StreamVerse) is a full-stack social live streaming and short-form video platform. It combines TikTok-style video feeds, live streaming with virtual gifting, real-time audio/party rooms, PK battles between streamers, an integrated e-commerce shop (connected to Shopify), creator monetization tools, and agency management. The app is designed as a mobile-first PWA with a dark-themed, premium UI.

The project has **two backend systems**:
1. **Primary server** (`server/`): An Express.js server using Drizzle ORM with PostgreSQL, serving the Vite React frontend. This is the active backend used in development (`npm run dev`).
2. **NestJS backend** (`backend/`): A more feature-complete NestJS API using TypeORM with PostgreSQL, designed for production-scale features (Firebase auth, Agora streaming, Stripe payments, Redis/Bull queues). This is a separate application with its own `package.json` and build process.

The frontend is a React SPA in `client/` built with Vite, TypeScript, Tailwind CSS, and shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
```
├── client/          # React frontend (Vite + TypeScript)
├── server/          # Express.js dev server (Drizzle + PostgreSQL)
├── backend/         # NestJS production API (TypeORM + PostgreSQL)
├── shared/          # Shared schema (Drizzle schema used by Express server)
├── public/          # Static assets, PWA manifest, service worker
├── migrations/      # Drizzle migration files
```

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **Styling**: Tailwind CSS with CSS variables for theming (dark/light mode via `class` strategy)
- **UI Components**: shadcn/ui (Radix primitives + Tailwind)
- **State Management**: React Query (TanStack Query) for server state, Zustand stores (e.g., `cartStore`) for client state
- **Routing**: React Router v6 with protected routes via `AuthContext`
- **API Client**: Axios configured at `/api` base URL with credentials
- **PWA**: Service worker for offline support, manifest.json for installability
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` to `shared/`, `@assets/` to `attached_assets/`

### Key Frontend Pages
- **Feed**: Full-screen vertical swipe video feed (TikTok-style) with like/comment/share/save
- **Live**: Live streaming grid with categories, PK battles, party rooms
- **Discover**: Search, trending hashtags, categories, suggested users
- **Create**: Video recording, go-live, audio rooms, photo/story posting
- **Messages**: Direct messaging with conversation list
- **Profile**: User profile with stats, wallet, level progress, video grid
- **Shop**: E-commerce integrated with Shopify Storefront API
- **Creator Studio**: Analytics dashboard for content creators
- **Agency**: Agency management and application flow

### Primary Backend (Express - `server/`)
- **Runtime**: Express.js started via `tsx server/index.ts`
- **Database**: PostgreSQL via Drizzle ORM (`server/db.ts`)
- **Schema**: Defined in `shared/schema.ts` using Drizzle's `pgTable` definitions
- **Authentication**: Session-based auth with `express-session` and `memorystore`, bcryptjs for password hashing
- **API prefix**: `/api/` routes (auth, videos, users, follows, etc.)
- **Dev mode**: Vite dev server middleware integrated into Express for HMR
- **Production build**: `vite build` for frontend + `esbuild` bundles server to `dist/index.cjs`
- **Port**: 5000

### Database Schema (Drizzle - `shared/schema.ts`)
Key tables:
- `users` - Core user table with email, password, profile fields, balances (coins/diamonds), follower counts, verification status
- `user_roles` - Role assignments (admin, moderator, user, creator, vip)
- `followers` - Follow relationships between users
- `videos` - Short-form video content with metadata
- `video_likes`, `video_saves`, `video_comments` - Video interaction tables
- Uses PostgreSQL enums for `user_level` and `app_role`

### NestJS Backend (`backend/`)
- **Framework**: NestJS with TypeORM (PostgreSQL)
- **Modules**: Auth, Users, Profiles, Videos, Live, PK Battles, Chat, Party Rooms, Gifts, Wallet, Payments, Reports, Agencies, Shop, Notifications, Admin, Storage, Realtime, Badges, Store Integrations, Sounds, Hashtags
- **Auth**: JWT-based with Passport.js, Firebase UID support, refresh tokens
- **Real-time**: Socket.IO via `@nestjs/websockets`
- **Streaming**: Agora access tokens for live streaming
- **Queue processing**: Bull with Redis (ioredis)
- **Payments**: Stripe integration
- **Push notifications**: Firebase Admin SDK
- **Security**: Helmet, CORS, rate limiting (`@nestjs/throttler`), validation pipes
- **API docs**: Swagger/OpenAPI
- **Entity architecture**: Full TypeORM entities with UUIDs, comprehensive enums, and indexes
- **Note**: This backend runs separately and is NOT the default dev server

### Authentication Flow
The Express server uses session-based auth:
1. `POST /api/auth/register` - Creates user with hashed password, assigns "user" role
2. `POST /api/auth/login` - Validates credentials, sets session
3. `GET /api/auth/me` - Returns current session user
4. Frontend `AuthContext` checks `/api/auth/me` on load, provides `signIn`/`signUp`/`signOut` methods
5. `ProtectedRoute` component redirects unauthenticated users to `/login`

### Storage Pattern
- `IStorage` interface defines all data access methods
- `DatabaseStorage` class implements it using Drizzle queries
- Exported as singleton `storage` instance

## External Dependencies

### Database
- **PostgreSQL** - Primary database, required via `DATABASE_URL` environment variable
- **Drizzle ORM** - Used by Express server for schema definition and queries
- **TypeORM** - Used by NestJS backend for entity management
- **Redis** - Used by NestJS backend for Bull job queues and caching (via ioredis)

### Third-Party Services
- **Shopify Storefront API** - E-commerce integration for the Shop feature. Store domain: `snaplivepk-8fksi.myshopify.com`. Uses GraphQL Storefront API with a public token for product fetching, cart management, and checkout. Configuration in `client/src/lib/shopify.ts`.
- **Supabase** - Client SDK included (`@supabase/supabase-js`) but currently the Express server uses direct PostgreSQL/Drizzle instead.
- **Agora** - Live streaming infrastructure (token generation in NestJS backend via `agora-access-token`)
- **Firebase Admin** - Push notifications (FCM tokens), social auth verification (in NestJS backend)
- **Stripe** - Payment processing for coin purchases and wallet top-ups (in NestJS backend)

### Key NPM Packages
- **Frontend**: react-router-dom, @tanstack/react-query, axios, zustand, sonner (toasts), lucide-react (icons), cmdk, recharts
- **Express Server**: express-session, memorystore, bcryptjs, drizzle-orm, pg
- **NestJS Backend**: @nestjs/*, typeorm, passport, passport-jwt, bull, firebase-admin, stripe, helmet, compression

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string (required for both servers)
- `SESSION_SECRET` - Express session secret (defaults to dev value)
- NestJS backend expects additional: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `FRONTEND_URL`, `API_PREFIX`, plus service-specific keys for Stripe, Firebase, Agora, Redis