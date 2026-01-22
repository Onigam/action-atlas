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
  offset?: number;
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
  /** Fallback location used only when no location is detected from query */
  fallbackLocation?: {
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
 *
 * When returnAll is true, returns ALL scored activities (for geo-sorting).
 * Otherwise, returns top N by semantic similarity.
 */
async function manualVectorSearch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collection: any,
  queryVector: Embedding,
  options: {
    limit: number;
    category?: string | string[];
    isActive?: boolean;
    returnAll?: boolean;
  }
): Promise<Array<ActivityDocument & { relevanceScore: number }>> {
  const { limit, category, isActive = true, returnAll = false } = options;

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

  // When location search is active, return all results for geo-sorting
  // Otherwise, return only top N by semantic similarity
  return returnAll ? scored : scored.slice(0, limit);
}

/**
 * Apply geoNear sorting to a list of activities
 *
 * This function sorts activities by a combination of semantic relevance and proximity.
 * Activities WITH coordinates get a proximity boost based on distance.
 * Activities WITHOUT coordinates are included but ranked by relevance only (no proximity boost).
 * No activities are filtered out - this is a SORT, not a filter.
 */
function applyGeoNearSorting(
  activities: Array<ActivityDocument & { relevanceScore: number }>,
  coordinates: [number, number],
  maxDistance: number,
  limit: number
): Array<ActivityDocument & { relevanceScore: number; distance?: number; finalScore: number }> {
  const [queryLng, queryLat] = coordinates;

  const withScores = activities.map((activity) => {
    // Activities can have multiple geolocations - find the closest one
    // Format: geolocations[].coordinates = [longitude, latitude]
    const geolocations = (activity as Record<string, unknown>)['geolocations'] as Array<{ coordinates?: [number, number] }> | undefined;

    // Calculate distance to each valid geolocation and find the minimum
    let minDistance: number | undefined;

    if (geolocations && geolocations.length > 0) {
      for (const geo of geolocations) {
        const geoLng = geo.coordinates?.[0];
        const geoLat = geo.coordinates?.[1];

        if (isValidCoordinates(geoLat, geoLng)) {
          const distance = calculateHaversineDistance(queryLat, queryLng, geoLat!, geoLng!);
          if (minDistance === undefined || distance < minDistance) {
            minDistance = distance;
          }
        }
      }
    }

    if (minDistance !== undefined) {
      // Activity has at least one valid geolocation - use closest distance
      const proximityScore = Math.max(0, 1 - minDistance / maxDistance);
      const finalScore = activity.relevanceScore * 0.7 + proximityScore * 0.3;

      return {
        ...activity,
        distance: minDistance,
        finalScore,
      };
    } else {
      // Activity has no valid coordinates - use relevance only (no proximity boost)
      // These will naturally rank lower than nearby activities with same relevance
      return {
        ...activity,
        finalScore: activity.relevanceScore * 0.7, // No proximity boost (0.3 * 0)
      };
    }
  });

  return withScores
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit) as Array<ActivityDocument & { relevanceScore: number; distance?: number; finalScore: number }>;
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
  if (options.offset && options.offset < 0) {
    throw new Error('Offset must be non-negative');
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
    offset = 0,
    numCandidates = 100,
    category,
    isActive = true,
    autoDetectLocation = true,
    location: explicitLocation,
    fallbackLocation,
  } = options;

  // Metadata tracking
  let locationAnalysisMs: number | undefined;
  let geocodingMs: number | undefined;
  let geoNearMs: number | undefined;
  let detectedLocation:
    | { formattedAddress: string; coordinates: [number, number] }
    | undefined;

  // Track which location mode is being used
  let locationMode: 'explicit' | 'auto-detected' | 'fallback' | 'none' = 'none';

  console.log(`[Location-Aware Search] Starting search for query: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);

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
    locationMode = 'explicit';
    console.log(`[Location-Aware Search] Using EXPLICIT location: lat=${explicitLocation.latitude}, lng=${explicitLocation.longitude}, maxDistance=${searchLocation.maxDistance}m`);
  } else if (!autoDetectLocation) {
    console.log(`[Location-Aware Search] Auto-detection disabled by configuration`);
  } else if (!isGeocodingAvailable()) {
    console.log(`[Location-Aware Search] Auto-detection skipped: GOOGLE_MAPS_API_KEY not configured`);
  }

  if (!explicitLocation && autoDetectLocation && isGeocodingAvailable()) {
    // Auto-detect location from query
    const locationAnalysisStart = Date.now();
    console.log(`[Location-Aware Search] Auto-detection enabled, analyzing query for location...`);
    const locationResult = await analyzeLocationQuery(query);
    locationAnalysisMs = Date.now() - locationAnalysisStart;

    if (hasValidLocation(locationResult)) {
      console.log(`[Location-Aware Search] Location detected from query: "${locationResult.formattedAddress}" (language: ${locationResult.language})`);
    } else {
      console.log(`[Location-Aware Search] No location detected in query`);
    }

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
            maxDistance: 100000, // Default 100km for auto-detected locations
          };
          detectedLocation = {
            formattedAddress: geocoded.formattedAddress,
            coordinates: [geocoded.longitude, geocoded.latitude],
          };
          locationMode = 'auto-detected';
          console.log(`[Location-Aware Search] Geocoding successful: "${geocoded.formattedAddress}" -> lat=${geocoded.latitude}, lng=${geocoded.longitude}`);
        } else {
          console.log(`[Location-Aware Search] Geocoding returned no results for "${locationResult.formattedAddress}"`);
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

  // 2b. Use fallback location if no location was detected from query
  if (!searchLocation && fallbackLocation) {
    searchLocation = {
      latitude: fallbackLocation.latitude,
      longitude: fallbackLocation.longitude,
      maxDistance: fallbackLocation.maxDistance ?? 50000,
    };
    locationMode = 'fallback';
    console.log(`[Location-Aware Search] Using FALLBACK location: lat=${fallbackLocation.latitude}, lng=${fallbackLocation.longitude}, maxDistance=${searchLocation.maxDistance}m`);
  }

  // Log final location mode decision
  if (locationMode === 'none') {
    console.log(`[Location-Aware Search] Mode: SEMANTIC ONLY (no location filtering)`);
  } else {
    console.log(`[Location-Aware Search] Mode: LOCATION-AWARE (${locationMode}) - will apply geo-proximity sorting`);
  }

  // 3. Execute vector search to get candidates
  const vectorSearchStart = Date.now();
  let semanticResults: Array<ActivityDocument & { relevanceScore: number }>;

  // Fetch a larger pool of results (200) to support pagination
  // When location is detected, get even more candidates to include nearby activities
  const poolSize = 200;
  const candidateLimit = searchLocation ? Math.max(numCandidates, 500) : poolSize;

  // MongoDB requires numCandidates >= limit for $vectorSearch
  const effectiveNumCandidates = Math.max(numCandidates, candidateLimit);

  // Build options objects, only including category if defined
  const pipelineOptions: {
    numCandidates: number;
    limit: number;
    category?: string | string[];
    isActive: boolean;
  } = {
    numCandidates: effectiveNumCandidates,
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
        returnAll?: boolean;
      } = {
        limit: candidateLimit,
        isActive,
        // When location is detected, return ALL results so geo-sorting
        // can properly rank nearby activities regardless of semantic score
        returnAll: !!searchLocation,
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
  let allResults: LocationAwareSearchResult[];

  if (searchLocation && semanticResults.length > 0) {
    const geoNearStart = Date.now();
    console.log(`[Location-Aware Search] Applying geo-proximity sorting to ${semanticResults.length} results...`);

    // Get all results sorted by geo-proximity (don't limit yet for pagination)
    const geoSortedResults = applyGeoNearSorting(
      semanticResults,
      [searchLocation.longitude, searchLocation.latitude],
      searchLocation.maxDistance,
      poolSize // Get full pool, we'll paginate later
    );

    geoNearMs = Date.now() - geoNearStart;

    // Count how many results have valid distances
    const resultsWithDistance = geoSortedResults.filter(r => r.distance !== undefined).length;
    console.log(`[Location-Aware Search] Geo-sorting complete: ${resultsWithDistance}/${geoSortedResults.length} results have valid coordinates`);

    allResults = geoSortedResults.map((doc) => {
      const result: LocationAwareSearchResult = {
        document: doc as ActivityDocument,
        relevanceScore: doc.finalScore,
      };
      if (doc.distance !== undefined) {
        result.distance = doc.distance;
      }
      return result;
    });
  } else {
    // No location filtering - return semantic results directly
    console.log(`[Location-Aware Search] Returning ${semanticResults.length} results (semantic only, no geo-sorting)`);
    allResults = semanticResults.map((doc) => ({
      document: doc as ActivityDocument,
      relevanceScore: doc.relevanceScore,
    }));
  }

  // Apply pagination (offset/limit)
  const totalResults = allResults.length;
  const paginatedResults = allResults.slice(offset, offset + limit);

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

  // Final summary log
  console.log(
    `[Location-Aware Search] Search complete: ` +
    `mode=${locationMode}, ` +
    `results=${paginatedResults.length}/${totalResults} (offset=${offset}, limit=${limit}), ` +
    `time=${executionTimeMs}ms ` +
    `(embedding=${embeddingMs}ms, vectorSearch=${vectorSearchMs}ms` +
    `${locationAnalysisMs !== undefined ? `, locationAnalysis=${locationAnalysisMs}ms` : ''}` +
    `${geocodingMs !== undefined ? `, geocoding=${geocodingMs}ms` : ''}` +
    `${geoNearMs !== undefined ? `, geoNear=${geoNearMs}ms` : ''})`
  );

  return {
    results: paginatedResults,
    total: totalResults,
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
    offset: query.offset,
    autoDetectLocation: true, // Enable auto-detection by default
  };

  if (query.category) {
    options.category = query.category;
  }

  if (query.location) {
    // Use location as fallback (will only be used if no location detected in query)
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
    options.fallbackLocation = locationOption;
    // Keep autoDetectLocation = true so query location detection runs first
  }

  return options;
}
