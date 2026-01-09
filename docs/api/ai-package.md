# AI Package API Reference

## Installation

```typescript
import {
  generateEmbedding,
  semanticSearch,
  InMemoryEmbeddingCache
} from '@action-atlas/ai';
```

## Embedding Generation

### generateEmbedding()

Generate a 1536-dimensional embedding for a single text using OpenAI's text-embedding-3-small model.

```typescript
import { generateEmbedding } from '@action-atlas/ai';

const { embedding, tokensUsed } = await generateEmbedding('teach kids programming');

console.log(embedding.length); // 1536
console.log(tokensUsed); // ~3-5 tokens
```

**Parameters:**
- `text: string` - Text to embed (max 8191 characters)

**Returns:** `Promise<EmbeddingResult>`
```typescript
{
  embedding: number[]; // 1536 dimensions
  tokensUsed: number;
}
```

**Environment Variables Required:**
- `OPENAI_API_KEY` - OpenAI API key

### generateEmbeddings()

Generate embeddings for multiple texts in a single batch (more efficient).

```typescript
import { generateEmbeddings } from '@action-atlas/ai';

const texts = [
  'teach kids programming',
  'environmental cleanup',
  'food bank volunteer'
];

const { embeddings, totalTokensUsed } = await generateEmbeddings(texts);

console.log(embeddings.length); // 3
console.log(totalTokensUsed); // ~10-15 tokens
```

**Parameters:**
- `texts: string[]` - Array of texts to embed

**Returns:** `Promise<BatchEmbeddingResult>`
```typescript
{
  embeddings: number[][]; // Array of 1536-dimensional vectors
  totalTokensUsed: number;
}
```

### normalizeText()

Normalize text before embedding (lowercase, trim, dedupe spaces).

```typescript
import { normalizeText } from '@action-atlas/ai';

const text = '  Teach   Kids\n  Programming  ';
const normalized = normalizeText(text);
// Result: 'teach kids programming'
```

**Note:** This is called automatically by `generateEmbedding()` and `generateEmbeddings()`.

### prepareActivityForEmbedding()

Create searchable text from an Activity object.

```typescript
import { prepareActivityForEmbedding } from '@action-atlas/ai';

const searchableText = prepareActivityForEmbedding({
  title: 'Teach Kids Coding',
  description: 'Help children learn programming...',
  organization: {
    name: 'Code Academy',
    mission: 'Empower youth through technology'
  },
  skills: [
    { name: 'Programming' },
    { name: 'Teaching' }
  ],
  category: 'education',
  location: {
    address: { city: 'San Francisco', country: 'USA' }
  }
});

// Result: "Teach Kids Coding. Help children learn programming... Code Academy. Empower youth through technology. Programming, Teaching. education. San Francisco. USA"
```

## Vector Search

### semanticSearch()

Execute semantic search using MongoDB Atlas Vector Search.

```typescript
import { semanticSearch } from '@action-atlas/ai';
import { activities } from '@action-atlas/database';

const collection = activities();

const response = await semanticSearch(collection, {
  query: 'teach kids programming',
  limit: 20,
  category: 'education',
  isActive: true
});

console.log(response.results); // Array of search results
console.log(response.executionTimeMs); // Total time
console.log(response.metadata); // Performance breakdown
```

**Options:**
```typescript
interface VectorSearchOptions {
  query: string;              // Search query
  limit?: number;            // Max results (default: 20)
  numCandidates?: number;    // Vector search candidates (default: 100)
  category?: string | string[]; // Filter by category
  isActive?: boolean;        // Filter by active status (default: true)
  location?: {               // Geospatial filter
    latitude: number;
    longitude: number;
    maxDistance?: number;    // in meters (default: 50000 = 50km)
  };
}
```

**Response:**
```typescript
interface VectorSearchResponse {
  results: VectorSearchResult[];
  total: number;
  executionTimeMs: number;
  metadata: {
    embeddingMs: number;      // Time to generate query embedding
    vectorSearchMs: number;   // Time for vector search
    postProcessingMs: number; // Time for post-processing
  };
}

interface VectorSearchResult {
  document: ActivityDocument;
  relevanceScore: number;     // 0-1, higher is more relevant
  distance?: number;          // Distance in meters (if location filter used)
}
```

### Example: Search with Location Filter

```typescript
const response = await semanticSearch(collection, {
  query: 'environmental cleanup',
  category: ['environment', 'community-development'],
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    maxDistance: 25000 // 25km
  },
  limit: 10
});

// Results are ranked by combined score: 70% semantic + 30% proximity
```

### buildVectorSearchPipeline()

Build a MongoDB aggregation pipeline for vector search (advanced use).

```typescript
import { buildVectorSearchPipeline } from '@action-atlas/ai';

const pipeline = buildVectorSearchPipeline({
  queryVector: [0.123, -0.456, ...], // 1536 dimensions
  limit: 20,
  numCandidates: 100,
  category: 'education',
  isActive: true
});

// Use with MongoDB aggregation
const results = await collection.aggregate(pipeline).toArray();
```

**Use Case:** When you already have a query vector and want to bypass embedding generation.

### searchQueryToOptions()

Convert API SearchQuery to VectorSearchOptions.

```typescript
import { searchQueryToOptions } from '@action-atlas/ai';
import type { SearchQuery } from '@action-atlas/types';

const apiQuery: SearchQuery = {
  query: 'teach kids',
  category: ['education'],
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 50000
  },
  limit: 20,
  offset: 0
};

const options = searchQueryToOptions(apiQuery);
// Ready to use with semanticSearch()
```

## Caching

### InMemoryEmbeddingCache

In-memory cache with TTL for embeddings.

```typescript
import { InMemoryEmbeddingCache, createCacheKey } from '@action-atlas/ai';

const cache = new InMemoryEmbeddingCache();

// Set with 30-day TTL
const key = createCacheKey('teach kids programming');
const embedding = [0.123, -0.456, ...];
await cache.set(key, embedding, { ttl: 30 * 24 * 60 * 60 });

// Get
const cached = await cache.get(key);
if (cached) {
  console.log('Cache hit!');
}

// Delete
await cache.delete(key);

// Clear all
await cache.clear();
```

**Interface:**
```typescript
interface EmbeddingCache {
  get(key: string): Promise<Embedding | null>;
  set(key: string, embedding: Embedding, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

interface CacheOptions {
  ttl?: number; // Time to live in seconds
}
```

### createCacheKey()

Generate a cache key from text (simple hash).

```typescript
import { createCacheKey } from '@action-atlas/ai';

const key = createCacheKey('teach kids programming');
// Result: 'embedding:xyz123'
```

**Note:** `semanticSearch()` automatically uses caching with 30-day TTL.

## Vector Utilities

### cosineSimilarity()

Calculate cosine similarity between two vectors (0-1, higher is more similar).

```typescript
import { cosineSimilarity } from '@action-atlas/ai';

const similarity = cosineSimilarity(vectorA, vectorB);
console.log(similarity); // 0.95 = very similar
```

### normalizeVector()

Normalize a vector to unit length.

```typescript
import { normalizeVector } from '@action-atlas/ai';

const vector = [1, 2, 3];
const normalized = normalizeVector(vector);
// Result: [0.267, 0.535, 0.802]
```

### validateEmbedding()

Type guard to validate embedding dimensions.

```typescript
import { validateEmbedding } from '@action-atlas/ai';

if (validateEmbedding(vector)) {
  // vector is Embedding (1536 dimensions)
  const result = await semanticSearch(collection, { queryVector: vector });
}
```

### euclideanDistance()

Calculate Euclidean (L2) distance between vectors.

```typescript
import { euclideanDistance } from '@action-atlas/ai';

const distance = euclideanDistance(vectorA, vectorB);
console.log(distance); // Lower is more similar
```

### combineScores()

Combine semantic and proximity scores with configurable weights.

```typescript
import { combineScores } from '@action-atlas/ai';

const finalScore = combineScores(
  semanticScore,     // 0-1
  proximityScore,    // 0-1
  0.7                // 70% semantic, 30% proximity
);
```

### calculateProximityScore()

Convert distance to proximity score (0-1).

```typescript
import { calculateProximityScore } from '@action-atlas/ai';

const score = calculateProximityScore(
  5000,    // 5km away
  50000    // Max 50km
);
// Result: 0.9 (very close)
```

## Complete Example: Search Flow

```typescript
import { connectToDatabase, activities } from '@action-atlas/database';
import { semanticSearch } from '@action-atlas/ai';

// 1. Connect to database
await connectToDatabase();

// 2. Get collection
const collection = activities();

// 3. Execute semantic search
const response = await semanticSearch(collection, {
  query: 'teach kids programming on weekends',
  category: ['education', 'youth'],
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    maxDistance: 25000
  },
  limit: 20
});

// 4. Process results
for (const result of response.results) {
  console.log(`${result.document.title} (score: ${result.relevanceScore.toFixed(2)})`);
  if (result.distance) {
    console.log(`  Distance: ${(result.distance / 1000).toFixed(1)}km`);
  }
}

// 5. Performance metrics
console.log(`Total time: ${response.executionTimeMs}ms`);
console.log(`  - Embedding: ${response.metadata.embeddingMs}ms`);
console.log(`  - Vector search: ${response.metadata.vectorSearchMs}ms`);
console.log(`  - Post-processing: ${response.metadata.postProcessingMs}ms`);
```

## Performance Optimization

### 1. Embedding Cache

Embeddings are automatically cached for 30 days to reduce OpenAI API calls:

```typescript
// First call: generates embedding (~150ms)
const response1 = await semanticSearch(collection, {
  query: 'teach kids programming'
});

// Second call: uses cached embedding (~10ms)
const response2 = await semanticSearch(collection, {
  query: 'teach kids programming'
});
```

### 2. Batch Embedding Generation

Generate embeddings for multiple activities efficiently:

```typescript
import { generateEmbeddings, prepareActivityForEmbedding } from '@action-atlas/ai';
import { findActivitiesWithoutEmbeddings, updateActivityEmbedding } from '@action-atlas/database';

// Find activities without embeddings
const activities = await findActivitiesWithoutEmbeddings(100);

// Prepare texts
const texts = activities.map(a => prepareActivityForEmbedding(a));

// Generate all embeddings in one batch
const { embeddings } = await generateEmbeddings(texts);

// Update database
for (let i = 0; i < activities.length; i++) {
  await updateActivityEmbedding(activities[i].activityId, embeddings[i]);
}
```

### 3. Tune Search Parameters

```typescript
// For faster search with reasonable accuracy
const response = await semanticSearch(collection, {
  query: 'environmental cleanup',
  limit: 10,           // Fewer results
  numCandidates: 50    // Fewer candidates (default: 100)
});

// For best accuracy
const response = await semanticSearch(collection, {
  query: 'environmental cleanup',
  limit: 20,
  numCandidates: 200   // More candidates = better results, slower
});
```

## Error Handling

```typescript
import { generateEmbedding, semanticSearch } from '@action-atlas/ai';

try {
  // Check API key
  const { embedding } = await generateEmbedding('test');

  // Execute search
  const results = await semanticSearch(collection, {
    query: 'teach kids'
  });
} catch (error) {
  if (error.message.includes('OPENAI_API_KEY')) {
    console.error('OpenAI API key not set');
  } else if (error.message.includes('rate limit')) {
    console.error('OpenAI rate limit exceeded');
  } else {
    console.error('Search error:', error);
  }
}
```

## Cost Optimization

### OpenAI API Costs

text-embedding-3-small pricing: ~$0.02 per 1M tokens

```typescript
// Estimate tokens (rough approximation: 1 token ≈ 4 characters)
const text = 'teach kids programming';
const estimatedTokens = Math.ceil(text.length / 4);

// Actual usage
const { tokensUsed } = await generateEmbedding(text);
console.log(`Used ${tokensUsed} tokens`);

// Cost calculation
const costPer1MTokens = 0.02;
const cost = (tokensUsed / 1_000_000) * costPer1MTokens;
console.log(`Cost: $${cost.toFixed(6)}`);
```

### Best Practices

1. **Cache aggressively** - 30-day TTL for embeddings
2. **Batch operations** - Use `generateEmbeddings()` for multiple texts
3. **Monitor usage** - Track `tokensUsed` in responses
4. **Precompute embeddings** - Generate for all activities upfront
5. **Update strategically** - Re-embed only when content changes significantly

## Type Definitions

```typescript
import type {
  Embedding,
  EmbeddingModel,
  EMBEDDING_DIMENSIONS
} from '@action-atlas/types';

// Embedding is number[] with length 1536
type Embedding = number[];

// Model name
type EmbeddingModel = 'text-embedding-3-small';

// Dimension constant
const EMBEDDING_DIMENSIONS = 1536;
```

## MongoDB Atlas Vector Search Index

The vector search requires a specific index in MongoDB Atlas:

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

**Create via Atlas UI:**
1. Go to Atlas Search Indexes
2. Click "Create Search Index"
3. Select "JSON Editor"
4. Paste the configuration above
5. Apply to `activities` collection

## Troubleshooting

### "OPENAI_API_KEY environment variable is not set"

Set the environment variable:
```bash
export OPENAI_API_KEY=sk-proj-...
```

### "Vector search index not found"

Create the vector search index in MongoDB Atlas UI (see above).

### Slow search performance

- Increase `numCandidates` for better accuracy
- Decrease `numCandidates` for faster search
- Ensure vector search index is created
- Check embedding cache hit rate

### High OpenAI costs

- Verify cache is working (check logs)
- Use batch operations
- Don't re-embed unchanged content
- Monitor `tokensUsed` in responses

## Related Documentation

- [Database Package API](./database-package.md) - MongoDB operations
- [Type Definitions](../packages/types/README.md) - Shared types
- [Architecture](../architecture.md) - System design
- [ADR-002](../adr/002-vercel-ai-sdk-over-langchain.md) - Why Vercel AI SDK
