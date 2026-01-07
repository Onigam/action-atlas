# Action Atlas Implementation Milestones

This document provides a detailed, step-by-step implementation plan for Action Atlas. Each milestone includes specific tasks, deliverables, success criteria, and estimated effort. This plan is designed to be executed by AI agents or development teams.

---

## Overview

**Total Timeline**: 8-10 weeks to MVP
**Team Size**: 1-2 developers (or AI agents)
**Deployment Target**: Vercel + MongoDB Atlas
**Launch Goal**: Public beta with 100+ volunteering activities

---

## Milestone 1: Foundation & Infrastructure Setup

**Duration**: Week 1 (5-7 days)
**Goal**: Establish project structure, configure development environment, and set up core infrastructure

### Tasks

#### 1.1 Project Initialization
**Estimated Time**: 2-3 hours

- [ ] Create GitHub repository `action-atlas`
- [ ] Initialize monorepo with Turborepo
  ```bash
  npx create-turbo@latest action-atlas
  cd action-atlas
  ```
- [ ] Configure pnpm workspaces
  ```yaml
  # pnpm-workspace.yaml
  packages:
    - "apps/*"
    - "packages/*"
  ```
- [ ] Set up `.gitignore` with Node.js, Next.js, env files
- [ ] Create README.md with project overview

**Deliverables:**
- ✅ Git repository with monorepo structure
- ✅ pnpm workspace configuration
- ✅ README with setup instructions

#### 1.2 TypeScript Configuration
**Estimated Time**: 2 hours

- [ ] Create base TypeScript config in `packages/config/typescript/`
  - `base.json` (strict mode, all flags enabled)
  - `nextjs.json` (extends base, Next.js-specific)
  - `node.json` (extends base, Node.js-specific)
  - `library.json` (extends base, for shared packages)
- [ ] Configure path aliases (`@/` prefix)
- [ ] Set up TypeScript project references

**Deliverables:**
- ✅ TypeScript configurations for all package types
- ✅ Strict type checking enabled
- ✅ Project references for fast incremental builds

#### 1.3 Shared Types Package
**Estimated Time**: 4-6 hours

- [ ] Create `packages/types/` package
- [ ] Implement domain types:
  - `src/domain/activity.ts` - Activity interface, branded ActivityId type
  - `src/domain/organization.ts` - Organization interface
  - `src/domain/location.ts` - Location, Coordinates, Address types
  - `src/domain/skill.ts` - Skill types and enums
- [ ] Implement vector types:
  - `src/vector/embeddings.ts` - Embedding branded type, validation
  - `src/vector/openai.ts` - OpenAI API types
- [ ] Implement API types:
  - `src/api/search.ts` - SearchQuery, SearchResponse, SearchError
  - `src/api/activities.ts` - Activity CRUD result types
- [ ] Export all types from `src/index.ts`

**Deliverables:**
- ✅ Comprehensive type system with branded types
- ✅ Discriminated unions for error handling
- ✅ Type guards and validation utilities

**Success Criteria:**
- All types compile without errors
- Type guards have 100% test coverage
- Documentation comments on all exported types

#### 1.4 Development Environment
**Estimated Time**: 2-3 hours

- [ ] Install MongoDB Atlas local CLI or Docker MongoDB
  ```bash
  # Docker approach
  docker pull mongo:latest
  docker run -d -p 27017:27017 --name action-atlas-mongo mongo:latest
  ```
- [ ] Install Redis locally or use Upstash (recommended)
  ```bash
  # Docker approach
  docker pull redis:alpine
  docker run -d -p 6379:6379 --name action-atlas-redis redis:alpine
  ```
- [ ] Create `.env.example` template
  ```env
  MONGODB_URI=mongodb://localhost:27017/actionatlas
  OPENAI_API_KEY=sk-proj-...
  REDIS_URL=redis://localhost:6379
  ```
- [ ] Set up `.env.local` (git-ignored)
- [ ] Configure VS Code settings for TypeScript and ESLint

**Deliverables:**
- ✅ Local development databases running
- ✅ Environment variables documented
- ✅ VS Code workspace configuration

#### 1.5 MongoDB Atlas Setup (Production)
**Estimated Time**: 1-2 hours

- [ ] Create MongoDB Atlas account
- [ ] Create M0 Sandbox cluster (FREE)
  - Region: AWS us-east-1
  - Name: `action-atlas-dev`
- [ ] Configure network access (allow from anywhere for now)
- [ ] Create database user
  - Username: `action-atlas`
  - Autogenerate secure password
  - Role: readWrite on `actionatlas` database
- [ ] Get connection string and save to `.env.local`
- [ ] Test connection with MongoDB Compass or CLI

**Deliverables:**
- ✅ MongoDB Atlas cluster provisioned
- ✅ Connection string secured
- ✅ Database accessible from local machine

#### 1.6 Vercel Setup
**Estimated Time**: 1 hour

- [ ] Create Vercel account
- [ ] Install Vercel CLI
  ```bash
  npm i -g vercel
  ```
- [ ] Link GitHub repository to Vercel
- [ ] Configure project settings
  - Framework Preset: Next.js
  - Root Directory: `apps/web`
  - Build Command: `cd ../.. && npx turbo run build --filter=web`
- [ ] Add environment variables (later in Milestone 3)

**Deliverables:**
- ✅ Vercel project linked to repository
- ✅ Automatic deployments configured
- ✅ Preview deployments enabled for PRs

### Success Criteria
- ✅ Monorepo builds without errors (`pnpm build`)
- ✅ TypeScript compiles with no errors (`pnpm type-check`)
- ✅ Can connect to MongoDB Atlas from local machine
- ✅ Vercel project successfully created

---

## Milestone 2: Database Layer & Core Services

**Duration**: Week 2 (5-7 days)
**Goal**: Implement database schemas, MongoDB connection, and core service abstractions

### Tasks

#### 2.1 Database Package Setup
**Estimated Time**: 2-3 hours

- [ ] Create `packages/database/` package
- [ ] Install dependencies
  ```bash
  cd packages/database
  pnpm add mongodb zod
  pnpm add -D @types/node
  ```
- [ ] Create MongoDB client with connection pooling
  ```typescript
  // src/client.ts
  import { MongoClient } from 'mongodb';

  const uri = process.env.MONGODB_URI!;
  const options = {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
  };

  let client: MongoClient;
  let clientPromise: Promise<MongoClient>;

  if (process.env.NODE_ENV === 'development') {
    if (!(global as any)._mongoClientPromise) {
      client = new MongoClient(uri, options);
      (global as any)._mongoClientPromise = client.connect();
    }
    clientPromise = (global as any)._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  export default clientPromise;
  ```

**Deliverables:**
- ✅ MongoDB client with connection pooling
- ✅ Environment-aware connection handling

#### 2.2 Activity Schema & Collection
**Estimated Time**: 3-4 hours

- [ ] Define Activity document interface
  ```typescript
  // src/schemas/activity.ts
  import type { ObjectId } from 'mongodb';

  export interface ActivityDocument {
    _id: ObjectId;
    activityId: string;
    title: string;
    description: string;
    organizationId: string;
    category: string;
    skills: Array<{ name: string; level?: string }>;
    location: {
      address: { city: string; state?: string; country: string };
      coordinates: { type: 'Point'; coordinates: [number, number] };
    };
    timeCommitment: {
      hoursPerWeek?: number;
      isFlexible: boolean;
      isOneTime: boolean;
      isRecurring: boolean;
    };
    contact: {
      name: string;
      role: string;
      email: string;
      phone?: string;
    };
    searchableText: string;
    embedding?: number[];
    embeddingModel?: string;
    embeddingUpdatedAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  ```
- [ ] Create collection helper
  ```typescript
  // src/collections.ts
  import clientPromise from './client';

  export async function getActivitiesCollection() {
    const client = await clientPromise;
    return client.db('actionatlas').collection<ActivityDocument>('activities');
  }
  ```
- [ ] Create Zod validation schema
  ```typescript
  // src/validation/activity.ts
  import { z } from 'zod';

  export const ActivitySchema = z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(50).max(5000),
    // ... rest of schema
  });
  ```

**Deliverables:**
- ✅ ActivityDocument TypeScript interface
- ✅ Collection accessor function
- ✅ Zod validation schema

#### 2.3 Database Indexes
**Estimated Time**: 1-2 hours

- [ ] Create index creation script
  ```typescript
  // scripts/create-indexes.ts
  import clientPromise from '../src/client';

  async function createIndexes() {
    const client = await clientPromise;
    const db = client.db('actionatlas');

    // Geospatial index
    await db.collection('activities').createIndex({
      'location.coordinates': '2dsphere'
    });

    // Compound index for common filters
    await db.collection('activities').createIndex({
      category: 1,
      isActive: 1,
      createdAt: -1
    });

    // Text search index (fallback)
    await db.collection('activities').createIndex({
      title: 'text',
      description: 'text',
      searchableText: 'text'
    });

    console.log('Indexes created successfully');
  }

  createIndexes();
  ```
- [ ] Create MongoDB Atlas Vector Search Index in Atlas UI
  - Navigate to: Cluster → Search → Create Search Index
  - Index Name: `activity_vector_search`
  - Definition: See architecture.md for full JSON

**Deliverables:**
- ✅ Geospatial index for location queries
- ✅ Compound index for category filtering
- ✅ Text search index for fallback
- ✅ Vector search index in Atlas

#### 2.4 Seed Data Script
**Estimated Time**: 2-3 hours

- [ ] Create seed data with 10-20 sample activities
  ```typescript
  // scripts/seed.ts
  import clientPromise from '../src/client';
  import { cuid } from '@paralleldrive/cuid2';

  const sampleActivities = [
    {
      activityId: cuid(),
      title: 'Youth Coding Mentorship',
      description: 'Teach middle school students programming...',
      organizationId: 'org-1',
      category: 'education',
      skills: [{ name: 'JavaScript', level: 'intermediate' }],
      location: {
        address: { city: 'San Francisco', state: 'CA', country: 'USA' },
        coordinates: { type: 'Point', coordinates: [-122.4194, 37.7749] }
      },
      // ... rest of fields
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // ... more activities
  ];

  async function seed() {
    const client = await clientPromise;
    const activities = client.db('actionatlas').collection('activities');
    await activities.insertMany(sampleActivities);
    console.log(`Seeded ${sampleActivities.length} activities`);
  }

  seed();
  ```
- [ ] Include diverse categories (education, environment, health, etc.)
- [ ] Include various locations (different cities, states)
- [ ] Add script to `package.json`: `"seed": "tsx scripts/seed.ts"`

**Deliverables:**
- ✅ Seed script with 10-20 sample activities
- ✅ Diverse categories and locations represented
- ✅ Can run seed script: `pnpm seed`

### Success Criteria
- ✅ Can connect to MongoDB and query activities
- ✅ All indexes created successfully
- ✅ Seed script populates database with sample data
- ✅ TypeScript types match database schema

---

## Milestone 3: AI Integration & Vector Search

**Duration**: Week 3 (5-7 days)
**Goal**: Implement OpenAI embedding generation and MongoDB Atlas Vector Search

### Tasks

#### 3.1 AI Package Setup
**Estimated Time**: 2 hours

- [ ] Create `packages/ai/` package
- [ ] Install dependencies
  ```bash
  cd packages/ai
  pnpm add ai @ai-sdk/openai zod
  pnpm add -D @types/node
  ```
- [ ] Set up OpenAI client
  ```typescript
  // src/client.ts
  import { openai } from '@ai-sdk/openai';

  export const embeddingModel = openai.embedding('text-embedding-3-small');
  ```

**Deliverables:**
- ✅ AI package with Vercel AI SDK configured
- ✅ OpenAI client exported

#### 3.2 Embedding Generation Service
**Estimated Time**: 4-6 hours

- [ ] Implement `EmbeddingService` class
  ```typescript
  // src/embedding-service.ts
  import { embed, embedMany } from 'ai';
  import { embeddingModel } from './client';
  import type { Embedding, EmbeddingResult } from '@action-atlas/types';

  export class EmbeddingService {
    async generateSingle(text: string): Promise<EmbeddingResult> {
      const { embedding, usage } = await embed({
        model: embeddingModel,
        value: text,
      });

      return {
        embedding: embedding as Embedding,
        model: 'text-embedding-3-small',
        dimensions: 1536,
        tokenUsage: usage.tokens,
        generatedAt: new Date(),
      };
    }

    async generateBatch(texts: string[]): Promise<EmbeddingResult[]> {
      const { embeddings, usage } = await embedMany({
        model: embeddingModel,
        values: texts,
      });

      return embeddings.map((emb, i) => ({
        embedding: emb as Embedding,
        model: 'text-embedding-3-small',
        dimensions: 1536,
        tokenUsage: Math.floor(usage.tokens / texts.length),
        generatedAt: new Date(),
      }));
    }
  }
  ```
- [ ] Add error handling for OpenAI API failures
- [ ] Add retry logic with exponential backoff
- [ ] Add usage tracking (tokens, cost)

**Deliverables:**
- ✅ EmbeddingService with single and batch generation
- ✅ Error handling and retry logic
- ✅ Usage tracking

#### 3.3 Embedding Cache (Redis)
**Estimated Time**: 3-4 hours

- [ ] Install Redis client
  ```bash
  pnpm add @upstash/redis
  ```
- [ ] Implement caching layer
  ```typescript
  // src/embedding-cache.ts
  import { Redis } from '@upstash/redis';
  import { createHash } from 'crypto';

  const redis = Redis.fromEnv();

  export class EmbeddingCache {
    private static getCacheKey(text: string): string {
      return `emb:${createHash('sha256').update(text.toLowerCase().trim()).digest('hex')}`;
    }

    async get(text: string): Promise<number[] | null> {
      const key = EmbeddingCache.getCacheKey(text);
      const cached = await redis.get<number[]>(key);
      return cached;
    }

    async set(text: string, embedding: number[], ttlSeconds = 2592000): Promise<void> {
      const key = EmbeddingCache.getCacheKey(text);
      await redis.setex(key, ttlSeconds, embedding);
    }
  }
  ```
- [ ] Integrate cache with EmbeddingService
- [ ] Set TTL to 30 days (2,592,000 seconds)

**Deliverables:**
- ✅ Redis-based embedding cache
- ✅ Cache integration in EmbeddingService
- ✅ 30-day TTL configured

#### 3.4 Activity Embedding Generation
**Estimated Time**: 3-4 hours

- [ ] Create activity text preparation function
  ```typescript
  // packages/database/src/utils/prepare-searchable-text.ts
  import type { ActivityDocument } from '../schemas/activity';

  export function prepareSearchableText(activity: Partial<ActivityDocument>): string {
    return [
      activity.title,
      activity.description,
      activity.category,
      activity.skills?.map(s => s.name).join(', '),
      activity.location?.address.city,
      activity.location?.address.state,
      activity.location?.address.country,
    ]
      .filter(Boolean)
      .join('. ');
  }
  ```
- [ ] Create batch embedding script
  ```typescript
  // scripts/generate-embeddings.ts
  import clientPromise from '@action-atlas/database/client';
  import { EmbeddingService } from '@action-atlas/ai';
  import { prepareSearchableText } from '@action-atlas/database/utils';

  async function generateEmbeddings() {
    const client = await clientPromise;
    const activities = client.db('actionatlas').collection('activities');
    const embeddingService = new EmbeddingService();

    // Get activities without embeddings
    const toEmbed = await activities
      .find({ embedding: { $exists: false } })
      .toArray();

    console.log(`Generating embeddings for ${toEmbed.length} activities...`);

    // Process in batches of 100
    for (let i = 0; i < toEmbed.length; i += 100) {
      const batch = toEmbed.slice(i, i + 100);
      const texts = batch.map(a => prepareSearchableText(a));
      const results = await embeddingService.generateBatch(texts);

      // Update MongoDB
      await Promise.all(
        batch.map((activity, idx) =>
          activities.updateOne(
            { _id: activity._id },
            {
              $set: {
                embedding: results[idx].embedding,
                embeddingModel: 'text-embedding-3-small',
                embeddingUpdatedAt: new Date(),
                searchableText: texts[idx],
              },
            }
          )
        )
      );

      console.log(`Processed ${i + batch.length}/${toEmbed.length}`);
    }

    console.log('Embeddings generated successfully');
  }

  generateEmbeddings();
  ```
- [ ] Run script: `pnpm generate-embeddings`
- [ ] Verify embeddings in MongoDB Compass

**Deliverables:**
- ✅ Activity searchable text preparation
- ✅ Batch embedding generation script
- ✅ All seed activities have embeddings

#### 3.5 Vector Search Service
**Estimated Time**: 4-6 hours

- [ ] Create `VectorSearchService` class
  ```typescript
  // packages/ai/src/vector-search-service.ts
  import clientPromise from '@action-atlas/database/client';
  import type { SearchQuery, SearchResponse } from '@action-atlas/types';
  import { EmbeddingService } from './embedding-service';

  export class VectorSearchService {
    private embeddingService: EmbeddingService;

    constructor() {
      this.embeddingService = new EmbeddingService();
    }

    async search(query: SearchQuery, limit = 20): Promise<SearchResponse> {
      const startTime = Date.now();

      // Generate query embedding
      const { embedding } = await this.embeddingService.generateSingle(query.query);

      // Execute vector search
      const client = await clientPromise;
      const activities = client.db('actionatlas').collection('activities');

      const results = await activities.aggregate([
        {
          $vectorSearch: {
            index: 'activity_vector_search',
            path: 'embedding',
            queryVector: Array.from(embedding),
            numCandidates: limit * 5,
            limit: limit,
          },
        },
        {
          $addFields: {
            relevanceScore: { $meta: 'vectorSearchScore' },
          },
        },
        {
          $match: {
            isActive: true,
          },
        },
      ]).toArray();

      return {
        results: results as any[],
        total: results.length,
        query,
        executionTimeMs: Date.now() - startTime,
      };
    }
  }
  ```
- [ ] Add geospatial filtering (if location provided)
- [ ] Add category filtering
- [ ] Implement hybrid scoring (semantic + proximity)

**Deliverables:**
- ✅ VectorSearchService with MongoDB Atlas Vector Search
- ✅ Query embedding generation
- ✅ Relevance scoring
- ✅ Basic filtering support

### Success Criteria
- ✅ Can generate embeddings for activities
- ✅ Vector search returns relevant results
- ✅ Search latency < 500ms for cold queries
- ✅ Search latency < 100ms for cached embeddings
- ✅ Cost tracking shows <$1 for 100 queries

---

## Milestone 4: Next.js Frontend Foundation

**Duration**: Week 4 (5-7 days)
**Goal**: Build Next.js application with basic search UI

### Tasks

#### 4.1 Next.js App Setup
**Estimated Time**: 2-3 hours

- [ ] Create Next.js app
  ```bash
  cd apps
  npx create-next-app@latest web --typescript --tailwind --app --src-dir --import-alias "@/*"
  ```
- [ ] Install dependencies
  ```bash
  cd web
  pnpm add @tanstack/react-query zustand nuqs
  pnpm add @radix-ui/react-dialog @radix-ui/react-select
  pnpm add lucide-react class-variance-authority clsx tailwind-merge
  ```
- [ ] Set up shadcn/ui
  ```bash
  npx shadcn-ui@latest init
  ```
- [ ] Configure Next.js for Turborepo
  ```js
  // next.config.js
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    transpilePackages: ['@action-atlas/types', '@action-atlas/ai'],
  };

  module.exports = nextConfig;
  ```

**Deliverables:**
- ✅ Next.js 15 app with App Router
- ✅ Tailwind CSS configured
- ✅ shadcn/ui initialized

#### 4.2 Database Connection in Next.js
**Estimated Time**: 1-2 hours

- [ ] Create MongoDB connection utility
  ```typescript
  // apps/web/lib/mongodb.ts
  import clientPromise from '@action-atlas/database/client';

  export { clientPromise };
  export default clientPromise;
  ```
- [ ] Create environment variables
  ```env
  # .env.local
  MONGODB_URI=your_mongodb_atlas_connection_string
  OPENAI_API_KEY=your_openai_api_key
  UPSTASH_REDIS_REST_URL=your_redis_url
  UPSTASH_REDIS_REST_TOKEN=your_redis_token
  ```
- [ ] Add to Vercel environment variables

**Deliverables:**
- ✅ MongoDB connection accessible in API routes
- ✅ Environment variables configured

#### 4.3 Search API Route
**Estimated Time**: 3-4 hours

- [ ] Create search API route
  ```typescript
  // apps/web/app/api/search/route.ts
  import { NextRequest, NextResponse } from 'next/server';
  import { VectorSearchService } from '@action-atlas/ai';
  import { z } from 'zod';

  const SearchRequestSchema = z.object({
    query: z.string().min(1).max(500),
    limit: z.number().int().min(1).max(100).optional().default(20),
    location: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }).optional(),
  });

  export async function POST(request: NextRequest) {
    try {
      // Parse and validate request
      const body = await request.json();
      const { query, limit, location } = SearchRequestSchema.parse(body);

      // Execute search
      const searchService = new VectorSearchService();
      const results = await searchService.search({ type: 'semantic', query, location }, limit);

      return NextResponse.json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request', details: error.errors },
          { status: 400 }
        );
      }

      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
  ```
- [ ] Add rate limiting (using Upstash)
- [ ] Add error handling and logging

**Deliverables:**
- ✅ POST /api/search endpoint
- ✅ Request validation with Zod
- ✅ Error handling

#### 4.4 Search UI Components
**Estimated Time**: 6-8 hours

- [ ] Create SearchBar component
  ```typescript
  // apps/web/components/search/SearchBar.tsx
  'use client';

  import { useState } from 'react';
  import { Search } from 'lucide-react';
  import { Input } from '@/components/ui/input';
  import { Button } from '@/components/ui/button';

  interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading?: boolean;
  }

  export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query.trim());
      }
    };

    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="search"
          placeholder="Search volunteering activities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !query.trim()}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </form>
    );
  }
  ```
- [ ] Create ActivityCard component
- [ ] Create FilterPanel component (categories, skills)
- [ ] Create LoadingState and EmptyState components

**Deliverables:**
- ✅ SearchBar with debounced input
- ✅ ActivityCard displaying activity details
- ✅ FilterPanel for category/skill filtering
- ✅ Loading and empty states

#### 4.5 Search Page
**Estimated Time**: 4-6 hours

- [ ] Create search page with TanStack Query
  ```typescript
  // apps/web/app/search/page.tsx
  'use client';

  import { useState } from 'react';
  import { useQuery } from '@tanstack/react-query';
  import { SearchBar } from '@/components/search/SearchBar';
  import { ActivityCard } from '@/components/search/ActivityCard';

  async function searchActivities(query: string) {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit: 20 }),
    });

    if (!res.ok) throw new Error('Search failed');
    return res.json();
  }

  export default function SearchPage() {
    const [query, setQuery] = useState('');

    const { data, isLoading, error } = useQuery({
      queryKey: ['activities', query],
      queryFn: () => searchActivities(query),
      enabled: query.length > 0,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return (
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">Find Volunteering Activities</h1>

        <SearchBar onSearch={setQuery} isLoading={isLoading} />

        {isLoading && <div>Searching...</div>}

        {error && <div>Error: {error.message}</div>}

        {data && (
          <div className="mt-8 grid gap-4">
            {data.results.map((activity: any) => (
              <ActivityCard key={activity.activityId} activity={activity} />
            ))}
          </div>
        )}
      </div>
    );
  }
  ```
- [ ] Add TanStack Query provider in layout
- [ ] Style with Tailwind CSS
- [ ] Make responsive (mobile, tablet, desktop)

**Deliverables:**
- ✅ Functional search page
- ✅ Real-time search results
- ✅ Responsive design
- ✅ Loading and error states

### Success Criteria
- ✅ Can search for activities from browser
- ✅ Results display within 2 seconds
- ✅ UI is responsive and accessible
- ✅ No console errors in browser
- ✅ TypeScript compiles without errors

---

## Milestone 5: Activity Detail & Organization Pages

**Duration**: Week 5 (5-7 days)
**Goal**: Create detailed views for activities and organizations

### Tasks

#### 5.1 Activity Detail API
**Estimated Time**: 2-3 hours

- [ ] Create GET /api/activities/[id]/route.ts
- [ ] Populate organization data
- [ ] Add view tracking (optional analytics)

**Deliverables:**
- ✅ GET /api/activities/:id endpoint
- ✅ Organization data included in response

#### 5.2 Activity Detail Page
**Estimated Time**: 4-6 hours

- [ ] Create `/app/activities/[id]/page.tsx`
- [ ] Display full activity information
- [ ] Show organization details
- [ ] Display contact information
- [ ] Add map view with location
- [ ] Add "Contact" button with mailto: link

**Deliverables:**
- ✅ Activity detail page with full information
- ✅ Map integration (Mapbox or Google Maps)
- ✅ Contact functionality

#### 5.3 Organization Profile Page
**Estimated Time**: 3-4 hours

- [ ] Create organization API route
- [ ] Create `/app/organizations/[id]/page.tsx`
- [ ] List all activities from organization
- [ ] Show organization mission and contact

**Deliverables:**
- ✅ Organization profile page
- ✅ List of activities from organization

### Success Criteria
- ✅ Can view activity details from search results
- ✅ Contact information is accessible
- ✅ Organization profile shows all activities
- ✅ Pages are shareable (good SEO)

---

## Milestone 6: Admin Dashboard & Activity Management

**Duration**: Week 6 (5-7 days)
**Goal**: Build admin interface for approving and managing activities

### Tasks

#### 6.1 Admin API Routes
**Estimated Time**: 3-4 hours

- [ ] Create POST /api/activities (create activity)
- [ ] Create PATCH /api/activities/[id] (update)
- [ ] Create DELETE /api/activities/[id] (soft delete)
- [ ] Add API key authentication for admin routes

**Deliverables:**
- ✅ Admin CRUD API routes
- ✅ API key authentication

#### 6.2 Activity Submission Form
**Estimated Time**: 4-6 hours

- [ ] Create form with react-hook-form + Zod
- [ ] Add all activity fields
- [ ] Add location autocomplete (Google Places API)
- [ ] Add skills multi-select
- [ ] Implement form submission

**Deliverables:**
- ✅ Activity submission form
- ✅ Location autocomplete
- ✅ Form validation

#### 6.3 Admin Dashboard
**Estimated Time**: 4-6 hours

- [ ] Create `/app/(admin)/dashboard/page.tsx`
- [ ] List pending activities
- [ ] Add approve/reject actions
- [ ] Show activity statistics

**Deliverables:**
- ✅ Admin dashboard
- ✅ Activity approval workflow

### Success Criteria
- ✅ Can submit new activities
- ✅ Admin can approve/reject activities
- ✅ Approved activities appear in search
- ✅ Rejected activities don't appear

---

## Milestone 7: Optimization & Polish

**Duration**: Week 7 (5-7 days)
**Goal**: Optimize performance, add caching, improve UX

### Tasks

#### 7.1 Search Result Caching
**Estimated Time**: 3-4 hours

- [ ] Add Redis caching for search results
- [ ] Set 5-minute TTL
- [ ] Add cache invalidation on activity updates

**Deliverables:**
- ✅ Search results cached in Redis
- ✅ Cache hit rate > 60%

#### 7.2 Performance Optimization
**Estimated Time**: 4-6 hours

- [ ] Add loading skeletons
- [ ] Implement infinite scroll or pagination
- [ ] Optimize images with next/image
- [ ] Add prefetching for activity details
- [ ] Measure Core Web Vitals

**Deliverables:**
- ✅ Loading skeletons for all async operations
- ✅ Optimized images
- ✅ Core Web Vitals pass (LCP < 2.5s, FID < 100ms, CLS < 0.1)

#### 7.3 Error Handling & Monitoring
**Estimated Time**: 3-4 hours

- [ ] Set up Sentry
- [ ] Add error boundaries
- [ ] Add user-friendly error messages
- [ ] Track search metrics

**Deliverables:**
- ✅ Sentry integration
- ✅ Error boundaries on all pages
- ✅ Search performance metrics tracked

#### 7.4 SEO & Accessibility
**Estimated Time**: 2-3 hours

- [ ] Add metadata to all pages
- [ ] Generate sitemap
- [ ] Add structured data (JSON-LD)
- [ ] Run accessibility audit
- [ ] Fix A11y issues

**Deliverables:**
- ✅ SEO metadata on all pages
- ✅ Sitemap generated
- ✅ Lighthouse accessibility score > 90

### Success Criteria
- ✅ Search latency < 200ms (p95)
- ✅ Core Web Vitals pass
- ✅ Lighthouse score > 90
- ✅ No critical errors in Sentry

---

## Milestone 8: Testing & Documentation

**Duration**: Week 8 (5-7 days)
**Goal**: Write tests, complete documentation, prepare for launch

### Tasks

#### 8.1 Unit Tests
**Estimated Time**: 6-8 hours

- [ ] Set up Vitest
- [ ] Write tests for embedding service
- [ ] Write tests for vector search service
- [ ] Write tests for API routes
- [ ] Aim for 80%+ coverage on critical paths

**Deliverables:**
- ✅ Vitest configured
- ✅ 80%+ test coverage on services
- ✅ All tests passing

#### 8.2 Integration Tests
**Estimated Time**: 4-6 hours

- [ ] Set up MongoDB Memory Server
- [ ] Write integration tests for search flow
- [ ] Test activity creation flow
- [ ] Test error scenarios

**Deliverables:**
- ✅ Integration tests passing
- ✅ Error scenarios covered

#### 8.3 E2E Tests
**Estimated Time**: 4-6 hours

- [ ] Set up Playwright
- [ ] Write E2E test for search flow
- [ ] Write E2E test for activity detail
- [ ] Write E2E test for admin workflow

**Deliverables:**
- ✅ Playwright configured
- ✅ E2E tests passing
- ✅ Tests run in CI/CD

#### 8.4 Documentation
**Estimated Time**: 3-4 hours

- [ ] Update README.md with setup instructions
- [ ] Document API endpoints
- [ ] Create AGENTS.md for AI agents
- [ ] Document deployment process
- [ ] Create troubleshooting guide

**Deliverables:**
- ✅ Complete README
- ✅ API documentation
- ✅ AGENTS.md for AI maintenance
- ✅ Deployment guide

### Success Criteria
- ✅ All tests passing in CI/CD
- ✅ Test coverage > 75%
- ✅ Documentation complete
- ✅ Ready for production deployment

---

## Milestone 9: Production Launch

**Duration**: Week 9+ (ongoing)
**Goal**: Deploy to production and monitor

### Tasks

#### 9.1 Production Deployment
**Estimated Time**: 2-3 hours

- [ ] Upgrade MongoDB Atlas to M10 (if needed)
- [ ] Configure production environment variables
- [ ] Deploy to Vercel production
- [ ] Set up custom domain
- [ ] Configure SSL certificate

**Deliverables:**
- ✅ Production deployment live
- ✅ Custom domain configured
- ✅ SSL certificate active

#### 9.2 Monitoring Setup
**Estimated Time**: 2-3 hours

- [ ] Configure Sentry for production
- [ ] Set up Vercel Analytics
- [ ] Configure Better Stack uptime monitoring
- [ ] Set up alerting (Slack/email)
- [ ] Create monitoring dashboard

**Deliverables:**
- ✅ Monitoring active
- ✅ Alerts configured
- ✅ Dashboard accessible

#### 9.3 Initial Data Population
**Estimated Time**: Variable (depends on data source)

- [ ] Source 100+ real volunteering activities
- [ ] Verify organization information
- [ ] Generate embeddings for all activities
- [ ] QA check all activities

**Deliverables:**
- ✅ 100+ activities in production
- ✅ All embeddings generated
- ✅ Search returns relevant results

#### 9.4 Launch & Iteration
**Estimated Time**: Ongoing

- [ ] Announce launch (social media, communities)
- [ ] Monitor error rates and performance
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Plan next features based on usage

**Deliverables:**
- ✅ Public announcement made
- ✅ Feedback mechanism in place
- ✅ Bug fixes deployed within 24 hours

### Success Criteria
- ✅ Zero critical errors in first week
- ✅ Search latency < 200ms (p95)
- ✅ Uptime > 99.9%
- ✅ Positive user feedback
- ✅ At least 50 unique searches in first week

---

## Post-Launch Roadmap (Future Milestones)

### Milestone 10: User Accounts & Saved Searches
- User authentication (Clerk)
- Save favorite activities
- Search history
- Email alerts for new matching activities

### Milestone 11: Enhanced Search
- Filters (skills, time commitment, virtual/in-person)
- Sort options (relevance, distance, date)
- Advanced location search (radius, multiple locations)
- Query suggestions and autocomplete

### Milestone 12: Analytics & Insights
- Activity view tracking
- Popular searches
- Geographic heatmaps
- Organization dashboards

### Milestone 13: Mobile App
- React Native mobile app
- Push notifications
- Offline support
- Location-based recommendations

---

## Development Commands Reference

```bash
# Install dependencies
pnpm install

# Development
pnpm dev                    # Start all apps
pnpm dev --filter=web       # Start only Next.js app

# Build
pnpm build                  # Build all packages
pnpm build --filter=web     # Build only web app

# Testing
pnpm test                   # Run all tests
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests
pnpm test:e2e               # E2E tests

# Type checking
pnpm type-check             # Check all packages

# Linting
pnpm lint                   # Lint all code
pnpm lint:fix               # Fix linting issues

# Database
pnpm seed                   # Seed development database
pnpm generate-embeddings    # Generate embeddings for activities
pnpm create-indexes         # Create MongoDB indexes

# Deployment
vercel                      # Deploy to preview
vercel --prod               # Deploy to production
```

---

## Success Metrics (Overall)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Search Latency** | <200ms (p95) | Vercel Analytics |
| **Search Accuracy** | >80% relevant results | User feedback |
| **Uptime** | >99.9% | Better Stack |
| **Error Rate** | <1% | Sentry |
| **Test Coverage** | >75% | Vitest |
| **Lighthouse Score** | >90 | Lighthouse CI |
| **Core Web Vitals** | All passing | Vercel Analytics |
| **Monthly Cost** | <$50 | Vercel + MongoDB bills |
| **User Satisfaction** | >4/5 stars | Feedback form |

---

**Last Updated**: 2026-01-07
**Version**: 1.0
**Status**: Ready for implementation
