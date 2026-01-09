import type { Document } from 'mongodb';

import type { ActivityDocument, Embedding, SearchQuery } from '@action-atlas/types';

import { generateEmbedding } from './embedding';
import { InMemoryEmbeddingCache, createCacheKey } from './cache';

export interface VectorSearchOptions {
  query: string;
  limit?: number;
  numCandidates?: number;
  category?: string | string[];
  isActive?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    maxDistance?: number; // in meters
  };
}

export interface VectorSearchResult {
  document: ActivityDocument;
  relevanceScore: number;
  distance?: number; // in meters, if location filter applied
}

export interface VectorSearchResponse {
  results: VectorSearchResult[];
  total: number;
  executionTimeMs: number;
  metadata: {
    embeddingMs: number;
    vectorSearchMs: number;
    postProcessingMs: number;
  };
}

// Cache for embeddings
const embeddingCache = new InMemoryEmbeddingCache();
const EMBEDDING_CACHE_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Build MongoDB $vectorSearch aggregation pipeline
 */
export function buildVectorSearchPipeline(
  options: VectorSearchOptions & { queryVector: Embedding }
): Document[] {
  const {
    queryVector,
    limit = 20,
    numCandidates = 100,
    category,
    isActive = true,
    location,
  } = options;

  const pipeline: Document[] = [];

  // Vector search stage
  const vectorSearchStage: Document = {
    $vectorSearch: {
      index: 'activity_vector_search',
      path: 'embedding',
      queryVector,
      numCandidates,
      limit: location ? limit * 2 : limit, // Get more if we need to filter by location
    },
  };

  // Add filters if provided
  const filters: Document[] = [];

  if (isActive !== undefined) {
    filters.push({ isActive: { $eq: isActive } });
  }

  if (category) {
    if (Array.isArray(category)) {
      filters.push({ category: { $in: category } });
    } else {
      filters.push({ category: { $eq: category } });
    }
  }

  if (filters.length > 0) {
    vectorSearchStage['$vectorSearch'].filter = {
      $and: filters,
    };
  }

  pipeline.push(vectorSearchStage);

  // Add relevance score
  pipeline.push({
    $addFields: {
      relevanceScore: { $meta: 'vectorSearchScore' },
    },
  });

  // If location filter is provided, add geospatial filtering
  if (location) {
    const { latitude, longitude, maxDistance = 50000 } = location; // Default 50km

    pipeline.push({
      $addFields: {
        distance: {
          $round: [
            {
              $multiply: [
                {
                  $sqrt: {
                    $add: [
                      {
                        $pow: [
                          {
                            $subtract: [
                              { $arrayElemAt: ['$location.coordinates.coordinates', 0] },
                              longitude,
                            ],
                          },
                          2,
                        ],
                      },
                      {
                        $pow: [
                          {
                            $subtract: [
                              { $arrayElemAt: ['$location.coordinates.coordinates', 1] },
                              latitude,
                            ],
                          },
                          2,
                        ],
                      },
                    ],
                  },
                },
                111320, // Approximate meters per degree
              ],
            },
            0,
          ],
        },
      },
    });

    // Filter by max distance
    pipeline.push({
      $match: {
        distance: { $lte: maxDistance },
      },
    });

    // Calculate combined score (semantic + proximity)
    pipeline.push({
      $addFields: {
        proximityScore: {
          $subtract: [
            1,
            { $divide: ['$distance', maxDistance] },
          ],
        },
        finalScore: {
          $add: [
            { $multiply: ['$relevanceScore', 0.7] },
            {
              $multiply: [
                {
                  $subtract: [
                    1,
                    { $divide: ['$distance', maxDistance] },
                  ],
                },
                0.3,
              ],
            },
          ],
        },
      },
    });

    // Sort by combined score
    pipeline.push({
      $sort: { finalScore: -1 },
    });

    // Limit results
    pipeline.push({
      $limit: limit,
    });
  }

  return pipeline;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i]! * vecB[i]!;
    normA += vecA[i]! * vecA[i]!;
    normB += vecB[i]! * vecB[i]!;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Manual vector search using cosine similarity (fallback for local development)
 */
async function manualVectorSearch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collection: any,
  options: VectorSearchOptions & { queryVector: Embedding }
): Promise<ActivityDocument[]> {
  const {
    queryVector,
    limit = 20,
    category,
    isActive = true,
    location,
  } = options;

  // Build filter
  const filter: Document = {};

  // Only filter by isActive if it's explicitly set to false
  // (many legacy documents don't have this field, so we assume they're active)
  if (isActive === false) {
    filter['isActive'] = false;
  }

  if (category) {
    if (Array.isArray(category)) {
      filter['category'] = { $in: category };
    } else {
      filter['category'] = category;
    }
  }

  // Fetch all matching documents with embeddings
  const documents = await collection
    .find({ ...filter, embedding: { $exists: true, $ne: null } })
    .toArray();

  // Calculate similarity scores
  const scored = documents.map((doc: ActivityDocument) => {
    if (!doc.embedding) {
      throw new Error('Document missing embedding');
    }
    const similarity = cosineSimilarity(queryVector, doc.embedding);
    return {
      ...doc,
      relevanceScore: similarity,
    };
  });

  // Sort by relevance
  scored.sort((a: { relevanceScore: number }, b: { relevanceScore: number }) => b.relevanceScore - a.relevanceScore);

  // Apply location filtering if needed
  if (location) {
    const { latitude, longitude, maxDistance = 50000 } = location;

    const withDistance = scored.map((doc: ActivityDocument & { relevanceScore: number }) => {
      const docLng = doc.location?.coordinates?.coordinates?.[0] ?? 0;
      const docLat = doc.location?.coordinates?.coordinates?.[1] ?? 0;

      // Haversine approximation
      const distance = Math.sqrt(
        Math.pow(docLng - longitude, 2) + Math.pow(docLat - latitude, 2)
      ) * 111320; // meters per degree

      return {
        ...doc,
        distance,
        proximityScore: 1 - distance / maxDistance,
        finalScore: doc.relevanceScore * 0.7 + (1 - distance / maxDistance) * 0.3,
      };
    });

    // Filter by distance and re-sort
    const filtered = withDistance
      .filter((doc: { distance: number }) => doc.distance <= maxDistance)
      .sort((a: { finalScore: number }, b: { finalScore: number }) => b.finalScore - a.finalScore)
      .slice(0, limit);

    return filtered;
  }

  // Return top results
  return scored.slice(0, limit);
}

/**
 * Execute semantic search using MongoDB Vector Search
 *
 * @param collection - MongoDB collection with vector search index
 * @param options - Search options
 * @returns Search results with relevance scores
 */
export async function semanticSearch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collection: any, // MongoDB Collection<ActivityDocument> - using any to avoid circular dependency
  options: VectorSearchOptions
): Promise<VectorSearchResponse> {
  const startTime = Date.now();

  // 1. Generate query embedding
  const embeddingStart = Date.now();
  const cacheKey = createCacheKey(options.query);

  let queryVector: Embedding;
  const cachedEmbedding = await embeddingCache.get(cacheKey);

  if (cachedEmbedding) {
    queryVector = cachedEmbedding;
  } else {
    const { embedding } = await generateEmbedding(options.query);
    queryVector = embedding;
    await embeddingCache.set(cacheKey, queryVector, { ttl: EMBEDDING_CACHE_TTL });
  }

  const embeddingMs = Date.now() - embeddingStart;

  // 2. Execute vector search
  const vectorSearchStart = Date.now();
  let results: any[];

  try {
    // Try MongoDB Atlas $vectorSearch first
    const pipeline = buildVectorSearchPipeline({ ...options, queryVector });
    results = await collection.aggregate(pipeline).toArray();
  } catch (error) {
    // Fallback to manual vector search for local development
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('$vectorSearch') || errorMessage.includes('AtlasCLI')) {
      console.log('[Vector Search] Using manual cosine similarity (local development mode)');
      results = await manualVectorSearch(collection, { ...options, queryVector });
    } else {
      throw error;
    }
  }

  const vectorSearchMs = Date.now() - vectorSearchStart;

  // 3. Post-process results
  const postProcessingStart = Date.now();
  const searchResults: VectorSearchResult[] = results.map((doc: ActivityDocument & { relevanceScore: number; distance?: number; finalScore?: number }) => {
    const result: VectorSearchResult = {
      document: doc,
      relevanceScore: doc.finalScore ?? doc.relevanceScore,
    };
    if (doc.distance !== undefined) {
      result.distance = doc.distance;
    }
    return result;
  });
  const postProcessingMs = Date.now() - postProcessingStart;

  const executionTimeMs = Date.now() - startTime;

  return {
    results: searchResults,
    total: searchResults.length,
    executionTimeMs,
    metadata: {
      embeddingMs,
      vectorSearchMs,
      postProcessingMs,
    },
  };
}

/**
 * Helper to convert SearchQuery to VectorSearchOptions
 */
export function searchQueryToOptions(query: SearchQuery): VectorSearchOptions {
  const options: VectorSearchOptions = {
    query: query.query,
    limit: query.limit,
  };

  if (query.category) {
    options.category = query.category;
  }

  if (query.location) {
    const location: { latitude: number; longitude: number; maxDistance?: number } = {
      latitude: query.location.latitude,
      longitude: query.location.longitude,
    };

    if (query.location.radius !== undefined) {
      location.maxDistance = query.location.radius;
    }

    options.location = location;
  }

  return options;
}
