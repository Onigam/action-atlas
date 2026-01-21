import { generateEmbedding, prepareActivityForEmbedding } from '@action-atlas/ai';
import {
  connectToDatabase,
  deleteActivity,
  findActivityById,
  updateActivity,
} from '@action-atlas/database';
import { UpdateActivityRequest } from '@action-atlas/types';
import { NextResponse } from 'next/server';

import {
  handleApiError,
  NotFoundError,
  validateRequest,
} from '@/lib/api-utils';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/activities/:id - Get activity by ID
 *
 * Path parameters:
 * - id: string (MongoDB ObjectId or business activityId)
 *
 * Response:
 * {
 *   data: Activity
 * }
 */
export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    // CRITICAL: Connect to database first
    await connectToDatabase();

    const { id } = await context.params;

    const activity = await findActivityById(id);

    if (!activity) {
      throw new NotFoundError(`Activity with ID ${id} not found`);
    }

    return NextResponse.json(
      {
        data: activity,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/activities/:id - Update activity
 *
 * Path parameters:
 * - id: string (MongoDB ObjectId or business activityId)
 *
 * Request body: Partial<Activity>
 * {
 *   title?: string,
 *   description?: string,
 *   category?: string[],
 *   skills?: string[],
 *   geolocations?: Geolocation[],
 *   timeCommitment?: TimeCommitment,
 *   contact?: Contact,
 *   isActive?: boolean
 * }
 *
 * Response:
 * {
 *   data: Activity
 * }
 */
export async function PATCH(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    // CRITICAL: Connect to database first
    await connectToDatabase();

    const { id } = await context.params;

    // Parse and validate request body
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json();
    const updateData = validateRequest(UpdateActivityRequest, body);

    // Check if activity exists
    const existingActivity = await findActivityById(id);
    if (!existingActivity) {
      throw new NotFoundError(`Activity with ID ${id} not found`);
    }

    // Determine if content has changed (needs embedding update)
    const contentFields = ['title', 'description', 'skills', 'category', 'geolocations'];
    const contentChanged = contentFields.some((field) => field in updateData);

    if (contentChanged) {
      // Merge updated fields with existing activity for embedding preparation
      const activityForEmbedding = {
        title: updateData.title ?? existingActivity.title,
        description: updateData.description ?? existingActivity.description,
        skills: updateData.skills ?? existingActivity.skills,
        category: updateData.category ?? existingActivity.category,
        geolocations: updateData.geolocations ?? existingActivity.geolocations,
        language: existingActivity.language,
      };

      // Use the standard embedding preparation function
      const searchableText = prepareActivityForEmbedding(activityForEmbedding);

      // Generate new embedding
      const { embedding } = await generateEmbedding(searchableText);

      // Build update data without undefined fields for exactOptionalPropertyTypes
      const updateDataWithEmbedding: Record<string, unknown> = {
        embedding,
        embeddingModel: 'text-embedding-3-small',
        embeddingUpdatedAt: new Date(),
      };

      // Add only defined fields from updateData
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          updateDataWithEmbedding[key] = value;
        }
      });

      const updated = await updateActivity(id, updateDataWithEmbedding);

      if (!updated) {
        throw new NotFoundError(`Failed to update activity with ID ${id}`);
      }

      return NextResponse.json(
        {
          data: updated,
        },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      // No content change, just update metadata
      // Remove undefined fields for exactOptionalPropertyTypes
      const cleanUpdateData: Record<string, unknown> = {};
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanUpdateData[key] = value;
        }
      });

      const updated = await updateActivity(id, cleanUpdateData);

      if (!updated) {
        throw new NotFoundError(`Failed to update activity with ID ${id}`);
      }

      return NextResponse.json(
        {
          data: updated,
        },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/activities/:id - Delete activity (soft delete)
 *
 * Path parameters:
 * - id: string (MongoDB ObjectId or business activityId)
 *
 * Response:
 * {
 *   message: string,
 *   id: string
 * }
 */
export async function DELETE(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    // CRITICAL: Connect to database first
    await connectToDatabase();

    const { id } = await context.params;

    // Check if activity exists
    const existingActivity = await findActivityById(id);
    if (!existingActivity) {
      throw new NotFoundError(`Activity with ID ${id} not found`);
    }

    // Soft delete (set isActive to false)
    const deleted = await deleteActivity(id, false);

    if (!deleted) {
      throw new Error(`Failed to delete activity with ID ${id}`);
    }

    return NextResponse.json(
      {
        message: 'Activity deleted successfully',
        id,
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
