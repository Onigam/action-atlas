# Action Atlas Technology Stack (2026)

## Executive Summary

Action Atlas uses a modern, AI-first technology stack optimized for semantic search with vector embeddings. All technology choices prioritize developer experience for AI agents, type safety, and pragmatic simplicity over unnecessary abstraction.

---

## Frontend Stack

### Framework: Next.js 15 (App Router) + React 19

**Rationale:**
- **Turbopack** production-ready: 10× faster builds, near-instantaneous hot reloads
- **React 19 Compiler**: 15-20% faster rendering with automatic optimizations
- **Server Components**: Reduced client JS, better SEO for activity pages
- **Edge Runtime**: Global low-latency search responses
- **Streaming**: Progressive search result rendering

**Key Features Used:**
- Server Components for activity listings and detail pages
- Client Components for interactive search UI
- Server Actions for form submissions (activity creation)
- Parallel routes for modals and overlays
- Metadata API for SEO optimization

### Language: TypeScript 5.7+

**Configuration:**
- Strict mode enabled (all strict flags)
- `noUncheckedIndexedAccess: true` - prevents array access errors
- `exactOptionalPropertyTypes: true` - stricter optional handling
- Path aliases with `@/` prefix for clean imports
- Monorepo with TypeScript project references

### UI Components: shadcn/ui + Radix UI + Tailwind CSS

**Rationale:**
- **shadcn/ui**: Copy-paste components (full ownership, no NPM bloat)
- **Radix UI**: Accessible primitives (ARIA, keyboard navigation)
- **Tailwind CSS**: Utility-first styling, rapid development

**Migration Plan:**
- Radix UI maintenance concerns noted (creators moved to Base UI)
- Plan migration to React Aria Components if Radix degrades
- shadcn/ui patterns remain regardless of underlying primitive library

### State Management: TanStack Query + Zustand + nuqs

**Architecture:**
- **TanStack Query**: Server state (API data, search results, activity cache)
- **Zustand**: Client state (UI preferences, search filters, map view state)
- **nuqs**: URL state (shareable search queries with type-safe params)

**Example:**
```typescript
// Server state: Search results
const { data: activities, isLoading } = useQuery({
  queryKey: ['activities', searchQuery, filters],
  queryFn: () => searchActivities(searchQuery, filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Client state: Search filters
const useSearchStore = create<SearchStore>((set) => ({
  filters: { location: null, category: [], skills: [] },
  setFilters: (filters) => set({ filters }),
}));

// URL state: Query parameters
const [query, setQuery] = useQueryState('q');
const [category, setCategory] = useQueryState('category');
```

---

## Backend Stack

### API Framework: Hono (Primary) + Next.js API Routes (Secondary)

**Architecture Decision:**
```
┌─────────────────────────────────────────┐
│   Next.js 15 (Vercel)                   │
│   - Server Components                   │
│   - Simple API routes (webhooks)        │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│   Hono API Server (Vercel Edge/Railway) │
│   - Semantic search endpoint            │
│   - Embedding generation                │
│   - Activity CRUD                       │
│   - Vector operations                   │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
┌──────────────┐  ┌─────────────┐
│  MongoDB     │  │  ChromaDB   │
│  Atlas       │  │  (Vectors)  │
└──────────────┘  └─────────────┘
```

**Why Hono:**
- Ultra-fast: 5× faster than Express
- Edge-ready: Runs on Vercel Edge, Cloudflare Workers, Node.js, Bun
- Type-safe routing with RPC client generation
- Lightweight: ~20KB, minimal dependencies
- Modern: Built for async/await, Web Standards (Fetch API)

**When to use Next.js API Routes:**
- Simple CRUD proxies
- Webhooks
- Image uploads (Server Actions)
- When you need tight Server Component integration

### AI Framework: Vercel AI SDK v4 (NOT Langchain)

**Rationale:**
- **LangChain is bloated in 2026**: 20+ abstraction layers for simple embeddings
- **Vercel AI SDK is lightweight**: Direct, type-safe, minimal overhead
- **Built-in rate limiting**: Handles OpenAI API rate limits automatically
- **Streaming-first**: Perfect for progressive UI updates
- **Framework agnostic**: Works with Next.js, Hono, any JS runtime

**Example:**
```typescript
import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';

// Single embedding
const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: activityDescription,
});

// Batch embeddings with automatic rate limiting
const { embeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: activities.map(a => a.description),
});
```

**Why NOT Langchain:**
- Over-abstracted (simple tasks require complex chains)
- Heavy dependencies (~50MB+ node_modules)
- Breaking changes frequently
- Poor TypeScript inference
- AI agents struggle with complex abstractions

**Alternative Considered:**
- **Direct OpenAI SDK**: Valid for very simple use cases (just embeddings)
- **LlamaIndex**: Better than Langchain but overkill for Action Atlas
- **LangGraph**: Only if you need complex multi-step agent workflows

---

## Database Stack

### Primary Database: MongoDB Atlas (with Vector Search)

**Rationale:**
- **Native vector search**: MongoDB Atlas Vector Search (no separate vector DB needed)
- **Single source of truth**: Activities + embeddings in same documents
- **No synchronization issues**: Update data and embeddings in one transaction
- **Geospatial support**: Built-in 2dsphere indexing for location queries
- **Flexible schema**: JSON-like documents perfect for activity metadata

**Configuration:**
```javascript
// MongoDB Atlas Vector Search Index
{
  "name": "activity_vector_search",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 1536,  // text-embedding-3-small
        "similarity": "cosine"
      },
      {
        "type": "filter",
        "path": "location.coordinates"
      },
      {
        "type": "filter",
        "path": "category"
      }
    ]
  }
}
```

**Why MongoDB Atlas over separate vector DB:**
- ✅ Simpler architecture (one database instead of two)
- ✅ Better data consistency (ACID transactions)
- ✅ Lower operational complexity
- ✅ Easier deployment and backup
- ✅ Lower latency (no cross-database queries)
- ❌ Slightly less optimized than specialized vector DBs (acceptable trade-off)

### Vector Database Alternative: ChromaDB (Development) / Qdrant (Production)

**Product vision specifies ChromaDB**, so we support both approaches:

**Approach 1: MongoDB Atlas Vector Search (Recommended for MVP)**
- Best for rapid development and deployment
- Single database to manage
- Good enough performance for initial scale

**Approach 2: MongoDB + ChromaDB (Development) + Qdrant (Production)**
- ChromaDB for local development (easy setup)
- Qdrant for production (better performance, open-source)
- Two databases to keep in sync (more complexity)
- Better for high-scale vector operations (1M+ activities)

**Migration path:** Start with MongoDB Atlas Vector Search, migrate to Qdrant if/when performance requires it.

---

## AI/ML Stack

### Embedding Model: OpenAI text-embedding-3-small

**Specifications:**
- **Dimensions**: 1536
- **Cost**: $0.02 per 1M tokens (5× cheaper than ada-002)
- **Performance**: 62.3% better on MTEB benchmark
- **Max tokens**: 8,191

**Why NOT text-embedding-3-large:**
- 5× more expensive ($0.13 per 1M tokens)
- 3072 dimensions (slower similarity search, more storage)
- Marginal accuracy improvement (~3-5% for most use cases)
- Not worth the cost for Action Atlas

**Embedding Strategy:**
```typescript
// Generate searchable text for embedding
function prepareActivityForEmbedding(activity: Activity): string {
  return [
    activity.title,
    activity.description,
    activity.organization.name,
    activity.organization.mission,
    activity.skills.map(s => s.name).join(', '),
    activity.category,
    activity.location.address.city,
    activity.location.address.country,
  ].filter(Boolean).join('. ');
}

// Embed and store
const text = prepareActivityForEmbedding(activity);
const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: text,
});

// Store in MongoDB
await activities.updateOne(
  { _id: activity.id },
  {
    $set: {
      embedding,
      embeddingModel: 'text-embedding-3-small',
      embeddingUpdatedAt: new Date(),
    }
  }
);
```

### Query Enhancement: GPT-4o-mini (Optional)

**Use for:**
- Query intent analysis
- Query expansion (e.g., "help kids" → "mentor children, youth tutoring, child education")
- Location extraction from natural language

**Cost:** $0.15 per 1M tokens (cheap for occasional use)

---

## Development Stack

### Monorepo: Turborepo

**Structure:**
```
action-atlas/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # Hono API server (if separated)
├── packages/
│   ├── database/         # MongoDB schemas + client
│   ├── ai/               # Vercel AI SDK wrappers
│   ├── types/            # Shared TypeScript types
│   └── ui/               # Shared UI components
├── turbo.json
└── package.json
```

**Why Turborepo:**
- Fast incremental builds with caching
- Simple configuration (easier than Nx)
- Excellent TypeScript support
- Native monorepo task orchestration
- Vercel integration

### Package Manager: pnpm

**Why pnpm over npm/yarn:**
- 2× faster installs
- Efficient disk usage (content-addressable storage)
- Strict dependency resolution (no phantom dependencies)
- Workspace support built-in
- Industry standard in 2026

---

## Deployment Stack

### Hosting: Vercel

**Rationale:**
- Native Next.js optimization
- Zero-config deployment
- Built-in preview deployments for every PR
- Edge Functions for global low-latency
- Automatic HTTPS, CDN, image optimization
- **Cost**: Free tier for MVP, $20/month Pro when scaling

### Database Hosting: MongoDB Atlas

**Configuration:**
- **MVP**: M0 Sandbox (FREE, 512MB, shared)
- **Production**: M10 ($57/month, 10GB, dedicated, vector search enabled)
- **Region**: AWS us-east-1 (closest to Vercel)
- **Backup**: Continuous backup with point-in-time recovery

### CI/CD: GitHub Actions

**Pipeline:**
1. Lint & Type Check
2. Unit Tests
3. Integration Tests
4. E2E Tests (Playwright)
5. Deploy Preview (PRs)
6. Deploy Staging (develop branch)
7. Deploy Production (main branch)

**Cost:** Free tier (2,000 minutes/month)

---

## Monitoring Stack

### Application Monitoring

**Primary Tools:**
- **Vercel Analytics**: Built-in Web Vitals, page views, errors
- **Sentry**: Error tracking and performance monitoring ($0 free tier, 5K errors/month)
- **Better Stack**: Uptime monitoring and log aggregation (free tier)

**Custom Metrics:**
```typescript
// Track search performance
interface SearchMetrics {
  query: string;
  resultsCount: number;
  latencyMs: number;
  vectorSearchMs: number;
  embeddingGenerationMs: number;
}

// Track OpenAI costs
interface OpenAIUsageMetrics {
  model: string;
  tokens: number;
  cost: number;
  endpoint: string;
}
```

### Cost Monitoring

**OpenAI API Usage:**
- Daily cost tracking in MongoDB
- Alerts when daily spend > $10
- Monthly budget projections
- Token usage analytics

**MongoDB Atlas:**
- Connection pool metrics
- Query performance monitoring
- Storage utilization tracking
- Index usage statistics

---

## Security Stack

### Authentication (Future - Not MVP)

**Recommendation:** Clerk or Auth0
- **Clerk**: Better DX, modern, AI-agent friendly
- **Auth0**: Enterprise-grade, more features

**MVP:** No authentication (public search, admin approval workflow only)

### Secrets Management

**Storage:** Vercel Environment Variables
- Encrypted at rest
- Access-controlled per environment
- Audit logging

**Rotation:** Quarterly + on-demand

### Rate Limiting

**Strategy:**
- User-facing API: 20 req/min per IP
- OpenAI API: 3,000 req/min (tier-based)
- Admin endpoints: 5 req/min per API key

**Implementation:** Upstash Rate Limit (serverless Redis)

---

## Testing Stack

### Unit Tests: Vitest

**Why Vitest over Jest:**
- 10× faster (uses Vite)
- Native ESM support
- Compatible with Jest API (easy migration)
- Better TypeScript support
- Watch mode with instant HMR

### Integration Tests: Vitest + MongoDB Memory Server

**Setup:**
```typescript
// vitest.integration.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.integration.test.ts'],
    setupFiles: ['./tests/setup-integration.ts'],
    globalSetup: ['./tests/mongodb-memory-server.ts'],
  },
});
```

### E2E Tests: Playwright

**Why Playwright:**
- Cross-browser testing (Chromium, Firefox, WebKit)
- Built-in test runner
- Parallel test execution
- Auto-wait for elements
- Screenshot and video recording

---

## Cost Summary

### MVP Phase (0-1,000 users)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Free | $0 |
| MongoDB Atlas | M0 Sandbox | $0 |
| GitHub Actions | Free | $0 |
| Sentry | Free (5K errors) | $0 |
| Better Stack | Free | $0 |
| OpenAI API | Pay-as-you-go | $5-10 |
| Domain | Annual | ~$1/month |
| **Total** | | **$6-12/month** |

### Scale Phase (10K users, 10K searches/day)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Pro | $20 |
| MongoDB Atlas | M10 (10GB) | $57 |
| Sentry | Team | $26 |
| OpenAI API | Pay-as-you-go | $30-50 |
| **Total** | | **$133-153/month** |

---

## Architecture Decision Records (ADRs)

Key decisions documented in `/docs/adr/`:

1. **ADR-001**: Use MongoDB Atlas Vector Search over separate ChromaDB
2. **ADR-002**: Use Vercel AI SDK v4 over Langchain
3. **ADR-003**: Use Hono for API layer over Express/Fastify
4. **ADR-004**: Use Next.js 15 App Router over Pages Router
5. **ADR-005**: Use Turborepo monorepo over polyrepo
6. **ADR-006**: Use text-embedding-3-small over text-embedding-3-large

---

## Technology Comparison Matrix

### Frontend Framework Decision

| Criteria | Next.js 15 | Plain React | Remix |
|----------|-----------|-------------|-------|
| SEO | ✅ Excellent | ❌ Poor | ✅ Good |
| DX | ✅ Great | ⚠️ Good | ⚠️ Good |
| Performance | ✅ Excellent | ⚠️ Good | ✅ Good |
| Ecosystem | ✅ Huge | ✅ Huge | ⚠️ Growing |
| Learning Curve | ⚠️ Medium | ✅ Low | ⚠️ Medium |
| Deployment | ✅ Vercel 1-click | ⚠️ Manual | ⚠️ Manual |
| **Winner** | ✅ | | |

### AI Framework Decision

| Criteria | Vercel AI SDK | Langchain | Direct OpenAI |
|----------|---------------|-----------|---------------|
| Simplicity | ✅ Excellent | ❌ Poor | ✅ Excellent |
| Type Safety | ✅ Excellent | ⚠️ Fair | ✅ Good |
| Bundle Size | ✅ Small (20KB) | ❌ Large (50MB+) | ✅ Small (5KB) |
| Features | ✅ Rich | ✅ Very Rich | ⚠️ Basic |
| Maintenance | ✅ Active | ⚠️ Frequent breaking | ✅ Stable |
| AI Agent Friendly | ✅ Yes | ❌ No | ✅ Yes |
| **Winner** | ✅ | | |

### Database Decision

| Criteria | MongoDB Atlas | PostgreSQL + pgvector | MongoDB + Qdrant |
|----------|---------------|----------------------|------------------|
| Vector Search | ✅ Native | ⚠️ Good | ✅ Excellent |
| Setup Complexity | ✅ Simple | ⚠️ Medium | ❌ Complex |
| Consistency | ✅ ACID | ✅ ACID | ⚠️ Eventual |
| Scaling | ✅ Easy | ⚠️ Medium | ✅ Easy |
| Cost (MVP) | ✅ $0 | ✅ $0 | ⚠️ $10+ |
| Maintenance | ✅ Low | ⚠️ Medium | ❌ High |
| **Winner** | ✅ | | |

---

## Migration Paths

### If MongoDB Atlas Vector Search is insufficient (>100K activities):

**Migration to Qdrant:**
1. Setup Qdrant Cloud or self-hosted instance
2. Export embeddings from MongoDB
3. Import to Qdrant with metadata
4. Switch search queries to Qdrant API
5. Keep MongoDB as source of truth for activities
6. Implement sync mechanism (on-write or batch)

**Estimated downtime:** 2-4 hours for 100K activities

### If Vercel becomes too expensive (>1M page views/month):

**Migration to Railway/self-hosted:**
1. Docker containerize Next.js application
2. Setup PostgreSQL (migrate from MongoDB if needed)
3. Deploy containers to Railway/AWS/GCP
4. Configure load balancer and CDN
5. Update DNS records

**Estimated effort:** 2-3 weeks

---

## Key Principles

1. **Pragmatic AI**: Use AI where it provides clear value (semantic search), not for the sake of AI
2. **Type Safety First**: TypeScript strict mode, Zod validation, end-to-end types
3. **Simplicity over Abstraction**: Avoid over-engineering, choose direct solutions
4. **AI Agent Friendly**: Clear patterns, self-documenting code, comprehensive types
5. **Cost Conscious**: Free tier for MVP, clear scaling paths
6. **Developer Experience**: Fast builds, instant feedback, excellent IntelliSense
7. **Production Ready**: Monitoring, error tracking, security from day one

---

**Last Updated**: 2026-01-07
**Version**: 1.0
**Status**: Approved for implementation
