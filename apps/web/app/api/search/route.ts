import {
  locationAwareSearch,
  searchQueryToLocationAwareOptions,
} from '@action-atlas/ai';
import { activities, connectToDatabase } from '@action-atlas/database';
import { SearchQuery } from '@action-atlas/types';
import type { SearchResponse } from '@action-atlas/types';
import { NextResponse } from 'next/server';

import { handleApiError, validateRequest } from '@/lib/api-utils';

/**
 * POST /api/search - Location-aware semantic search for activities
 *
 * Performs vector-based semantic search using MongoDB Atlas Vector Search.
 * Automatically detects location references in the query and applies
 * geo-proximity sorting when a location is found.
 *
 * Request body:
 * {
 *   query: string,           // Search query (min 1, max 500 chars)
 *   category?: string[],     // Filter by categories
 *   location?: {             // Optional explicit location (disables auto-detection)
 *     latitude: number,
 *     longitude: number,
 *     radius?: number        // in meters, default 50000 (50km)
 *   },
 *   limit?: number,          // Results per page (default 20, max 100)
 *   offset?: number          // Skip results (default 0)
 * }
 *
 * Response:
 * {
 *   results: Activity[],
 *   total: number,
 *   executionTimeMs: number,
 *   metadata: {
 *     cached: boolean,
 *     embeddingMs?: number,
 *     vectorSearchMs?: number,
 *     postProcessingMs?: number,
 *     locationAnalysisMs?: number,    // Time spent analyzing query for location
 *     geocodingMs?: number,           // Time spent geocoding detected address
 *     detectedLocation?: {            // Auto-detected location (if any)
 *       formattedAddress: string,
 *       coordinates: [lng, lat]
 *     }
 *   }
 * }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const startTime = Date.now();

    // Parse and validate request body
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json();
    const validatedQuery = validateRequest(SearchQuery, body);

    // Cast to SearchQuery type (Zod's default() ensures limit and offset are always numbers)
    const searchQuery = validatedQuery as SearchQuery;

    // Convert SearchQuery to LocationAwareSearchOptions
    const searchOptions = searchQueryToLocationAwareOptions(searchQuery);

    // CRITICAL: Connect to database first
    await connectToDatabase();

    // Get activities collection
    const activitiesCollection = activities();

    // Execute location-aware semantic search
    const searchResult = await locationAwareSearch(activitiesCollection, searchOptions);

    // Transform results to match SearchResponse format
    const results = searchResult.results.map((result) => {
      // Destructure _id separately to handle unknown type from MongoDB
      const { _id, ...rest } = result.document;
      return {
        ...rest,
        _id: typeof _id === 'string' ? _id : undefined,
        relevanceScore: result.relevanceScore,
        distance: result.distance,
      };
    });

    const executionTimeMs = Date.now() - startTime;

    // Build metadata object, only including optional fields if they have values
    const metadata: SearchResponse['metadata'] = {
      cached: false, // TODO: Implement Redis caching in future phase
      embeddingMs: searchResult.metadata.embeddingMs,
      vectorSearchMs: searchResult.metadata.vectorSearchMs,
      postProcessingMs: searchResult.metadata.postProcessingMs,
    };

    // Add optional location-related metadata only if present
    if (searchResult.metadata.locationAnalysisMs !== undefined) {
      metadata.locationAnalysisMs = searchResult.metadata.locationAnalysisMs;
    }
    if (searchResult.metadata.geocodingMs !== undefined) {
      metadata.geocodingMs = searchResult.metadata.geocodingMs;
    }
    if (searchResult.metadata.geoNearMs !== undefined) {
      metadata.geoNearMs = searchResult.metadata.geoNearMs;
    }
    if (searchResult.metadata.detectedLocation !== undefined) {
      metadata.detectedLocation = searchResult.metadata.detectedLocation;
    }

    // Build response with proper typing
    const response: SearchResponse = {
      results,
      total: searchResult.total,
      executionTimeMs,
      metadata,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Execution-Time': executionTimeMs.toString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/search - Not allowed
 * Search must be done via POST with a request body
 */
export function GET(): NextResponse {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'Use POST /api/search with a JSON body to perform searches',
      statusCode: 405,
    },
    { status: 405 }
  );
}
