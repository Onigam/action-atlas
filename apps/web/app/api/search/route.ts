import { semanticSearch, searchQueryToOptions } from '@action-atlas/ai';
import { activities, connectToDatabase } from '@action-atlas/database';
import { SearchQuery } from '@action-atlas/types';
import type { SearchResponse } from '@action-atlas/types';
import { NextResponse } from 'next/server';

import { handleApiError, validateRequest } from '@/lib/api-utils';

/**
 * POST /api/search - Semantic search for activities
 *
 * Performs vector-based semantic search using MongoDB Atlas Vector Search.
 *
 * Request body:
 * {
 *   query: string,           // Search query (min 1, max 500 chars)
 *   category?: string[],     // Filter by categories
 *   location?: {
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
 *     postProcessingMs?: number
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

    // Convert SearchQuery to VectorSearchOptions
    const searchOptions = searchQueryToOptions(searchQuery);

    // CRITICAL: Connect to database first
    await connectToDatabase();

    // Get activities collection
    const activitiesCollection = activities();

    // Execute semantic search
    const searchResult = await semanticSearch(activitiesCollection, searchOptions);

    // Transform results to match SearchResponse format
    const results = searchResult.results.map((result) => ({
      ...result.document,
      relevanceScore: result.relevanceScore,
      distance: result.distance,
    }));

    const executionTimeMs = Date.now() - startTime;

    // Build response
    const response: SearchResponse = {
      results,
      total: searchResult.total,
      executionTimeMs,
      metadata: {
        cached: false, // TODO: Implement Redis caching in future phase
        embeddingMs: searchResult.metadata.embeddingMs,
        vectorSearchMs: searchResult.metadata.vectorSearchMs,
        postProcessingMs: searchResult.metadata.postProcessingMs,
      },
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
