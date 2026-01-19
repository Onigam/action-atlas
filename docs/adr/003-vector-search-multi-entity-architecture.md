# ADR-003: Vector Search Multi-Entity Architecture

**Status**: Accepted

**Date**: 2026-01-19

**Deciders**: Architecture Team, AI Development Team

**Supersedes**: None (extends ADR-001)

---

## Context

Action Atlas has reached production deployment with MongoDB Atlas. The `activities` collection has embeddings calculated and stored, but vector search is not yet operational because the Atlas vector search index has not been created.

Before creating the index, we need to decide on the optimal architecture for vector search, specifically addressing:

1. Should we search only activities, or also organizations (charities)?
2. If searching both, should we use a unified collection or keep them separate?
3. What synchronization strategy should we use if we unify collections?

### Current State

| Component | Status |
|-----------|--------|
| **Activities Collection** | Has 1536-dimensional embeddings (OpenAI `text-embedding-3-small`) |
| **Organizations Collection** | Named `charities`, NO embeddings currently |
| **Vector Index** | `activity_vector_search` defined in code but not created in Atlas |
| **Search Service** | Implemented for activities only (`vector-search-service.ts`) |

### Options Considered

1. **Option A: Keep Separate Collections (Activities Only)** - Create vector search index only on activities
2. **Option B: Add Embeddings to Organizations (Parallel Search)** - Separate indexes, query both with `$unionWith`
3. **Option C: Unified Search Collection** - Denormalized collection with sync mechanism

---

## Decision

We will implement a **phased approach**:

- **Phase 1 (MVP/Immediate)**: Option A - Create vector search index on activities only
- **Phase 2 (Post-MVP)**: Option B - Add embeddings to organizations with parallel search

**Option C (Unified Collection) is explicitly rejected** due to synchronization complexity, which contradicts the principles established in ADR-001.

---

## Rationale

### Why Option A for MVP?

1. **Aligns with ADR-001 principles**: Simplicity, single source of truth, no sync issues
2. **Immediate production enablement**: Unblocks vector search with zero additional work
3. **Validates user needs**: Gather feedback on whether organization search is actually needed
4. **Resource efficiency**: No additional embedding costs or index management

### Why Option B for Long-Term (Not Option C)?

1. **Preserves domain integrity**: Each entity type maintains its own data model
2. **No synchronization complexity**: ADR-001 explicitly cited "no synchronization issues" as key rationale
3. **Scalable pattern**: Can add more entity types (events, volunteers) following same approach
4. **Clear ownership**: Activity team owns activity embeddings, organization team owns theirs
5. **MongoDB best practice**: `$unionWith` is the recommended approach for cross-collection vector search

### Why NOT Option C (Unified Collection)?

| Risk | Impact | Mitigation Difficulty |
|------|--------|----------------------|
| Sync failures | Stale search results | High - requires monitoring, alerts, reconciliation |
| Data inconsistency | Wrong results, user confusion | High - hard to debug |
| Schema drift | Sync logic breaks silently | Medium - requires coordination |
| Delete handling | Orphaned documents | Medium - requires cleanup jobs |
| Operational overhead | Increased maintenance burden | Ongoing |

Quote from ADR-001: *"No synchronization issues between databases"* was a key rationale for choosing MongoDB Atlas Vector Search. Option C would reintroduce this complexity within the same database.

---

## Architecture

### Phase 1: Activities-Only Vector Search (MVP)

```
User Query
    │
    ▼
┌─────────────────────┐
│ Embedding Generation│
│ (text-embedding-3-small)
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ activities collection│
│ - embedding (1536)  │
│ - category filter   │
│ - isActive filter   │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ Activity Results    │
└─────────────────────┘
```

### Phase 2: Parallel Search with $unionWith (Post-MVP)

```
User Query
    │
    ▼
┌─────────────────────┐
│ Embedding Generation│
└─────────────────────┘
    │
    ├────────────────────────────┐
    ▼                            ▼
┌──────────────────┐    ┌──────────────────┐
│ activities       │    │ charities        │
│ collection       │    │ collection       │
│ - embedding      │    │ - embedding      │
│ - category       │    │ - status         │
└──────────────────┘    └──────────────────┘
    │                            │
    └──────────┬─────────────────┘
               ▼
┌─────────────────────┐
│ $unionWith merge    │
│ Sort by score       │
└─────────────────────┘
               │
               ▼
┌─────────────────────┐
│ Unified Results     │
│ (activities + orgs) │
└─────────────────────┘
```

---

## Implementation

### Phase 1: Create Activities Vector Search Index

**Step 1: Create the index in MongoDB Atlas UI**

Navigate to Atlas → Database → Browse Collections → Search Indexes → Create Search Index

Index Definition (JSON Editor):
```json
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

**Step 2: Verify the index**

```javascript
// In MongoDB Shell or Compass
db.activities.aggregate([
  {
    $vectorSearch: {
      index: "activity_vector_search",
      path: "embedding",
      queryVector: [/* 1536 floats */],
      numCandidates: 100,
      limit: 5
    }
  },
  {
    $project: {
      title: 1,
      score: { $meta: "vectorSearchScore" }
    }
  }
])
```

### Phase 2: Organization Embeddings (When Needed)

**Step 1: Extend Organization Schema**

```typescript
// packages/types/src/domain/organization.ts
export const Organization = z.object({
  // ... existing fields ...

  // NEW: Embedding fields
  searchableText: z.string().optional(),
  embedding: z.array(z.number()).optional(),
  embeddingModel: z.literal('text-embedding-3-small').optional(),
  embeddingUpdatedAt: z.date().optional(),
});
```

**Step 2: Add embedding preparation function**

```typescript
// packages/ai/src/embedding.ts
export function prepareOrganizationForEmbedding(org: {
  name: string;
  description: string;
  mission?: string;
  location?: { address?: { city?: string; country?: string } };
}): string {
  const parts = [
    org.name,
    org.description,
    org.mission,
    'Volunteer organization',
    org.location?.address?.city,
    org.location?.address?.country,
  ].filter(Boolean);

  return parts.join('. ');
}
```

**Step 3: Create organization vector search index**

```json
{
  "name": "organization_vector_search",
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
        "path": "status"
      }
    ]
  }
}
```

**Step 4: Implement unified search with $unionWith**

```typescript
// packages/ai/src/unified-search-service.ts
export async function unifiedSemanticSearch(
  db: Db,
  options: UnifiedSearchOptions
): Promise<UnifiedSearchResult[]> {
  const { queryVector, limit = 20, entityTypes = ['activity', 'organization'] } = options;

  const pipeline: Document[] = [];

  // Start with activities vector search
  if (entityTypes.includes('activity')) {
    pipeline.push({
      $vectorSearch: {
        index: 'activity_vector_search',
        path: 'embedding',
        queryVector,
        numCandidates: Math.max(100, limit * 5),
        limit: limit
      }
    });
    pipeline.push({
      $addFields: {
        entityType: 'activity',
        relevanceScore: { $meta: 'vectorSearchScore' }
      }
    });
  }

  // Union with organizations if included
  if (entityTypes.includes('organization')) {
    pipeline.push({
      $unionWith: {
        coll: 'charities',
        pipeline: [
          {
            $vectorSearch: {
              index: 'organization_vector_search',
              path: 'embedding',
              queryVector,
              numCandidates: Math.max(100, limit * 5),
              limit: limit
            }
          },
          {
            $addFields: {
              entityType: 'organization',
              relevanceScore: { $meta: 'vectorSearchScore' }
            }
          }
        ]
      }
    });
  }

  // Sort combined results by relevance
  pipeline.push({ $sort: { relevanceScore: -1 } });
  pipeline.push({ $limit: limit });

  const collection = db.collection('activities');
  return await collection.aggregate(pipeline).toArray();
}
```

---

## Performance Considerations

### Index Configuration

| Parameter | Current | Recommended |
|-----------|---------|-------------|
| `numCandidates` | 100 | 400 (20x limit for better recall) |
| `similarity` | cosine | cosine (correct for OpenAI embeddings) |
| `numDimensions` | 1536 | 1536 (matches text-embedding-3-small) |

### Query Optimization

- **Pre-filtering**: Use `filter` fields in index definition for `category`, `isActive`, `status`
- **Limit tuning**: Start with limit=20, adjust based on UI needs
- **numCandidates**: Set to at least 20x the desired limit for optimal recall

### Scaling Thresholds

| Data Volume | Recommendation |
|-------------|----------------|
| < 10K vectors | Current config sufficient |
| 10K - 100K | Consider Atlas Search Nodes |
| 100K - 1M | Enable scalar quantization |
| > 1M | Evaluate migration to Qdrant per ADR-001 |

---

## Consequences

### Positive

- **Immediate unblock**: Vector search operational in production
- **Minimal complexity**: Single index to start
- **Clear evolution path**: Option B well-documented for when needed
- **Consistent with ADR-001**: No sync complexity introduced

### Negative

- **Limited search scope (Phase 1)**: Users cannot discover organizations semantically
- **Two indexes to manage (Phase 2)**: Additional operational overhead
- **Result merging complexity (Phase 2)**: Need to normalize scores across entity types

### Mitigations

1. **Phase 1 limitation**: Provide text search for organizations as fallback
2. **Phase 2 complexity**: Use feature flags for gradual rollout
3. **Score normalization**: Implement weighted scoring based on user feedback

---

## Migration Path (If Needed Later)

If performance degrades at scale or requirements change significantly:

### To Unified Collection (Option C)

If unified collection becomes necessary:

1. Create `search_documents` collection
2. Implement Atlas Triggers for sync:
   - `activities.insert/update` → upsert to `search_documents`
   - `activities.delete` → delete from `search_documents`
   - Same for `charities`
3. Create single vector index on `search_documents`
4. Switch search service behind feature flag
5. Monitor sync lag and consistency

**Warning**: This path introduces the sync complexity rejected by ADR-001. Only pursue if:
- Performance requirements cannot be met by Option B
- Resources available for operational overhead
- Clear business justification

### To Dedicated Vector Database (Qdrant)

Per ADR-001 migration path:

1. Export embeddings from MongoDB
2. Import to Qdrant with metadata
3. Switch search queries to Qdrant API
4. Keep MongoDB as source of truth
5. Estimated downtime: 2-4 hours for 100K activities

---

## Action Items

### Immediate (Phase 1)

- [ ] Create `activity_vector_search` index in MongoDB Atlas production
- [ ] Verify index with test queries
- [ ] Monitor search latency and recall quality
- [ ] Gather user feedback on organization search needs

### Future (Phase 2 - When Validated)

- [ ] Add embedding fields to Organization schema
- [ ] Create embedding generation script for organizations
- [ ] Generate embeddings for existing organizations
- [ ] Create `organization_vector_search` index
- [ ] Implement unified search service
- [ ] Update API to support entity type filtering
- [ ] Deploy behind feature flag

---

## References

- [ADR-001: MongoDB Atlas Vector Search](./001-mongodb-atlas-vector-search.md)
- [MongoDB Atlas Vector Search Documentation](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)
- [MongoDB $unionWith Aggregation](https://www.mongodb.com/docs/manual/reference/operator/aggregation/unionwith/)
- [MongoDB Vector Search Performance Tuning](https://www.mongodb.com/docs/atlas/atlas-vector-search/tune-vector-search/)

---

## Review Notes

**Acceptance Criteria:**
- [x] Maintains ADR-001 principles (simplicity, no sync issues)
- [x] Provides clear implementation path
- [x] Documents trade-offs and alternatives
- [x] Includes migration strategies

**Approved By:**
- Technical Lead: Pending
- Product Owner: Pending

**Next Review**: After Phase 1 deployment or when organization search becomes a validated requirement
