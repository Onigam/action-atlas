import type { Collection, Db } from 'mongodb';

import type { OrganizationDocument } from '@action-atlas/types';

// Note: Seed data uses 'charities' collection name
export const ORGANIZATIONS_COLLECTION = 'charities';

export function getOrganizationsCollection(
  db: Db
): Collection<OrganizationDocument> {
  return db.collection<OrganizationDocument>(ORGANIZATIONS_COLLECTION);
}

export const organizationIndexes = [
  // Index for status queries
  {
    key: { status: 1 },
    name: 'status',
  },
  // Text index for search
  {
    key: { name: 'text', description: 'text' },
    name: 'text_search',
  },
] as const;
