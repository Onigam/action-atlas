# MongoDB Atlas Vector Search Index Setup Guide

This guide provides step-by-step instructions for creating the vector search index in MongoDB Atlas production.

## Prerequisites

- Access to MongoDB Atlas with `Project Owner` or `Project Data Access Admin` role
- Production cluster running (M10 or higher tier recommended for vector search)
- Activities collection populated with embeddings

## Step 1: Access MongoDB Atlas

1. Navigate to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your project and cluster
3. Click **Browse Collections**

## Step 2: Navigate to Search Indexes

1. Select the database (e.g., `action-atlas` or your production database name)
2. Click on **Search Indexes** tab
3. Click **Create Search Index**

## Step 3: Choose Index Type

1. Select **Atlas Vector Search** (not Atlas Search)
2. Click **Next**

## Step 4: Select Configuration Method

Choose **JSON Editor** for precise control.

## Step 5: Configure the Index

**Database and Collection:**
- Database: `<your-database-name>`
- Collection: `activities`

**Index Name:**
```
activity_vector_search
```

**Index Definition (paste in JSON Editor):**

```json
{
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
```

## Step 6: Create the Index

1. Review the configuration
2. Click **Create Search Index**
3. Wait for the index to build (status will show "Building" then "Active")

**Note:** Index build time depends on data volume. For ~100 activities, expect < 1 minute.

## Step 7: Verify the Index

### Using MongoDB Atlas UI

1. Go to **Search Indexes** tab
2. Verify `activity_vector_search` shows status **Active**
3. Check the index definition matches your configuration

### Using mongosh (MongoDB Shell)

Connect to your cluster and run:

```javascript
// Check index exists
db.activities.getSearchIndexes()

// Test vector search query (use actual embedding)
db.activities.aggregate([
  {
    $vectorSearch: {
      index: "activity_vector_search",
      path: "embedding",
      queryVector: db.activities.findOne({ embedding: { $exists: true } }).embedding,
      numCandidates: 100,
      limit: 5
    }
  },
  {
    $project: {
      title: 1,
      category: 1,
      score: { $meta: "vectorSearchScore" }
    }
  }
])
```

### Using the Application

After deployment, test via the search API:

```bash
curl -X POST https://your-app.vercel.app/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "environmental volunteering"}'
```

## Troubleshooting

### Index Status: "Building" for too long

- Check cluster tier (M0 free tier does not support vector search)
- Verify embeddings exist: `db.activities.countDocuments({ embedding: { $exists: true } })`

### Search returns empty results

1. Verify index is **Active**
2. Check `isActive: true` on documents
3. Verify embedding dimensions match (1536)
4. Test with lower `numCandidates` value

### Error: "Index not found"

- Index name is case-sensitive: use `activity_vector_search` exactly
- Wait for index to finish building

### Performance issues

- Increase `numCandidates` (recommend 400 for limit=20)
- Check if pre-filtering is too restrictive
- Consider enabling Search Nodes for workload isolation

## Index Configuration Reference

| Field | Value | Purpose |
|-------|-------|---------|
| `type` | `vector` | Enables vector similarity search |
| `path` | `embedding` | Field containing the vector |
| `numDimensions` | `1536` | OpenAI text-embedding-3-small dimension |
| `similarity` | `cosine` | Similarity metric (best for normalized vectors) |
| `type: filter` | `category`, `isActive` | Pre-filter fields for efficient querying |

## Query Parameters Reference

| Parameter | Description | Recommended Value |
|-----------|-------------|-------------------|
| `index` | Index name | `activity_vector_search` |
| `path` | Vector field path | `embedding` |
| `queryVector` | Query embedding (1536 floats) | Generated from user query |
| `numCandidates` | ANN candidates to consider | `400` (20x limit) |
| `limit` | Max results to return | `20` |
| `filter` | Optional pre-filter | `{ isActive: true }` |

## Monitoring

### Key Metrics to Watch

1. **Search Latency**: Target < 100ms p95
2. **Recall Quality**: Spot-check relevance of top results
3. **Index Size**: Monitor growth as activities are added

### Atlas Metrics

Navigate to **Metrics** tab in Atlas to monitor:
- Vector Search Operations/sec
- Vector Search Latency
- Index Size

## Next Steps

After the index is active:

1. [ ] Deploy application with vector search enabled
2. [ ] Test search functionality in production
3. [ ] Set up monitoring alerts for latency > 500ms
4. [ ] Document baseline performance metrics

## Related Documentation

- [ADR-003: Vector Search Multi-Entity Architecture](../adr/003-vector-search-multi-entity-architecture.md)
- [ADR-001: MongoDB Atlas Vector Search](../adr/001-mongodb-atlas-vector-search.md)
- [MongoDB Vector Search Documentation](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/)
