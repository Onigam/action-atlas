import {
  findActivitiesByOrganization,
  findOrganizationById,
  updateOrganization,
} from '@action-atlas/database';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  getPaginationParams,
  handleApiError,
  NotFoundError,
} from '@/lib/api-utils';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/organizations/:id - Get organization by ID with their activities
 *
 * Path parameters:
 * - id: string (MongoDB ObjectId or business organizationId)
 *
 * Query parameters:
 * - includeActivities: boolean (default true) - Include organization's activities
 * - page: number (default 1) - For activity pagination
 * - pageSize: number (default 20, max 100) - For activity pagination
 *
 * Response:
 * {
 *   data: {
 *     organization: Organization,
 *     activities?: Activity[]
 *   }
 * }
 */
export async function GET(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);

    // Get organization
    const organization = await findOrganizationById(id);

    if (!organization) {
      throw new NotFoundError(`Organization with ID ${id} not found`);
    }

    // Check if we should include activities
    const includeActivities = searchParams.get('includeActivities') !== 'false';

    if (!includeActivities) {
      return NextResponse.json(
        {
          data: {
            organization,
          },
        },
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Get pagination params for activities
    const { pageSize, offset } = getPaginationParams(searchParams);

    // Fetch organization's activities
    const activities = await findActivitiesByOrganization(organization.organizationId, {
      limit: pageSize,
      skip: offset,
    });

    return NextResponse.json(
      {
        data: {
          organization,
          activities,
        },
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
 * PATCH /api/organizations/:id - Update organization
 *
 * Path parameters:
 * - id: string (MongoDB ObjectId or business organizationId)
 *
 * Request body: Partial<Organization>
 * {
 *   name?: string,
 *   description?: string,
 *   email?: string,
 *   phone?: string,
 *   website?: string,
 *   address?: Address,
 *   status?: 'pending' | 'verified' | 'rejected' | 'suspended'
 * }
 *
 * Response:
 * {
 *   data: Organization
 * }
 */
export async function PATCH(
  request: Request,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    // Parse request body
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json();

    // Validate that at least one field is being updated
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Request body must contain at least one field to update',
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // Check if organization exists
    const existingOrganization = await findOrganizationById(id);
    if (!existingOrganization) {
      throw new NotFoundError(`Organization with ID ${id} not found`);
    }

    // Create schema for validation (partial Organization)
    const UpdateOrganizationSchema = z.object({
      name: z.string().min(2).max(200).optional(),
      description: z.string().max(2000).optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      website: z.string().url().optional(),
      address: z
        .object({
          street: z.string().optional(),
          city: z.string(),
          state: z.string().optional(),
          postalCode: z.string().optional(),
          country: z.string(),
        })
        .optional(),
      status: z.enum(['pending', 'verified', 'rejected', 'suspended']).optional(),
    });

    // Validate and transform update data
    const validatedData = UpdateOrganizationSchema.parse(body);

    // Remove undefined fields to avoid exactOptionalPropertyTypes issues
    const updateData: Record<string, unknown> = {};
    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    // Update organization
    const updated = await updateOrganization(id, updateData);

    if (!updated) {
      throw new NotFoundError(`Failed to update organization with ID ${id}`);
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
  } catch (error) {
    return handleApiError(error);
  }
}
