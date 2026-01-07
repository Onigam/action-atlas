# ADR-001: Use MongoDB Atlas Vector Search over Separate Vector Database

**Status**: Accepted

**Date**: 2026-01-07

**Deciders**: Architecture Team, AI Development Team

---

## Context

Action Atlas requires vector similarity search for semantic activity discovery. We need to store activity embeddings (1536-dimensional vectors from OpenAI) and perform fast cosine similarity searches.

### Options Considered

1. **MongoDB Atlas Vector Search** (MongoDB as single database with native vector search)
2. **ChromaDB** (Separate vector database as specified in product vision)
3. **Qdrant** (Open-source vector database with cloud option)
4. **Pinecone** (Fully managed vector database)
5. **PostgreSQL + pgvector** (Relational database with vector extension)

---

## Decision

We will use **MongoDB Atlas Vector Search** as the primary solution for MVP, with ChromaDB as a development alternative.

### Implementation Approach

```typescript
// MongoDB document with embedded vector
interface ActivityDocument {
  _id: ObjectId;
  title: string;
  description: string;
  // ... other fields
  embedding: number[]; // 1536-dimensional vector
  embeddingModel: 'text-embedding-3-small';
  embeddingUpdatedAt: Date;
}

// Vector search query
db.activities.aggregate([
  {
    $vectorSearch: {
      index: 'activity_vector_search',
      path: 'embedding',
      queryVector: queryEmbedding,
      numCandidates: 100,
      limit: 20,
    }
  },
  {
    $addFields: {
      relevanceScore: { $meta: 'vectorSearchScore' }
    }
  }
]);
```

---

## Rationale

### Why MongoDB Atlas Vector Search Wins

1. **Single Source of Truth**
   - Activities and embeddings stored together
   - No synchronization issues between databases
   - ACID transactions ensure consistency

2. **Simpler Architecture**
   ```
   MongoDB Atlas Only:
   App → MongoDB Atlas (activities + vectors)

   vs.

   Separate Vector DB:
   App → MongoDB (activities) + ChromaDB/Qdrant (vectors)
   ```

3. **Lower Operational Complexity**
   - One database to manage, backup, and monitor
   - One connection pool to configure
   - Simpler deployment (no separate vector DB instance)

4. **Better Data Consistency**
   - Update activity and embedding in single transaction
   - No risk of stale embeddings in separate DB
   - Easier rollback and disaster recovery

5. **Cost Efficiency (MVP)**
   - MongoDB Atlas M0 (FREE) for development
   - M10 ($57/month) for production with vector search included
   - No additional vector database costs

6. **Lower Latency**
   - No cross-database queries
   - Single network hop
   - Co-located data and vectors

7. **Geospatial + Vector Search**
   - MongoDB natively supports both geospatial (2dsphere) and vector search
   - Can combine in single aggregation pipeline
   - Hybrid search: semantic relevance + location proximity

8. **Developer Experience**
   - Familiar MongoDB syntax
   - Single query language
   - Easier for AI agents to understand and maintain

### Why NOT Separate Vector Database (for MVP)

**ChromaDB:**
- ❌ Requires separate deployment and management
- ❌ Synchronization complexity (on-write vs. batch)
- ❌ Risk of MongoDB-ChromaDB data inconsistency
- ❌ Two databases to backup and restore
- ❌ Not production-ready at scale (requires migration to Qdrant anyway)

**Qdrant:**
- ❌ Additional infrastructure to manage
- ❌ More complex architecture
- ❌ Higher operational overhead
- ✅ Better performance at massive scale (>1M vectors)
- ✅ Advanced filtering capabilities
- ✅ Open-source with self-hosting option

**Pinecone:**
- ❌ Vendor lock-in
- ❌ Higher cost ($70+/month for production)
- ❌ Less control over infrastructure

**PostgreSQL + pgvector:**
- ❌ Would require switching primary database
- ❌ pgvector performance lags specialized vector DBs
- ❌ Less flexible schema than MongoDB

---

## Consequences

### Positive

✅ **Rapid MVP Development**: Single database means faster development
✅ **Lower Cost**: Free M0 tier for development, $57/month M10 for production
✅ **Simpler Deployment**: One database connection, one backup strategy
✅ **Better Consistency**: No sync issues between databases
✅ **AI Agent Friendly**: Simpler architecture easier to understand

### Negative

⚠️ **Scaling Limitations**: MongoDB Atlas Vector Search may not scale as well as specialized vector DBs beyond 1M vectors
⚠️ **Less Optimized**: Slightly slower than Qdrant/Pinecone for pure vector operations
⚠️ **Feature Gaps**: Fewer advanced vector search features than specialized DBs

### Mitigation Strategies

1. **Performance Monitoring**: Track vector search latency and scale accordingly
2. **Migration Path**: If performance degrades at scale, migrate to Qdrant
   - Export embeddings from MongoDB
   - Import to Qdrant with metadata
   - Switch search queries to Qdrant API
   - Keep MongoDB as source of truth
   - Estimated downtime: 2-4 hours for 100K activities

3. **Indexing Strategy**: Optimize MongoDB vector search with proper indexes
   ```javascript
   // Create optimized vector search index in Atlas UI
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
   ```

---

## Alternatives Considered

### Alternative 1: MongoDB + ChromaDB (Product Vision Spec)

**Pros:**
- Aligns with product vision document
- ChromaDB excellent for local development
- Dedicated vector database

**Cons:**
- Two databases to manage
- Synchronization complexity:
  ```typescript
  // Complex sync logic required
  async function createActivity(data: ActivityInput) {
    // 1. Insert into MongoDB
    const activity = await mongodb.insert(data);

    // 2. Generate embedding
    const embedding = await openai.embed(activity.description);

    // 3. Insert into ChromaDB
    await chromadb.upsert({
      id: activity.id,
      embedding,
      metadata: { /* subset of activity data */ }
    });

    // 4. Update MongoDB with ChromaDB ID
    await mongodb.update(activity.id, { chromadbId: chromaId });

    // PROBLEM: What if step 3 or 4 fails? Inconsistent state!
  }
  ```
- ChromaDB not production-ready (would need to migrate to Qdrant anyway)

**Decision:** Not chosen for MVP due to complexity. Can add ChromaDB for development if MongoDB Atlas proves insufficient.

### Alternative 2: MongoDB + Qdrant (Production-Grade Separate)

**Pros:**
- Qdrant production-ready and performant
- Open-source with self-hosting option
- Advanced filtering and hybrid search

**Cons:**
- Same synchronization issues as ChromaDB
- Higher operational complexity
- Additional cost ($10-100/month for cloud, or self-hosting effort)
- Overkill for MVP with <10K activities

**Decision:** Not chosen for MVP. Qdrant remains the best migration target if MongoDB Atlas becomes insufficient at scale.

### Alternative 3: Pinecone (Fully Managed)

**Pros:**
- Zero DevOps overhead
- Excellent performance
- Proven at scale

**Cons:**
- Vendor lock-in (no self-hosting option)
- Higher cost ($70+/month for production)
- Still requires synchronization with MongoDB
- Less control over infrastructure

**Decision:** Not chosen due to cost and vendor lock-in concerns.

---

## References

- [MongoDB Atlas Vector Search Documentation](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)
- [thegoodsearch Codebase Analysis](../architecture.md#database-stack)
- [Qdrant vs MongoDB Atlas Comparison](https://zilliz.com/comparison/qdrant-vs-mongodb-atlas)
- [Vector Database Comparison 2026](https://www.firecrawl.dev/blog/best-vector-databases-2025)

---

## Related Decisions

- [ADR-002: Use Vercel AI SDK over Langchain](./002-vercel-ai-sdk.md)
- [ADR-005: Use Turborepo Monorepo](./005-turborepo-monorepo.md)

---

## Review Notes

**Acceptance Criteria Met:**
- ✅ Simplifies architecture
- ✅ Reduces operational overhead
- ✅ Lowers MVP cost
- ✅ Maintains performance targets (<200ms search latency)
- ✅ Clear migration path if scaling requires it

**Approved By:**
- Technical Lead: ✅
- Product Owner: ✅
- DevOps Lead: ✅

**Next Review**: After reaching 50K activities or if search latency exceeds 500ms p95
