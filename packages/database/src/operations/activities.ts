import { ObjectId } from 'mongodb';
import type { Filter, FindOptions, UpdateFilter } from 'mongodb';

import type { Activity, ActivityDocument } from '@action-atlas/types';

import { activities } from '../collections';

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
