# Docker Local Development Setup (NEW RECOMMENDED)

> **🎉 Updated January 2026**: MongoDB vector search is now available locally!

## Overview

As of **September 2025**, MongoDB Community Edition 8.2 includes **full vector search support** ([announcement](https://www.mongodb.com/company/blog/product-release-announcements/supercharge-self-managed-apps-search-vector-search-capabilities)). This means you can now run the complete Action Atlas stack **locally with Docker** - no cloud dependencies!

### Why This is Now the Best Approach

**Before (2024-2025):**
- ❌ Vector search only in MongoDB Atlas (cloud)
- ❌ Needed separate vector database (ChromaDB, Pinecone)
- ❌ Or paid MongoDB Atlas subscription

**After (September 2025+):**
- ✅ Full `$vectorSearch` support in Community Edition
- ✅ Complete local development environment
- ✅ Pre-loaded data with embeddings
- ✅ Works offline
- ✅ **$0 cost**
- ✅ Consistent across all developers

---

## Quick Start (10 Minutes)

### Prerequisites

- **Docker Desktop** installed ([download](https://www.docker.com/products/docker-desktop))
- **Docker Compose** (included with Docker Desktop)
- **Git** for cloning the repository

### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/YOUR_ORG/action-atlas.git
cd action-atlas

# 2. Start MongoDB with vector search
docker-compose up -d

# Wait for initialization (first run: ~2-3 minutes)
# Downloads data, loads it, creates vector search index

# 3. Check status
docker-compose logs -f mongodb-init

# Look for: "✅ MongoDB initialization complete!"

# 4. Install Node dependencies
pnpm install

# 5. Configure environment
cp .env.example .env.local

# Edit .env.local:
MONGODB_URI=mongodb://localhost:27017/actionatlas
OPENAI_API_KEY=sk-...  # For runtime search queries

# 6. Start development server
pnpm dev

# 7. Test vector search!
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"help kids with homework"}'
```

**That's it!** You now have a fully functional local development environment with vector search.

---

## Architecture

### Docker Compose Services

```
┌─────────────────────────────────────────────────────────────┐
│  Docker Compose                                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  mongodb (MongoDB 8.2 Community)                     │  │
│  │  - Port: 27017                                       │  │
│  │  - Replica Set: rs0 (required for search)           │  │
│  │  - Volume: Persistent storage                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↕                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  mongot (MongoDB Search Binary)                      │  │
│  │  - Handles vector search indexing                    │  │
│  │  - Manages $vectorSearch queries                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↕                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  mongodb-init (Initialization)                       │  │
│  │  - Downloads data from GitHub Releases               │  │
│  │  - Loads into MongoDB                                │  │
│  │  - Creates vector search index                       │  │
│  │  - Runs once, then exits                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│  Next.js App (localhost:3000)                               │
│  - Connects to localhost:27017                              │
│  - Uses $vectorSearch for semantic search                   │
│  - Full vector search capabilities                          │
└─────────────────────────────────────────────────────────────┘
```

---

## What Gets Set Up

### 1. MongoDB 8.2 Community Edition

**Image**: `mongodb/mongodb-community-server:8.2.0-ubi9`

**Features**:
- Full MongoDB database
- Replica set configuration (required for search)
- Persistent data storage
- Health checks

**Ports**: `27017` (standard MongoDB port)

### 2. mongot (Search Binary)

**Image**: `mongodb/mongodb-community-search:0.53.1`

**Purpose**: Handles vector search operations
- Indexes vector embeddings
- Processes `$vectorSearch` aggregation stages
- Manages search indexes

**Connection**: Internal to MongoDB

### 3. Automated Initialization

On first run, the init container:

1. **Initializes Replica Set**
   ```javascript
   rs.initiate({
     _id: "rs0",
     members: [{ _id: 0, host: "mongodb:27017" }]
   })
   ```

2. **Downloads Data** (if not local)
   - From GitHub Releases: `v1.0-data/seed-dataset.agz`
   - Or uses local file: `data/seed-dataset.agz`

3. **Loads Data into MongoDB**
   ```bash
   mongorestore --gzip --archive=seed-dataset.agz
   ```

4. **Creates Vector Search Index**
   ```javascript
   db.activities.createSearchIndex(
     "activity_vector_search",
     "vectorSearch",
     {
       fields: [
         { type: "vector", path: "embedding", numDimensions: 1536, similarity: "cosine" },
         { type: "filter", path: "isActive" },
         { type: "filter", path: "category" }
       ]
     }
   )
   ```

---

## Data Management

### First Run (No Local Data)

```bash
docker-compose up -d

# Init container:
# 1. Downloads seed-dataset.agz from GitHub Releases
# 2. Loads into MongoDB
# 3. Creates vector search index
# Time: ~2-3 minutes
```

### Subsequent Runs (Data Persisted)

```bash
docker-compose up -d

# Init container:
# 1. Checks if data exists
# 2. Skips download/load (data in volume)
# 3. Verifies index exists
# Time: ~10 seconds
```

### Reset Data

```bash
# Stop services
docker-compose down

# Remove data volume
docker volume rm action-atlas_mongodb_data

# Restart (re-downloads and loads data)
docker-compose up -d
```

### Update Data Version

```bash
# 1. Update GITHUB_RELEASE_TAG in docker-compose.yml
# 2. Reset data (above)
# 3. Restart
```

---

## Vector Search Usage

### Query Embedding at Runtime

```typescript
// app/api/search/route.ts
import { OpenAI } from 'openai';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  const { query } = await request.json();

  // 1. Generate query embedding
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;

  // 2. Vector search in MongoDB
  const client = await clientPromise;
  const results = await client
    .db('actionatlas')
    .collection('activities')
    .aggregate([
      {
        $vectorSearch: {
          index: 'activity_vector_search',
          path: 'embedding',
          queryVector: queryEmbedding,  // 1536-dimensional vector
          numCandidates: 100,
          limit: 20,
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          organization: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ])
    .toArray();

  return Response.json({ results });
}
```

### Activity Embeddings (Pre-Generated)

Activity embeddings are **already in the data file** loaded during initialization:

```javascript
{
  _id: ObjectId("..."),
  title: "Teach Kids Programming",
  description: "Help children learn coding...",
  embedding: [0.123, -0.456, ...], // 1536 dimensions
  // ... other fields
}
```

**You don't generate these!** They're pre-generated and included in `seed-dataset.agz`.

---

## Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services (preserves data)
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f mongodb
docker-compose logs -f mongot
docker-compose logs -f mongodb-init
```

### MongoDB Shell Access

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/actionatlas

# Check data
> db.activities.countDocuments()
127

# Check embeddings
> db.activities.findOne({ embedding: { $exists: true } })

# List search indexes
> db.activities.getSearchIndexes()

# Test vector search
> db.activities.aggregate([
    {
      $vectorSearch: {
        index: "activity_vector_search",
        path: "embedding",
        queryVector: [...], // 1536-dim vector
        numCandidates: 100,
        limit: 5
      }
    }
  ])
```

### Health Checks

```bash
# Check service health
docker-compose ps

# All services should show "healthy" or "running"
```

---

## Troubleshooting

### MongoDB Not Starting

**Error**: `mongod: error while loading shared libraries`

**Solution**:
```bash
# Pull latest image
docker pull mongodb/mongodb-community-server:8.2.0-ubi9

# Restart
docker-compose up -d
```

### Vector Search Not Working

**Error**: `index 'activity_vector_search' not found`

**Check**:
```bash
# Verify index exists
mongosh mongodb://localhost:27017/actionatlas \
  --eval "db.activities.getSearchIndexes()"

# If missing, recreate:
docker-compose restart mongodb-init
```

### Init Container Keeps Restarting

**Check logs**:
```bash
docker-compose logs mongodb-init

# Common issues:
# 1. GitHub Release not found → Update GITHUB_RELEASE_TAG
# 2. Network error → Check internet connection
# 3. Replica set not ready → Wait 30s and restart
```

### Data Not Loading

**Check**:
```bash
# Verify data file
ls -lh data/seed-dataset.agz

# Manual restore:
docker exec -it mongo_vector_main bash
mongorestore --gzip --archive=/data/seed-dataset.agz
```

### Port 27017 Already in Use

**Solution**:
```bash
# Find process using port
lsof -i :27017

# Stop local MongoDB
brew services stop mongodb-community  # macOS
sudo systemctl stop mongod            # Linux

# Or change port in docker-compose.yml:
ports:
  - "27018:27017"  # Use different host port
```

---

## Cost Analysis

### One-Time Setup Costs

```
Docker Desktop:               $0 (free for personal use)
MongoDB Community Edition:    $0 (open source)
Data Download:               $0 (GitHub Releases)
Embedding Generation:        $2 (one-time, already done)
──────────────────────────────
Total:                       $2
```

### Ongoing Costs

```
MongoDB Hosting:             $0 (runs locally)
Docker Storage:              $0 (~500MB disk space)
OpenAI API (query embedding): $0.00002 per search
──────────────────────────────
Total Monthly:               $0 (or $0.01 if 500 searches)
```

### vs. MongoDB Atlas

| Aspect | Docker Local | MongoDB Atlas |
|--------|-------------|---------------|
| **Setup** | 10 min | 5 min |
| **Monthly Cost** | $0 | $0 (M0 free tier) |
| **Offline Work** | ✅ Yes | ❌ No |
| **Consistency** | ✅ Perfect | ✅ Perfect |
| **Scalability** | ⚠️ Single machine | ✅ Unlimited |
| **Backups** | ⚠️ Manual | ✅ Automatic |
| **Best For** | Development | Production |

**Recommendation**: Docker for development, Atlas for production.

---

## Alternative: mongodb-atlas-local

For a simpler setup that mimics Atlas exactly:

```yaml
# docker-compose.atlas-local.yml
version: '3.9'

services:
  atlas-local:
    image: mongodb/mongodb-atlas-local:latest
    ports:
      - "27017:27017"
    volumes:
      - atlas_data:/data/db
    environment:
      - DO_NOT_TRACK=1

volumes:
  atlas_data:
```

**Start**:
```bash
docker-compose -f docker-compose.atlas-local.yml up -d
```

**Pros**:
- Simpler setup (single container)
- Identical to Atlas API
- Pre-configured for vector search

**Cons**:
- Larger image size
- Less control over configuration

**See**: [MongoDB Atlas Local Documentation](https://www.mongodb.com/docs/atlas/cli/current/atlas-cli-deploy-docker/)

---

## Migration from Previous Setup

### From MongoDB Atlas (Cloud)

**Export data from Atlas**:
```bash
mongodump --uri="mongodb+srv://..." \
  --gzip \
  --archive=data/seed-dataset-atlas.agz
```

**Update docker-compose.yml**:
```yaml
# Point to your exported file
volumes:
  - ./data/seed-dataset-atlas.agz:/data/seed-dataset.agz:ro
```

**Restart**:
```bash
docker-compose down -v
docker-compose up -d
```

### From Local MongoDB (without Docker)

**Export existing data**:
```bash
mongodump --uri="mongodb://localhost:27017/actionatlas" \
  --gzip \
  --archive=data/seed-dataset.agz
```

**Stop local MongoDB**:
```bash
brew services stop mongodb-community  # macOS
sudo systemctl stop mongod            # Linux
```

**Start Docker**:
```bash
docker-compose up -d
```

**Update .env.local**: (Connection string stays the same: `mongodb://localhost:27017/actionatlas`)

---

## Production Deployment

**Important**: This Docker setup is for **development only**.

**For production**, use:
1. **MongoDB Atlas** (managed, scalable, backups)
2. **Or**: Self-hosted MongoDB Enterprise with proper ops

**See**: [Production Deployment Guide](./production-deployment.md) (to be created)

---

## Sources

- [MongoDB Vector Search in Community Edition](https://www.mongodb.com/company/blog/product-release-announcements/supercharge-self-managed-apps-search-vector-search-capabilities)
- [MongoDB 8.2 Community Edition Vector Search Tutorial](https://www.ostberg.dev/work/2025/10/12/mongodb-community-vector-search.html)
- [MongoDB Atlas Local Docker Documentation](https://www.mongodb.com/docs/atlas/cli/current/atlas-cli-deploy-docker/)
- [Docker Hub: mongodb/mongodb-atlas-local](https://hub.docker.com/r/mongodb/mongodb-atlas-local)
- [MongoDB Vector Search Overview](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)

---

**Last Updated**: 2026-01-07
**Status**: ⭐ **NEW RECOMMENDED APPROACH**
**MongoDB Version**: 8.2.0+
**Vector Search**: Public Preview → General Availability (Q1 2026)
