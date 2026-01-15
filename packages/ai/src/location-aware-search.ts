import type { Document, Collection } from 'mongodb';

import type { ActivityDocument, Embedding, SearchQuery } from '@action-atlas/types';

import { generateEmbedding } from './embedding';
import { InMemoryEmbeddingCache, createCacheKey } from './cache';
import { analyzeLocationQuery, hasValidLocation } from './location-analyzer';
import { geocodeFirst, isGeocodingAvailable } from './geocoding';
import { calculateHaversineDistance, isValidCoordinates } from '@action-atlas/database';

export interface LocationAwareSearchOptions {
  query: string;
  limit?: number;
  numCandidates?: number;
  category?: string | string[];
  isActive?: boolean;
  /** If true, automatically extract location from query and use geoNear */
  autoDetectLocation?: boolean;
  /** Explicit location override (takes precedence over auto-detection) */
  location?: {
    latitude: number;
    longitude: number;
    maxDistance?: number;
  };
}

export interface LocationAwareSearchResult {
  document: ActivityDocument;
  relevanceScore: number;
  distance?: number;
}

export interface LocationAwareSearchResponse {
  results: LocationAwareSearchResult[];
  total: number;
  executionTimeMs: number;
  metadata: {
    embeddingMs: number;
    vectorSearchMs: number;
    postProcessingMs: number;
    locationAnalysisMs?: number;
    geocodingMs?: number;
    geoNearMs?: number;
    detectedLocation?: {
      formattedAddress: string;
      coordinates: [number, number];
    };
  };
}

// Cache for embeddings
const embeddingCache = new InMemoryEmbeddingCache();
const EMBEDDING_CACHE_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Build MongoDB $vectorSearch aggregation pipeline for initial semantic search
 */
function buildInitialVectorSearchPipeline(
  queryVector: Embedding,
  options: {
    numCandidates?: number;
    limit: number;
    category?: string | string[];
    isActive?: boolean;
  }
): Document[] {
  const { numCandidates = 100, limit, category, isActive = true } = options;

  const pipeline: Document[] = [];

  const vectorSearchStage: Document = {
    $vectorSearch: {
      index: 'activity_vector_search',
      path: 'embedding',
      queryVector,
      numCandidates,
      limit, // Get more candidates for geo-filtering
    },
  };

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

  pipeline.push({
    $addFields: {
      relevanceScore: { $meta: 'vectorSearchScore' },
    },
  });

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
 * Manual vector search fallback for local development
 */
async function manualVectorSearch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collection: any,
  queryVector: Embedding,
  options: {
    limit: number;
    category?: string | string[];
    isActive?: boolean;
  }
): Promise<Array<ActivityDocument & { relevanceScore: number }>> {
  const { limit, category, isActive = true } = options;

  const filter: Document = {};

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

  const documents = await collection
    .find({ ...filter, embedding: { $exists: true, $ne: null } })
    .limit(1000) // Limit to prevent OOM in local development fallback
    .toArray();

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

  scored.sort(
    (a: { relevanceScore: number }, b: { relevanceScore: number }) =>
      b.relevanceScore - a.relevanceScore
  );

  return scored.slice(0, limit);
}

/**
 * Apply geoNear sorting to a list of activities
 */
function applyGeoNearSorting(
  activities: Array<ActivityDocument & { relevanceScore: number }>,
  coordinates: [number, number],
  maxDistance: number,
  limit: number
): Array<ActivityDocument & { relevanceScore: number; distance: number; finalScore: number }> {
  const [queryLng, queryLat] = coordinates;

  const withDistance = activities
    .filter((activity) => {
      // Filter out activities without valid coordinates
      const actLng = activity.location?.coordinates?.coordinates?.[0];
      const actLat = activity.location?.coordinates?.coordinates?.[1];
      return isValidCoordinates(actLat, actLng);
    })
    .map((activity) => {
      const actLng = activity.location!.coordinates!.coordinates![0];
      const actLat = activity.location!.coordinates!.coordinates![1];

      // Use proper Haversine distance calculation
      const distance = calculateHaversineDistance(queryLat, queryLng, actLat, actLng);

      const proximityScore = Math.max(0, 1 - distance / maxDistance);
      const finalScore = activity.relevanceScore * 0.7 + proximityScore * 0.3;

      return {
        ...activity,
        distance,
        finalScore,
      };
    });

  return withDistance
    .filter((a) => a.distance <= maxDistance)
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit);
}

/**
 * Execute location-aware semantic search
 *
 * This function:
 * 1. Gets semantically similar activities using vector search
 * 2. If autoDetectLocation is true, analyzes the query for location references
 * 3. If a location is found (or explicitly provided), applies geo-proximity sorting
 *
 * @param collection - MongoDB collection with vector search index
 * @param options - Search options
 * @returns Search results with relevance scores and optional distances
 */
export async function locationAwareSearch(
  collection: Collection<ActivityDocument>,
  options: LocationAwareSearchOptions
): Promise<LocationAwareSearchResponse> {
  // Input validation
  if (!options.query || options.query.trim().length === 0) {
    throw new Error('Query cannot be empty');
  }
  if (options.query.length > 500) {
    throw new Error('Query exceeds maximum length of 500 characters');
  }
  if (options.limit && (options.limit <= 0 || options.limit > 100)) {
    throw new Error('Limit must be between 1 and 100');
  }
  if (options.numCandidates && (options.numCandidates <= 0 || options.numCandidates > 1000)) {
    throw new Error('numCandidates must be between 1 and 1000');
  }
  if (options.location) {
    const { latitude, longitude, maxDistance } = options.location;
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees');
    }
    if (maxDistance && (maxDistance <= 0 || maxDistance > 500000)) {
      throw new Error('maxDistance must be between 1 and 500,000 meters');
    }
  }

  const startTime = Date.now();
  const {
    query,
    limit = 20,
    numCandidates = 100,
    category,
    isActive = true,
    autoDetectLocation = true,
    location: explicitLocation,
  } = options;

  // Metadata tracking
  let locationAnalysisMs: number | undefined;
  let geocodingMs: number | undefined;
  let geoNearMs: number | undefined;
  let detectedLocation:
    | { formattedAddress: string; coordinates: [number, number] }
    | undefined;

  // 1. Generate query embedding
  const embeddingStart = Date.now();
  const cacheKey = createCacheKey(query);

  let queryVector: Embedding;
  const cachedEmbedding = await embeddingCache.get(cacheKey);

  if (cachedEmbedding) {
    queryVector = cachedEmbedding;
  } else {
    const { embedding } = await generateEmbedding(query);
    queryVector = embedding;
    await embeddingCache.set(cacheKey, queryVector, { ttl: EMBEDDING_CACHE_TTL });
  }

  const embeddingMs = Date.now() - embeddingStart;

  // 2. Determine location (explicit or auto-detected)
  let searchLocation: { latitude: number; longitude: number; maxDistance: number } | undefined;

  if (explicitLocation) {
    // Use explicit location if provided
    searchLocation = {
      latitude: explicitLocation.latitude,
      longitude: explicitLocation.longitude,
      maxDistance: explicitLocation.maxDistance ?? 50000,
    };
  } else if (autoDetectLocation && isGeocodingAvailable()) {
    // Auto-detect location from query
    const locationAnalysisStart = Date.now();
    const locationResult = await analyzeLocationQuery(query);
    locationAnalysisMs = Date.now() - locationAnalysisStart;

    if (hasValidLocation(locationResult)) {
      const geocodingStart = Date.now();
      try {
        const geocoded = await geocodeFirst({
          formattedAddress: locationResult.formattedAddress!,
          language: locationResult.language ?? 'en',
        });
        geocodingMs = Date.now() - geocodingStart;

        if (geocoded) {
          searchLocation = {
            latitude: geocoded.latitude,
            longitude: geocoded.longitude,
            maxDistance: 50000, // Default 50km for auto-detected locations
          };
          detectedLocation = {
            formattedAddress: geocoded.formattedAddress,
            coordinates: [geocoded.longitude, geocoded.latitude],
          };
        }
      } catch (geocodingError) {
        // Geocoding failed (API down, rate limits, network issues, etc.)
        // Log the error and gracefully fall back to pure semantic search
        geocodingMs = Date.now() - geocodingStart;
        const errorMessage = geocodingError instanceof Error
          ? geocodingError.message
          : String(geocodingError);
        console.warn(
          `[Location-Aware Search] Geocoding failed for "${locationResult.formattedAddress}", ` +
          `falling back to semantic search: ${errorMessage}`
        );
        // searchLocation remains undefined, so we'll proceed with pure semantic search
      }
    }
  }

  // 3. Execute vector search to get candidates
  const vectorSearchStart = Date.now();
  let semanticResults: Array<ActivityDocument & { relevanceScore: number }>;

  // Get more candidates if we're going to filter by location
  const candidateLimit = searchLocation ? Math.min(numCandidates, 100) : limit;

  // Build options objects, only including category if defined
  const pipelineOptions: {
    numCandidates: number;
    limit: number;
    category?: string | string[];
    isActive: boolean;
  } = {
    numCandidates,
    limit: candidateLimit,
    isActive,
  };
  if (category !== undefined) {
    pipelineOptions.category = category;
  }

  try {
    const pipeline = buildInitialVectorSearchPipeline(queryVector, pipelineOptions);
    semanticResults = (await collection.aggregate(pipeline).toArray()) as Array<ActivityDocument & { relevanceScore: number }>;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('$vectorSearch') || errorMessage.includes('AtlasCLI')) {
      console.log(
        '[Location-Aware Search] Using manual cosine similarity (local development mode)'
      );
      const manualOptions: {
        limit: number;
        category?: string | string[];
        isActive: boolean;
      } = {
        limit: candidateLimit,
        isActive,
      };
      if (category !== undefined) {
        manualOptions.category = category;
      }
      semanticResults = await manualVectorSearch(collection, queryVector, manualOptions);
    } else {
      throw error;
    }
  }

  const vectorSearchMs = Date.now() - vectorSearchStart;

  // 4. Apply geo-proximity sorting if location is available
  const postProcessingStart = Date.now();
  let finalResults: LocationAwareSearchResult[];

  if (searchLocation && semanticResults.length > 0) {
    const geoNearStart = Date.now();

    const geoSortedResults = applyGeoNearSorting(
      semanticResults,
      [searchLocation.longitude, searchLocation.latitude],
      searchLocation.maxDistance,
      limit
    );

    geoNearMs = Date.now() - geoNearStart;

    // If geo-sorting returned results, use them
    // Otherwise, fall back to semantic results (activities may not have location data)
    if (geoSortedResults.length > 0) {
      finalResults = geoSortedResults.map((doc) => ({
        document: doc as ActivityDocument,
        relevanceScore: doc.finalScore,
        distance: doc.distance,
      }));
    } else {
      // Fallback: no activities had valid coordinates within range
      // Return semantic results without location filtering
      console.warn(
        '[Location-Aware Search] No activities found with valid coordinates within range, ' +
        'falling back to semantic results'
      );
      finalResults = semanticResults.slice(0, limit).map((doc) => ({
        document: doc as ActivityDocument,
        relevanceScore: doc.relevanceScore,
      }));
    }
  } else {
    // No location filtering - return semantic results directly
    finalResults = semanticResults.slice(0, limit).map((doc) => ({
      document: doc as ActivityDocument,
      relevanceScore: doc.relevanceScore,
    }));
  }

  const postProcessingMs = Date.now() - postProcessingStart;
  const executionTimeMs = Date.now() - startTime;

  // Build metadata object, only including optional fields if they have values
  const metadata: LocationAwareSearchResponse['metadata'] = {
    embeddingMs,
    vectorSearchMs,
    postProcessingMs,
  };
  if (locationAnalysisMs !== undefined) {
    metadata.locationAnalysisMs = locationAnalysisMs;
  }
  if (geocodingMs !== undefined) {
    metadata.geocodingMs = geocodingMs;
  }
  if (geoNearMs !== undefined) {
    metadata.geoNearMs = geoNearMs;
  }
  if (detectedLocation !== undefined) {
    metadata.detectedLocation = detectedLocation;
  }

  return {
    results: finalResults,
    total: finalResults.length,
    executionTimeMs,
    metadata,
  };
}

/**
 * Helper to convert SearchQuery to LocationAwareSearchOptions
 */
export function searchQueryToLocationAwareOptions(
  query: SearchQuery
): LocationAwareSearchOptions {
  const options: LocationAwareSearchOptions = {
    query: query.query,
    limit: query.limit,
    autoDetectLocation: true, // Enable auto-detection by default
  };

  if (query.category) {
    options.category = query.category;
  }

  if (query.location) {
    // If explicit location is provided, use it (disables auto-detection)
    const locationOption: {
      latitude: number;
      longitude: number;
      maxDistance?: number;
    } = {
      latitude: query.location.latitude,
      longitude: query.location.longitude,
    };
    if (query.location.radius !== undefined) {
      locationOption.maxDistance = query.location.radius;
    }
    options.location = locationOption;
    options.autoDetectLocation = false;
  }

  return options;
}
