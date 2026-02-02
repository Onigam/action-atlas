import {
  generateEmbedding,
  prepareActivityForEmbedding,
} from '@action-atlas/ai';
import {
  connectToDatabase,
  countActivities,
  createActivity,
  findActivities,
} from '@action-atlas/database';
import { CreateActivityRequest } from '@action-atlas/types';
import { NextResponse } from 'next/server';

import {
  getPaginationParams,
  handleApiError,
  paginatedResponse,
  validateRequest,
} from '@/lib/api-utils';

/**
 * GET /api/activities - List all activities with pagination and filters
 *
 * Query parameters:
 * - page: number (default 1)
 * - pageSize: number (default 20, max 100)
 * - category: string (filter by category)
 * - organizationId: string (filter by organization)
 * - isActive: boolean (default true)
 *
 * Response:
 * {
 *   results: Activity[],
 *   total: number,
 *   page: number,
 *   pageSize: number,
 *   totalPages: number
 * }
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    // CRITICAL: Connect to database first
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const { page, pageSize, offset } = getPaginationParams(searchParams);

    // Build filter
    const filter: Record<string, unknown> = {};

    // Category filter - supports filtering by one or more categories
    // Activities match if they have ANY of the specified categories
    const category = searchParams.get('category');
    if (category) {
      const categories = category
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      if (categories.length === 1) {
        // Single category - match activities that include this category
        filter['category'] = categories[0];
      } else {
        // Multiple categories - match activities that include any of these
        filter['category'] = { $in: categories };
      }
    }

    // Organization filter
    const organizationId = searchParams.get('organizationId');
    if (organizationId) {
      filter['organizationId'] = organizationId;
    }

    // Active filter
    const isActive = searchParams.get('isActive');
    if (isActive !== null) {
      filter['isActive'] = isActive === 'true';
    } else {
      // Default to showing only active activities
      filter['isActive'] = true;
    }

    // Fetch activities
    const [rawResults, total] = await Promise.all([
      findActivities({
        filter,
        limit: pageSize,
        skip: offset,
        sort: { createdAt: -1 },
      }),
      countActivities(filter),
    ]);

    // Redact PII from results
    const results = rawResults.map((activity) => ({
      ...activity,
      contact: {
        ...activity.contact,
        name: 'Hidden',
        role: 'Hidden',
        email: 'hidden@example.com',
        phone: '0000000000',
      },
    }));

    return paginatedResponse(results, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/activities - Create a new activity
 *
 * Request body:
 * {
 *   title: string,
 *   description: string,
 *   organizationId: string,
 *   category: ActivityCategory[],
 *   skills: Array<{ name: string, level?: string }>,
 *   location: Location,
 *   timeCommitment: TimeCommitment,
 *   contact: Contact,
 *   website?: string
 * }
 *
 * Response:
 * {
 *   data: Activity
 * }
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // CRITICAL: Connect to database first
    await connectToDatabase();

    // Parse and validate request body
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json();
    const activityData = validateRequest(CreateActivityRequest, body);

    // Generate searchable text for embedding using the standard preparation function
    const searchableText = prepareActivityForEmbedding({
      title: activityData.title,
      description: activityData.description,
      skills: activityData.skills,
      category: activityData.category,
      geolocations: activityData.geolocations,
      language: activityData.language,
    });

    // Generate embedding for the activity
    const { embedding } = await generateEmbedding(searchableText);

    // Create activity with all fields including embedding
    const activity = await createActivity({
      ...activityData,
      status: 'PUBLISHED',
      embedding,
      embeddingModel: 'text-embedding-3-small',
      embeddingUpdatedAt: new Date(),
      isActive: true,
    });

    return NextResponse.json(
      {
        data: activity,
      },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
