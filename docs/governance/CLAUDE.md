# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Action Atlas** is an AI-powered semantic search engine for discovering volunteering activities. It uses vector embeddings and MongoDB Atlas Vector Search to enable natural language queries like "teach kids programming on weekends" to find relevant volunteering opportunities.

**Key Technology**: Next.js 15, TypeScript 5.7, MongoDB Atlas (with vector search), OpenAI embeddings (text-embedding-3-small), Vercel AI SDK v4.

## Development Setup

### Prerequisites
- **Node.js 20+** (LTS recommended)
- **pnpm 8+** (package manager - NOT npm or yarn)
- **MongoDB**: Use Docker Compose (local) or MongoDB Atlas (production)
- **OpenAI API key** for embeddings

### Initial Setup

```bash
# Install dependencies
pnpm install

# Start MongoDB locally (includes vector search support)
docker-compose up -d

# Verify MongoDB is running
docker ps

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your OPENAI_API_KEY and MONGODB_URI
```

### Database Operations

```bash
# Seed database with sample activities
pnpm seed

# Generate embeddings for activities (requires OPENAI_API_KEY)
pnpm generate-embeddings

# Create MongoDB indexes (including vector search index)
pnpm create-indexes
```

### Development Commands

```bash
# Start development server
pnpm dev                        # All apps
pnpm dev --filter=web           # Web app only

# Build
pnpm build                      # All packages and apps
pnpm build --filter=web         # Web app only

# Testing
pnpm test                       # All tests
pnpm test:unit                  # Unit tests only
pnpm test:integration           # Integration tests
pnpm test:e2e                   # End-to-end tests (Playwright)
pnpm test:watch                 # Watch mode

# Code Quality
pnpm type-check                 # TypeScript type checking
pnpm lint                       # ESLint
pnpm lint:fix                   # Auto-fix lint issues
pnpm format                     # Prettier formatting
```

## Architecture

### Monorepo Structure

This is a **Turborepo monorepo** with pnpm workspaces:

```
action-atlas/
├── apps/
│   └── web/                    # Next.js 15 frontend (App Router)
│       ├── app/                # Routes and API endpoints
│       ├── components/         # React components
│       └── lib/                # Utilities (MongoDB, Redis, OpenAI clients)
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── database/               # MongoDB schemas and client
│   ├── ai/                     # AI services (embeddings, vector search)
│   └── config/                 # Shared configs
├── scripts/                    # Database and deployment scripts
└── docs/                       # Comprehensive documentation
```

### Core Technology Decisions

1. **Vector Search**: MongoDB Atlas Vector Search (NOT ChromaDB in production)
   - Native vector search in MongoDB (no separate vector DB)
   - Single source of truth for activities + embeddings
   - See `docs/adr/001-mongodb-atlas-vector-search.md` for rationale

2. **AI Framework**: Vercel AI SDK v4 (NOT Langchain)
   - Langchain is over-abstracted and bloated for our use case
   - Vercel AI SDK is lightweight, type-safe, and streaming-first
   - See `docs/adr/002-vercel-ai-sdk-over-langchain.md` for rationale

3. **Embedding Model**: OpenAI text-embedding-3-small
   - 1536 dimensions
   - 5× cheaper than ada-002
   - Good enough accuracy for volunteering search

4. **State Management**: TanStack Query + Zustand + nuqs
   - TanStack Query: Server state (API data, search results)
   - Zustand: Client state (UI preferences, filters)
   - nuqs: URL state (shareable search queries)

### Search Flow

The semantic search follows this flow:

1. User enters natural language query (e.g., "teach kids math")
2. API route validates input and checks rate limit (20 req/min)
3. Generate query embedding via OpenAI (cached in Redis for 30 days)
4. MongoDB Vector Search finds similar activities (cosine similarity)
5. Optional: Apply geospatial filtering if location provided
6. Return ranked results (semantic relevance + proximity)
7. Cache full results in Redis (5-minute TTL)

**Performance targets**: <200ms total latency (p95), <50ms for cached queries

### Data Models

**Activity Document** (MongoDB):
```typescript
{
  _id: ObjectId,
  activityId: string,              // Business ID (CUID)
  title: string,
  description: string,
  organizationId: string,
  category: 'education' | 'environment' | ...,
  skills: Array<{ name: string, level?: string }>,
  location: {
    address: { city, country, ... },
    coordinates: {
      type: 'Point',
      coordinates: [lng, lat]        // GeoJSON format
    }
  },
  embedding: number[],               // 1536-dimensional vector
  embeddingModel: 'text-embedding-3-small',
  searchableText: string,            // Concatenated text for embedding
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**MongoDB Indexes**:
- Vector search index on `embedding` field (1536 dimensions, cosine similarity)
- 2dsphere index on `location.coordinates` for geospatial queries
- Compound index on `category`, `isActive`, `location.coordinates`
- Text index on `title`, `description`, `searchableText` (fallback)

## Important Development Patterns

### TypeScript Usage

- **Strict mode enabled**: All strict flags on, including `noUncheckedIndexedAccess`
- **Path aliases**: Use `@/` prefix for imports from project root
- **Type everything**: No implicit `any`, no type assertions without comments
- **Zod for validation**: All API inputs validated with Zod schemas

### API Routes (Next.js App Router)

API routes are in `apps/web/app/api/`:
- `POST /api/search` - Semantic search endpoint
- `GET /api/activities/:id` - Get activity details
- `POST /api/activities` - Create activity (admin)
- `GET /api/organizations/:id` - Get organization profile

All API routes:
- Validate input with Zod schemas
- Check rate limits (Upstash Rate Limit)
- Return JSON with proper error handling
- Include execution time in metadata

### Vector Embeddings

When working with embeddings:

1. **Always cache embeddings**: 30-day TTL in Redis
2. **Normalize text before embedding**: Lowercase, trim, remove extra spaces
3. **Use `searchableText` field**: Concatenate title + description + skills + location
4. **Batch generation**: Use `embedMany()` for multiple activities
5. **Update embedding on content change**: Set `embeddingUpdatedAt` timestamp

```typescript
// Generate searchable text
const searchableText = [
  activity.title,
  activity.description,
  activity.organization.name,
  activity.skills.map(s => s.name).join(', '),
  activity.category,
  activity.location.address.city
].filter(Boolean).join('. ');

// Generate embedding
const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: searchableText,
});
```

### Docker Compose for Local Development

The Docker Compose setup includes:
- **MongoDB 8.2** with replica set (required for vector search)
- **mongot** (MongoDB Search binary for vector operations)
- **Init container** that loads sample data and creates indexes

After starting Docker Compose, wait ~30 seconds for initialization to complete.

## Testing Guidelines

### Unit Tests (Vitest)

- Test files: `*.test.ts` (co-located with source)
- Focus on business logic, utilities, and pure functions
- Mock external dependencies (MongoDB, OpenAI, Redis)

### Integration Tests (Vitest + MongoDB Memory Server)

- Test files: `*.integration.test.ts`
- Use MongoDB Memory Server for isolated database tests
- Test API routes end-to-end with real database operations

### E2E Tests (Playwright)

- Test files: `tests/e2e/*.spec.ts`
- Test user flows: search, view activity, filter results
- Run against local development server

## Documentation

**Essential reading**:
- `docs/product-vision.md` - Product goals, target users, MVP scope
- `docs/tech-stack.md` - Complete technology decisions with rationale
- `docs/architecture.md` - System architecture, data flow, performance targets
- `docs/milestones.md` - Implementation plan broken into phases

**Architecture Decision Records** (ADRs):
- `docs/adr/001-mongodb-atlas-vector-search.md` - Why MongoDB Atlas over ChromaDB
- `docs/adr/002-vercel-ai-sdk-over-langchain.md` - Why Vercel AI SDK over Langchain

## Key Constraints

1. **No authentication in MVP**: Public search only, admin approval workflow manual
2. **No donations**: Focus exclusively on volunteering activities (time-based)
3. **MongoDB Atlas Vector Search**: Use native MongoDB vector search, not separate vector DB
4. **Vercel AI SDK only**: Do NOT use Langchain
5. **Type safety**: Strict TypeScript, no `any` types
6. **Cost optimization**: Cache embeddings aggressively (30-day TTL), use text-embedding-3-small

## Environment Variables

Required environment variables (`.env.local`):

```bash
# MongoDB (local or Atlas)
MONGODB_URI=mongodb://localhost:27017/actionatlas

# OpenAI API Key (required for embeddings)
OPENAI_API_KEY=sk-proj-...

# Redis (optional for MVP, recommended for production)
REDIS_URL=redis://localhost:6379

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

**Never commit** `.env` or `.env.local` files to Git.

## Common Gotchas

1. **MongoDB Replica Set Required**: Vector search requires replica set mode. Use Docker Compose or MongoDB Atlas.

2. **Embedding Dimensions**: Always use 1536 dimensions for text-embedding-3-small. Do NOT change this without updating MongoDB vector index.

3. **GeoJSON Format**: Coordinates are `[longitude, latitude]` (NOT lat/lng). Easy to get backwards.

4. **Rate Limits**: OpenAI API has rate limits. Use batch operations (`embedMany`) and cache aggressively.

5. **pnpm Workspaces**: Always use `pnpm` commands, not `npm`. Use `--filter` to target specific packages.

6. **Next.js App Router**: This uses App Router (NOT Pages Router). Server Components by default, Client Components need `'use client'`.

## Performance Targets

- Search latency (p95): **<200ms** (cache miss), **<50ms** (cache hit)
- Embedding generation: **<150ms** (OpenAI API call)
- Vector search: **<50ms** (MongoDB Atlas)
- Uptime: **>99.9%**
- Error rate: **<1%**

## Deployment

- **Hosting**: Railway (production deployments with automated CI/CD)
- **Database**: MongoDB Atlas (M0 free tier for MVP, M10 for production)
- **CI/CD**: GitHub Actions (lint, test, type-check, build before deploy)
  - Automated deployments trigger on push to main branch
  - Secret validation before deployment
  - Build pipeline: validate → type-check → lint → test → build → deploy
  - Deployment verification with health checks
  - Automatic rollback on failure
  - See `.github/RAILWAY_SETUP.md` for configuration
  - See `.github/workflows/deploy-railway.yml` for workflow details
- **Monitoring**: Sentry (error tracking), Railway metrics

See `README.md` for detailed deployment instructions.
