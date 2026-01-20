# Action Atlas System Architecture

## Overview

Action Atlas is an AI-powered semantic search engine for discovering volunteering activities. The architecture prioritizes simplicity, type safety, and AI-agent maintainability while delivering sub-200ms search latency.

---

## System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         User Browser                              │
│  - Search interface                                               │
│  - Activity detail pages                                          │
│  - Organization profiles                                          │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Next.js 15 App (Vercel)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  App Router (React Server Components)                      │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │ │
│  │  │   /search    │  │ /activities  │  │ /organizations  │ │ │
│  │  │  (search UI) │  │ (detail page)│  │  (org profiles) │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘ │ │
│  │                                                            │ │
│  │  Client Components:                                       │ │
│  │  - SearchBar (interactive search input)                   │ │
│  │  - ActivityCard (result preview)                          │ │
│  │  - MapView (geospatial visualization)                     │ │
│  │  - FilterPanel (category, skill filters)                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  API Routes (Serverless Functions)                         │ │
│  │  - POST /api/search → Semantic search                      │ │
│  │  - GET  /api/activities/:id                                │ │
│  │  - POST /api/activities (admin)                            │ │
│  │  - GET  /api/organizations/:id                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Services                                                   │ │
│  │  ┌──────────────────┐  ┌──────────────────┐               │ │
│  │  │  VectorSearch    │  │  EmbeddingGen    │               │ │
│  │  │  Service         │  │  Service         │               │ │
│  │  │  - Query embed   │  │  - Create embed  │               │ │
│  │  │  - Vector search │  │  - Batch embed   │               │ │
│  │  │  - Geo filter    │  │  - Cache lookup  │               │ │
│  │  └──────────────────┘  └──────────────────┘               │ │
│  │                                                             │ │
│  │  ┌──────────────────┐  ┌──────────────────┐               │ │
│  │  │  ActivityService │  │  OrganizationSvc │               │ │
│  │  │  - CRUD ops      │  │  - Manage orgs   │               │ │
│  │  │  - Sync embed    │  │  - Verification  │               │ │
│  │  └──────────────────┘  └──────────────────┘               │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────┬───────────────────┬──────────────────────────────┘
                 │                   │
        ┌────────┴────────┐  ┌───────┴────────┐
        ▼                 ▼  ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌─────────────┐
│  MongoDB     │  │  OpenAI API  │  │   Redis     │
│  Atlas       │  │  (Embeddings)│  │  (Upstash)  │
│              │  │              │  │             │
│ - Activities │  │ - text-      │  │ - Embedding │
│ - Orgs       │  │   embedding- │  │   cache     │
│ - Embeddings │  │   3-small    │  │ - Search    │
│ - Geo index  │  │              │  │   results   │
│ - Vector idx │  │              │  │ - Rate limit│
└──────────────┘  └──────────────┘  └─────────────┘
```

---

## Data Flow: Semantic Search

### Flow Diagram

```
┌─────────────┐
│ User enters │
│ "teach kids │  1. User Input
│ programming"│
└──────┬──────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ Frontend (React)                                 │
│ - Validate input                                 │  2. Client Validation
│ - Show loading state                             │
│ - Debounce queries                               │
└──────┬───────────────────────────────────────────┘
       │ POST /api/search
       │ { query: "teach kids programming", limit: 20 }
       ▼
┌──────────────────────────────────────────────────┐
│ API Route (Next.js Serverless Function)          │
│ - Rate limit check (20 req/min per IP)          │  3. API Gateway
│ - Input validation (Zod schema)                  │
│ - Auth check (if needed)                         │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ VectorSearchService                              │
│                                                  │  4. Service Layer
│ Step 1: Check Redis cache                       │
│   Key: hash(query + filters)                    │
│   TTL: 5 minutes                                 │
│   ├─ Cache HIT → Return cached results          │
│   └─ Cache MISS → Continue to Step 2            │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ EmbeddingGenerationService                       │
│                                                  │  5. Generate Query Embedding
│ Step 2: Generate query embedding                │
│   ├─ Check embedding cache (Redis)              │
│   │   Key: hash(normalized_query)               │
│   │   TTL: 30 days                               │
│   ├─ Cache HIT → Use cached embedding           │
│   └─ Cache MISS → Call OpenAI API               │
│       ├─ Model: text-embedding-3-small          │
│       ├─ Input: "teach kids programming"        │
│       ├─ Output: [0.123, -0.456, ...] (1536d)   │
│       └─ Cache embedding for future use          │
└──────┬───────────────────────────────────────────┘
       │ embedding: number[] (1536 dimensions)
       ▼
┌──────────────────────────────────────────────────┐
│ MongoDB Atlas Vector Search                      │
│                                                  │  6. Vector Similarity Search
│ Step 3: Execute vector search                   │
│   db.activities.aggregate([                     │
│     {                                            │
│       $vectorSearch: {                           │
│         index: "activity_vector_search",         │
│         path: "embedding",                       │
│         queryVector: [0.123, -0.456, ...],       │
│         numCandidates: 100,                      │
│         limit: 40                                │
│       }                                          │
│     },                                           │
│     {                                            │
│       $addFields: {                              │
│         relevanceScore: { $meta: "vectorSearchScore" }│
│       }                                          │
│     }                                            │
│   ])                                             │
│                                                  │
│ Returns: Top 40 activities by cosine similarity │
└──────┬───────────────────────────────────────────┘
       │ activities: Activity[] (top 40)
       │ relevanceScores: number[] (0.0-1.0)
       ▼
┌──────────────────────────────────────────────────┐
│ Geospatial Filtering (if location provided)     │
│                                                  │  7. Apply Location Filter
│ Step 4: Filter and rank by distance             │
│   db.activities.aggregate([                     │
│     {                                            │
│       $geoNear: {                                │
│         near: {                                  │
│           type: "Point",                         │
│           coordinates: [lng, lat]                │
│         },                                       │
│         distanceField: "distance",               │
│         spherical: true,                         │
│         maxDistance: 50000 // 50km               │
│       }                                          │
│     }                                            │
│   ])                                             │
│                                                  │
│ Combine scores:                                  │
│   finalScore = 0.7 * semanticScore +             │
│                0.3 * proximityScore              │
└──────┬───────────────────────────────────────────┘
       │ rankedActivities: Activity[] (top 20)
       ▼
┌──────────────────────────────────────────────────┐
│ Post-Processing                                  │
│                                                  │  8. Enrich Results
│ Step 5: Enrich activity data                    │
│   - Populate organization details                │
│   - Calculate distance to user                   │
│   - Format contact information                   │
│   - Add metadata (created date, etc.)            │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ Cache Results                                    │
│                                                  │  9. Cache for Future
│ Step 6: Store in Redis                          │
│   Key: hash(query + filters + location)         │
│   Value: JSON.stringify(results)                │
│   TTL: 5 minutes                                 │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ API Response                                     │
│                                                  │  10. Return to Client
│ {                                                │
│   results: Activity[],                           │
│   total: 20,                                     │
│   executionTimeMs: 187,                          │
│   metadata: {                                    │
│     cached: false,                               │
│     vectorSearchMs: 45,                          │
│     embeddingMs: 120,                            │
│     postProcessingMs: 22                         │
│   }                                              │
│ }                                                │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│  Frontend   │
│  - Display  │  11. Render Results
│  - Map view │
│  - Filters  │
└─────────────┘
```

### Performance Targets

| Operation | Target Latency | Caching |
|-----------|----------------|---------|
| Embedding generation (cached) | <10ms | Redis, 30-day TTL |
| Embedding generation (new) | <150ms | N/A |
| Vector search | <50ms | MongoDB Atlas index |
| Geospatial filter | <30ms | 2dsphere index |
| Post-processing | <20ms | N/A |
| **Total (cache miss)** | **<250ms** | - |
| **Total (cache hit)** | **<50ms** | Redis, 5-min TTL |

---

## Data Models

### Activity Document (MongoDB)

```typescript
interface ActivityDocument {
  _id: ObjectId;
  activityId: string; // Business ID (CUID)

  // Core fields
  title: string;
  description: string;
  organizationId: string;
  category: 'education' | 'environment' | 'health' | 'social-services' | 'arts-culture' | 'animal-welfare' | 'community-development' | 'youth' | 'seniors' | 'technology' | 'other';

  // Skills
  skills: Array<{
    name: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }>;

  // Location (GeoJSON)
  location: {
    address: {
      street?: string;
      city: string;
      state?: string;
      postalCode?: string;
      country: string;
    };
    coordinates: {
      type: 'Point';
      coordinates: [number, number]; // [longitude, latitude]
    };
    timezone?: string;
  };

  // Time commitment
  timeCommitment: {
    hoursPerWeek?: number;
    isFlexible: boolean;
    isOneTime: boolean;
    isRecurring: boolean;
    schedule?: string;
  };

  // Contact
  contact: {
    name: string;
    role: string;
    email: string;
    phone?: string;
  };

  website?: string;
  isActive: boolean;

  // Vector search fields
  embedding: number[]; // 1536-dimensional vector
  embeddingModel: 'text-embedding-3-small';
  embeddingUpdatedAt: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### MongoDB Indexes

```javascript
// Compound index for filtering + vector search
db.activities.createIndex({
  "category": 1,
  "isActive": 1,
  "location.coordinates": "2dsphere"
});

// Vector search index (created in Atlas UI)
{
  "name": "activity_vector_search",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 1536,
        "similarity": "cosine"
      },
      {
        "type": "filter",
        "path": "category"
      },
      {
        "type": "filter",
        "path": "isActive"
      }
    ]
  }
}

// Text index for fallback keyword search
db.activities.createIndex({
  "title": "text",
  "description": "text",
  "searchableText": "text"
});
```

---

## Monorepo Structure

```
action-atlas/
├── apps/
│   ├── web/                          # Next.js 15 frontend
│   │   ├── app/                      # App Router
│   │   │   ├── (public)/             # Public pages
│   │   │   │   ├── page.tsx          # Home (search)
│   │   │   │   ├── search/
│   │   │   │   │   └── page.tsx      # Search results
│   │   │   │   ├── activities/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx  # Activity detail
│   │   │   │   └── organizations/
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx  # Org profile
│   │   │   ├── (admin)/              # Admin dashboard
│   │   │   │   └── dashboard/
│   │   │   │       ├── activities/
│   │   │   │       └── organizations/
│   │   │   └── api/                  # API routes
│   │   │       ├── search/
│   │   │       │   └── route.ts      # POST /api/search
│   │   │       ├── activities/
│   │   │       │   ├── route.ts      # GET/POST activities
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts  # GET/PATCH/DELETE
│   │   │       └── webhooks/
│   │   │           └── route.ts
│   │   ├── components/
│   │   │   ├── search/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── FilterPanel.tsx
│   │   │   │   └── MapView.tsx
│   │   │   ├── activities/
│   │   │   │   ├── ActivityCard.tsx
│   │   │   │   └── ActivityDetail.tsx
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── lib/
│   │   │   ├── mongodb.ts            # DB connection
│   │   │   ├── redis.ts              # Cache client
│   │   │   └── openai.ts             # AI client
│   │   └── package.json
│   │
│   └── api/                          # Separate API (optional, if not using Next.js API routes)
│       ├── routes/
│       ├── services/
│       └── package.json
│
├── packages/
│   ├── database/                     # MongoDB schemas
│   │   ├── src/
│   │   │   ├── client.ts             # MongoDB client
│   │   │   ├── schemas/
│   │   │   │   ├── activity.ts
│   │   │   │   └── organization.ts
│   │   │   └── seed.ts               # Seed script
│   │   └── package.json
│   │
│   ├── ai/                           # AI utilities
│   │   ├── src/
│   │   │   ├── embedding.ts          # Embedding generation
│   │   │   ├── vector-search.ts      # Vector operations
│   │   │   └── cache.ts              # Embedding cache
│   │   └── package.json
│   │
│   ├── types/                        # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   ├── activity.ts
│   │   │   │   ├── organization.ts
│   │   │   │   └── location.ts
│   │   │   ├── api/
│   │   │   │   ├── search.ts
│   │   │   │   └── activities.ts
│   │   │   └── vector/
│   │   │       ├── embeddings.ts
│   │   │       └── openai.ts
│   │   └── package.json
│   │
│   ├── ui/                           # Shared UI components
│   │   ├── src/
│   │   │   └── components/
│   │   └── package.json
│   │
│   └── config/                       # Shared configs
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
│
├── scripts/                          # Utility scripts
│   ├── seed-activities.ts
│   ├── generate-embeddings.ts
│   └── migrate-vector-db.ts
│
├── docs/                             # Documentation
│   ├── architecture.md               # This file
│   ├── tech-stack.md                 # Technology choices
│   ├── milestones.md                 # Implementation plan
│   └── adr/                          # Architecture Decision Records
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI/CD pipeline
│
├── turbo.json                        # Turborepo config
├── package.json                      # Root workspace
├── pnpm-workspace.yaml               # pnpm workspaces
└── README.md
```

---

## Security Architecture

### Authentication (Future Phase)

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Clerk/Auth0     │ ← OAuth providers
│  - Google        │   (Google, GitHub, etc.)
│  - Email/Pass    │
└──────┬───────────┘
       │ JWT token
       ▼
┌──────────────────┐
│  Next.js App     │
│  - Verify JWT    │
│  - Session mgmt  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  API Routes      │
│  - Protected     │
│  - Rate limited  │
└──────────────────┘
```

### Rate Limiting

```typescript
// Upstash Rate Limit implementation
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
  analytics: true,
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
  return { success, limit, remaining, reset };
}
```

### Secrets Management

```yaml
Development:
  - .env.local (git-ignored)
  - Never committed to repo

Production:
  - Vercel Environment Variables
  - Encrypted at rest
  - Access-controlled
  - Audit logging enabled
  - Rotated quarterly

Secrets:
  - MONGODB_URI
  - OPENAI_API_KEY
  - REDIS_URL
  - ADMIN_API_KEY (for manual moderation)
```

---

## Deployment Architecture

### Vercel Deployment

```
┌─────────────────────────────────────────────────┐
│  GitHub Repository                              │
│  - main branch (production)                     │
│  - develop branch (staging)                     │
│  - feature/* branches (preview)                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  GitHub Actions CI/CD                           │
│  - Lint & type check                            │
│  - Unit tests                                    │
│  - Integration tests                             │
│  - E2E tests                                     │
└────────────────┬────────────────────────────────┘
                 │
         ┌───────┴────────┐
         ▼                ▼
┌──────────────┐  ┌──────────────┐
│  Vercel      │  │  Vercel      │
│  Preview     │  │  Production  │
│  (per PR)    │  │  (main)      │
└──────────────┘  └──────────────┘
         │                │
         └────────┬───────┘
                  ▼
┌─────────────────────────────────────────────────┐
│  Vercel Edge Network (Global CDN)               │
│  - Static assets                                 │
│  - Image optimization                            │
│  - Edge Functions (low latency)                  │
└─────────────────────────────────────────────────┘
```

### Infrastructure Components

```yaml
Frontend (Vercel):
  - Next.js 15 application
  - Edge Functions for API routes
  - Global CDN for static assets
  - Automatic HTTPS
  - Preview deployments

Database (MongoDB Atlas):
  - M10 cluster (production)
  - AWS us-east-1 region
  - Vector search enabled
  - Continuous backup
  - Connection pooling

Cache (Upstash Redis):
  - Serverless Redis
  - Global replication
  - Automatic scaling
  - Used for:
    - Embedding cache
    - Search result cache
    - Rate limiting

Monitoring:
  - Vercel Analytics
  - Sentry (errors)
  - Better Stack (logs, uptime)
  - Custom metrics in MongoDB
```

---

## Scaling Considerations

### Horizontal Scaling

**Serverless by Default:**
- Vercel automatically scales Next.js API routes
- No manual scaling configuration needed
- Pay only for actual usage

**Database Scaling:**
```
M0 (Free) → M10 ($57/mo) → M20 ($140/mo) → M30 ($280/mo)
512MB       10GB            20GB            40GB
```

**Cache Scaling:**
- Upstash Redis auto-scales
- Pay per request
- Global replication available

### Vertical Optimization

**Query Optimization:**
1. Use compound indexes for common filters
2. Projection (select only needed fields)
3. Aggregation pipeline optimization
4. Connection pooling

**Embedding Cache Strategy:**
```typescript
// Three-tier cache
1. In-memory (serverless function reuse): ~100ms lifespan
2. Redis (30-day TTL): <10ms lookup
3. MongoDB (permanent): <50ms lookup
```

**Cost Optimization:**
- Cache embeddings aggressively (30-day TTL)
- Batch embedding generation (100 at a time)
- Use text-embedding-3-small (5× cheaper)
- Monitor OpenAI usage daily

---

## Disaster Recovery

### Backup Strategy

```yaml
MongoDB Atlas:
  Frequency: Continuous
  Retention: 30 days
  Type: Point-in-time recovery
  Testing: Monthly restoration drills
  RTO: 1 hour
  RPO: 5 minutes

Code:
  Repository: GitHub
  Branches: Protected (main, develop)
  Backups: Git history + GitHub backups

Environment Variables:
  Storage: Vercel (encrypted)
  Backup: 1Password vault (manual)
  Rotation: Quarterly
```

### Incident Response

```yaml
Critical (API Down):
  1. Automated alert (Sentry + Better Stack)
  2. Check Vercel status
  3. Check MongoDB Atlas status
  4. Check OpenAI API status
  5. Review recent deployments
  6. Rollback if needed (git revert + redeploy)
  7. Post-mortem within 24 hours

Warning (Slow Performance):
  1. Check MongoDB slow queries
  2. Check OpenAI API latency
  3. Check cache hit rate
  4. Review recent traffic patterns
  5. Optimize queries or indexes
  6. Scale database tier if needed
```

---

## Key Principles

1. **Simplicity**: One database, minimal services, clear data flow
2. **Type Safety**: End-to-end TypeScript, Zod validation, strict types
3. **Performance**: Sub-200ms search, aggressive caching, optimized queries
4. **Cost Efficiency**: Free tier for MVP, pay-as-you-grow
5. **AI Agent Friendly**: Clear patterns, self-documenting, comprehensive types
6. **Observability**: Metrics, logs, errors tracked from day one
7. **Security**: Rate limiting, input validation, secrets management

---

**Last Updated**: 2026-01-07
**Version**: 1.0
**Status**: Approved for implementation
