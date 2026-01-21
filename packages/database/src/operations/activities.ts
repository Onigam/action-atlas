import { ObjectId } from 'mongodb';
import type { Filter, FindOptions, UpdateFilter } from 'mongodb';

import type { Activity, ActivityDocument } from '@action-atlas/types';

import { activities } from '../collections';
import { calculateHaversineDistance, isValidCoordinates } from '../utils/geo';

export interface FindActivitiesOptions {
  filter?: Filter<ActivityDocument>;
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

/**
 * Find activities with optional filtering and pagination
 */
export async function findActivities(
  options: FindActivitiesOptions = {}
): Promise<ActivityDocument[]> {
  const { filter = {}, limit = 20, skip = 0, sort = { createdAt: -1 } } = options;

  const collection = activities();
  const findOptions: FindOptions = {
    limit,
    skip,
    sort,
  };

  const cursor = collection.find(filter, findOptions);
  return await cursor.toArray();
}

/**
 * Find a single activity by ID
 */
export async function findActivityById(
  id: string
): Promise<ActivityDocument | null> {
  const collection = activities();

  // Try both MongoDB ObjectId and business activityId
  let filter: Filter<ActivityDocument>;

  if (ObjectId.isValid(id)) {
    filter = {
      $or: [
        { _id: new ObjectId(id) },
        { activityId: id },
      ],
    };
  } else {
    filter = { activityId: id };
  }

  return await collection.findOne(filter);
}

/**
 * Find activities by organization ID
 */
export async function findActivitiesByOrganization(
  organizationId: string,
  options: { limit?: number; skip?: number } = {}
): Promise<ActivityDocument[]> {
  const { limit = 20, skip = 0 } = options;

  const collection = activities();
  const cursor = collection.find(
    { organizationId, isActive: true },
    {
      limit,
      skip,
      sort: { createdAt: -1 },
    }
  );

  return await cursor.toArray();
}

/**
 * Find activities by category
 */
export async function findActivitiesByCategory(
  category: string | string[],
  options: { limit?: number; skip?: number } = {}
): Promise<ActivityDocument[]> {
  const { limit = 20, skip = 0 } = options;

  const collection = activities();
  const filter: Filter<ActivityDocument> = Array.isArray(category)
    ? { category: { $in: category as never[] }, isActive: true }
    : { category: category as never, isActive: true };

  const cursor = collection.find(filter, {
    limit,
    skip,
    sort: { createdAt: -1 },
  });

  return await cursor.toArray();
}

/**
 * Count activities matching a filter
 */
export async function countActivities(
  filter: Filter<ActivityDocument> = {}
): Promise<number> {
  const collection = activities();
  return await collection.countDocuments(filter);
}

/**
 * Create a new activity
 */
export async function createActivity(
  data: Omit<Activity, 'activityId' | 'createdAt' | 'updatedAt'>
): Promise<ActivityDocument> {
  const collection = activities();

  const now = new Date();
  const activityId = new ObjectId().toHexString();

  const activity = {
    activityId,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await collection.insertOne(activity as any);

  const inserted = await collection.findOne({ _id: result.insertedId });
  if (!inserted) {
    throw new Error('Failed to retrieve created activity');
  }

  return inserted;
}

/**
 * Update an activity by ID
 */
export async function updateActivity(
  id: string,
  data: Partial<Omit<Activity, 'activityId' | 'createdAt' | 'updatedAt'>>
): Promise<ActivityDocument | null> {
  const collection = activities();

  let filter: Filter<ActivityDocument>;
  if (ObjectId.isValid(id)) {
    filter = {
      $or: [
        { _id: new ObjectId(id) },
        { activityId: id },
      ],
    };
  } else {
    filter = { activityId: id };
  }

  const updateDoc: UpdateFilter<ActivityDocument> = {
    $set: {
      ...data,
      updatedAt: new Date(),
    },
  };

  const result = await collection.findOneAndUpdate(filter, updateDoc, {
    returnDocument: 'after',
  });

  return result;
}

/**
 * Update activity embedding
 */
export async function updateActivityEmbedding(
  id: string,
  embedding: number[]
): Promise<ActivityDocument | null> {
  const collection = activities();

  let filter: Filter<ActivityDocument>;
  if (ObjectId.isValid(id)) {
    filter = {
      $or: [
        { _id: new ObjectId(id) },
        { activityId: id },
      ],
    };
  } else {
    // If not a valid ObjectId, assume it's activityId
    filter = { activityId: id };
  }

  const updateDoc: UpdateFilter<ActivityDocument> = {
    $set: {
      embedding,
      embeddingModel: 'text-embedding-3-small',
      embeddingUpdatedAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const result = await collection.findOneAndUpdate(filter, updateDoc, {
    returnDocument: 'after',
  });

  return result;
}

/**
 * Delete an activity by ID (soft delete by setting isActive to false)
 */
export async function deleteActivity(
  id: string,
  hard: boolean = false
): Promise<boolean> {
  const collection = activities();

  let filter: Filter<ActivityDocument>;
  if (ObjectId.isValid(id)) {
    filter = {
      $or: [
        { _id: new ObjectId(id) },
        { activityId: id },
      ],
    };
  } else {
    filter = { activityId: id };
  }

  if (hard) {
    const result = await collection.deleteOne(filter);
    return result.deletedCount > 0;
  } else {
    // Soft delete
    const updateDoc: UpdateFilter<ActivityDocument> = {
      $set: {
        isActive: false,
        updatedAt: new Date(),
      },
    };

    const result = await collection.updateOne(filter, updateDoc);
    return result.modifiedCount > 0;
  }
}

/**
 * Find activities without embeddings
 */
export async function findActivitiesWithoutEmbeddings(
  limit: number = 100
): Promise<ActivityDocument[]> {
  const collection = activities();

  const cursor = collection.find(
    {
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } },
      ],
    },
    { limit }
  );

  return await cursor.toArray();
}

/**
 * Find activities with outdated embeddings
 */
export async function findActivitiesWithOutdatedEmbeddings(
  thresholdDate: Date,
  limit: number = 100
): Promise<ActivityDocument[]> {
  const collection = activities();

  const cursor = collection.find(
    {
      $or: [
        { embeddingUpdatedAt: { $lt: thresholdDate } },
        { embeddingUpdatedAt: { $exists: false } },
      ],
      updatedAt: { $gt: thresholdDate },
    },
    { limit }
  );

  return await cursor.toArray();
}

/**
 * Clear all embeddings from activities
 * Useful for recalculating embeddings from scratch
 */
export async function clearAllEmbeddings(): Promise<number> {
  const collection = activities();

  const result = await collection.updateMany(
    { embedding: { $exists: true } },
    {
      $unset: {
        embedding: '',
        embeddingModel: '',
        embeddingUpdatedAt: '',
      },
    }
  );

  return result.modifiedCount;
}

/**
 * Bulk update activities
 */
export async function bulkUpdateActivities(
  updates: Array<{
    id: string;
    data: Partial<Omit<Activity, 'activityId' | 'createdAt' | 'updatedAt'>>;
  }>
): Promise<number> {
  const collection = activities();

  const bulkOps = updates.map(({ id, data }) => {
    let filter: Filter<ActivityDocument>;
    if (ObjectId.isValid(id)) {
      filter = {
        $or: [
          { _id: new ObjectId(id) },
          { activityId: id },
        ],
      };
    } else {
      filter = { activityId: id };
    }

    return {
      updateOne: {
        filter,
        update: {
          $set: {
            ...data,
            updatedAt: new Date(),
          },
        },
      },
    };
  });

  const result = await collection.bulkWrite(bulkOps);
  return result.modifiedCount;
}

/**
 * GeoNear result with distance
 */
export interface ActivityWithDistance extends ActivityDocument {
  distance: number; // Distance in meters from the query point
}

/**
 * Find activities by IDs with geo-proximity sorting using MongoDB $geoNear
 *
 * This function takes a list of activity IDs (e.g., from semantic search)
 * and re-orders them by geographic proximity to a given point.
 *
 * @param activityIds - Array of activityId strings to filter
 * @param coordinates - [longitude, latitude] tuple (GeoJSON format)
 * @param maxDistance - Maximum distance in meters (default: 50km)
 * @returns Activities sorted by distance from the given coordinates
 */
export async function findActivitiesByIdsWithGeoNear(
  activityIds: string[],
  coordinates: [number, number],
  maxDistance: number = 50000
): Promise<ActivityWithDistance[]> {
  const collection = activities();

  // Build aggregation pipeline with $geoNear
  const pipeline = [
    {
      $geoNear: {
        near: {
          type: 'Point' as const,
          coordinates, // [longitude, latitude]
        },
        distanceField: 'distance',
        maxDistance, // in meters
        spherical: true,
        query: {
          activityId: { $in: activityIds },
          isActive: { $ne: false }, // Include documents without isActive field (legacy)
        },
      },
    },
    {
      $sort: { distance: 1 as const },
    },
  ];

  try {
    const results = await collection.aggregate<ActivityWithDistance>(pipeline).toArray();
    return results;
  } catch (error) {
    // If $geoNear fails (e.g., no 2dsphere index or local MongoDB), fall back to simple query
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('$geoNear') || errorMessage.includes('2dsphere')) {
      console.log('[GeoNear] Falling back to manual distance calculation (no 2dsphere index)');

      // Fetch activities by IDs
      const activitiesData = await collection
        .find({
          activityId: { $in: activityIds },
          isActive: { $ne: false },
        })
        .toArray();

      // Calculate distances manually and sort
      const [queryLng, queryLat] = coordinates;
      const withDistance = activitiesData
        .filter((activity) => {
          // Filter out activities without valid coordinates
          // Use first geolocation's coordinates
          const actLng = activity.geolocations?.[0]?.coordinates?.[0];
          const actLat = activity.geolocations?.[0]?.coordinates?.[1];
          return isValidCoordinates(actLat, actLng);
        })
        .map((activity) => {
          // Use first geolocation's coordinates
          const actLng = activity.geolocations![0]!.coordinates[0];
          const actLat = activity.geolocations![0]!.coordinates[1];

          // Use proper Haversine distance calculation
          const distance = calculateHaversineDistance(queryLat, queryLng, actLat, actLng);

          return {
            ...activity,
            distance,
          } as ActivityWithDistance;
        });

      // Filter by maxDistance and sort
      return withDistance
        .filter((a) => a.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance);
    }

    throw error;
  }
}

/**
 * Find activities by IDs without geo-proximity sorting
 *
 * @param activityIds - Array of activityId strings to filter
 * @returns Activities matching the given IDs
 */
export async function findActivitiesByIds(
  activityIds: string[]
): Promise<ActivityDocument[]> {
  const collection = activities();

  return collection
    .find({
      activityId: { $in: activityIds },
      isActive: { $ne: false },
    })
    .toArray();
}

/**
 * Activity with organization/charity info for embedding generation
 */
export interface ActivityWithOrganization extends ActivityDocument {
  organization?: {
    name?: string;
    description?: string;
    mission?: string;
  };
  // Legacy field from seed data
  charity?: string;
}

/**
 * Find activities without embeddings with their organization info
 * Uses MongoDB $lookup to join activities with charities/organizations collection
 *
 * @param limit - Maximum number of activities to return
 * @returns Activities with organization info for embedding generation
 */
export async function findActivitiesWithoutEmbeddingsWithOrganization(
  limit: number = 100
): Promise<ActivityWithOrganization[]> {
  const collection = activities();

  const pipeline = [
    // Match activities without embeddings
    {
      $match: {
        $or: [
          { embedding: { $exists: false } },
          { embedding: { $size: 0 } },
          { embedding: null },
        ],
      },
    },
    // Limit before lookup for efficiency
    { $limit: limit },
    // Lookup organization by organizationId or charity field
    {
      $lookup: {
        from: 'charities', // The organizations collection is named 'charities'
        let: {
          orgId: '$organizationId',
          orgIdStr: { $toString: '$organizationId' },
          charityName: '$charity',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  // Match charity._id with activity.organizationId (both as strings)
                  { $eq: [{ $toString: '$_id' }, '$$orgIdStr'] },
                  // Match charity._id with activity.organizationId (ObjectId comparison)
                  { $eq: ['$_id', '$$orgId'] },
                  // Fallback: match by organizationId field
                  { $eq: ['$organizationId', '$$orgId'] },
                  // Fallback: match by charity name (legacy)
                  { $eq: ['$name', '$$charityName'] },
                ],
              },
            },
          },
          // Only project fields needed for embedding
          {
            $project: {
              name: 1,
              description: 1,
              mission: 1,
            },
          },
        ],
        as: 'organizationData',
      },
    },
    // Unwind organization (optional - keep activity even without org)
    {
      $addFields: {
        organization: { $arrayElemAt: ['$organizationData', 0] },
      },
    },
    // Remove the temporary array field
    {
      $project: {
        organizationData: 0,
      },
    },
  ];

  const results = await collection
    .aggregate<ActivityWithOrganization>(pipeline)
    .toArray();

  return results;
}

/**
 * Find all activities with their organization info for embedding regeneration
 * Uses MongoDB $lookup to join activities with charities/organizations collection
 *
 * @param limit - Maximum number of activities to return
 * @param skip - Number of activities to skip (for pagination)
 * @returns Activities with organization info for embedding generation
 */
export async function findActivitiesWithOrganization(
  limit: number = 100,
  skip: number = 0
): Promise<ActivityWithOrganization[]> {
  const collection = activities();

  const pipeline = [
    // Skip and limit for pagination
    { $skip: skip },
    { $limit: limit },
    // Lookup organization by organizationId or charity field
    {
      $lookup: {
        from: 'charities',
        let: {
          orgId: '$organizationId',
          orgIdStr: { $toString: '$organizationId' },
          charityName: '$charity',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  // Match charity._id with activity.organizationId (both as strings)
                  { $eq: [{ $toString: '$_id' }, '$$orgIdStr'] },
                  // Match charity._id with activity.organizationId (ObjectId comparison)
                  { $eq: ['$_id', '$$orgId'] },
                  // Fallback: match by organizationId field
                  { $eq: ['$organizationId', '$$orgId'] },
                  // Fallback: match by cuid field
                  { $eq: ['$cuid', '$$orgId'] },
                  // Fallback: match by charity name (legacy)
                  { $eq: ['$name', '$$charityName'] },
                ],
              },
            },
          },
          {
            $project: {
              name: 1,
              description: 1,
              mission: 1,
            },
          },
        ],
        as: 'organizationData',
      },
    },
    {
      $addFields: {
        organization: { $arrayElemAt: ['$organizationData', 0] },
      },
    },
    {
      $project: {
        organizationData: 0,
      },
    },
  ];

  const results = await collection
    .aggregate<ActivityWithOrganization>(pipeline)
    .toArray();

  return results;
}
