import { ObjectId } from 'mongodb';
import type { Filter, FindOptions, UpdateFilter } from 'mongodb';

import type { Organization, OrganizationDocument } from '@action-atlas/types';

import { organizations } from '../collections';

export interface FindOrganizationsOptions {
  filter?: Filter<OrganizationDocument>;
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

/**
 * Find organizations with optional filtering and pagination
 */
export async function findOrganizations(
  options: FindOrganizationsOptions = {}
): Promise<OrganizationDocument[]> {
  const { filter = {}, limit = 20, skip = 0, sort = { createdAt: -1 } } = options;

  const collection = organizations();
  const findOptions: FindOptions = {
    limit,
    skip,
    sort,
  };

  const cursor = collection.find(filter, findOptions);
  return await cursor.toArray();
}

/**
 * Find a single organization by ID
 */
export async function findOrganizationById(
  id: string
): Promise<OrganizationDocument | null> {
  const collection = organizations();

  // Try both MongoDB ObjectId and business organizationId
  let filter: Filter<OrganizationDocument>;

  if (ObjectId.isValid(id)) {
    filter = {
      $or: [
        { _id: new ObjectId(id) },
        { organizationId: id },
      ],
    };
  } else {
    filter = { organizationId: id };
  }

  return await collection.findOne(filter);
}

/**
 * Find organizations by status
 */
export async function findOrganizationsByStatus(
  status: string | string[],
  options: { limit?: number; skip?: number } = {}
): Promise<OrganizationDocument[]> {
  const { limit = 20, skip = 0 } = options;

  const collection = organizations();
  const filter: Filter<OrganizationDocument> = Array.isArray(status)
    ? { status: { $in: status as never[] } }
    : { status: status as never };

  const cursor = collection.find(filter, {
    limit,
    skip,
    sort: { createdAt: -1 },
  });

  return await cursor.toArray();
}

/**
 * Count organizations matching a filter
 */
export async function countOrganizations(
  filter: Filter<OrganizationDocument> = {}
): Promise<number> {
  const collection = organizations();
  return await collection.countDocuments(filter);
}

/**
 * Create a new organization
 */
export async function createOrganization(
  data: Omit<Organization, 'organizationId' | 'createdAt' | 'updatedAt'>
): Promise<OrganizationDocument> {
  const collection = organizations();

  const now = new Date();
  const organizationId = new ObjectId().toHexString();

  const organization = {
    organizationId,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await collection.insertOne(organization as any);

  const inserted = await collection.findOne({ _id: result.insertedId });
  if (!inserted) {
    throw new Error('Failed to retrieve created organization');
  }

  return inserted;
}

/**
 * Update an organization by ID
 */
export async function updateOrganization(
  id: string,
  data: Partial<Omit<Organization, 'organizationId' | 'createdAt' | 'updatedAt'>>
): Promise<OrganizationDocument | null> {
  const collection = organizations();

  let filter: Filter<OrganizationDocument>;
  if (ObjectId.isValid(id)) {
    filter = {
      $or: [
        { _id: new ObjectId(id) },
        { organizationId: id },
      ],
    };
  } else {
    filter = { organizationId: id };
  }

  const updateDoc: UpdateFilter<OrganizationDocument> = {
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
 * Update organization status
 */
export async function updateOrganizationStatus(
  id: string,
  status: 'pending' | 'verified' | 'rejected' | 'suspended'
): Promise<OrganizationDocument | null> {
  const collection = organizations();

  let filter: Filter<OrganizationDocument>;
  if (ObjectId.isValid(id)) {
    filter = {
      $or: [
        { _id: new ObjectId(id) },
        { organizationId: id },
      ],
    };
  } else {
    filter = { organizationId: id };
  }

  const updateDoc: UpdateFilter<OrganizationDocument> = {
    $set: {
      status,
      updatedAt: new Date(),
    },
  };

  const result = await collection.findOneAndUpdate(filter, updateDoc, {
    returnDocument: 'after',
  });

  return result;
}

/**
 * Delete an organization by ID
 */
export async function deleteOrganization(id: string): Promise<boolean> {
  const collection = organizations();

  let filter: Filter<OrganizationDocument>;
  if (ObjectId.isValid(id)) {
    filter = {
      $or: [
        { _id: new ObjectId(id) },
        { organizationId: id },
      ],
    };
  } else {
    filter = { organizationId: id };
  }

  const result = await collection.deleteOne(filter);
  return result.deletedCount > 0;
}

/**
 * Search organizations by name or description
 */
export async function searchOrganizations(
  query: string,
  options: { limit?: number; skip?: number } = {}
): Promise<OrganizationDocument[]> {
  const { limit = 20, skip = 0 } = options;

  const collection = organizations();

  // Use text search if available, otherwise use regex
  const filter: Filter<OrganizationDocument> = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ],
  };

  const cursor = collection.find(filter, {
    limit,
    skip,
    sort: { createdAt: -1 },
  });

  return await cursor.toArray();
}

/**
 * Bulk update organizations
 */
export async function bulkUpdateOrganizations(
  updates: Array<{
    id: string;
    data: Partial<Omit<Organization, 'organizationId' | 'createdAt' | 'updatedAt'>>;
  }>
): Promise<number> {
  const collection = organizations();

  const bulkOps = updates.map(({ id, data }) => {
    let filter: Filter<OrganizationDocument>;
    if (ObjectId.isValid(id)) {
      filter = {
        $or: [
          { _id: new ObjectId(id) },
          { organizationId: id },
        ],
      };
    } else {
      filter = { organizationId: id };
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
