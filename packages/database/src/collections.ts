import type { Collection } from 'mongodb';

import type { ActivityDocument, OrganizationDocument } from '@action-atlas/types';

import { getDatabase } from './client';
import { ACTIVITIES_COLLECTION } from './schemas/activity';
import { ORGANIZATIONS_COLLECTION } from './schemas/organization';

/**
 * Get typed activities collection
 */
export function activities(): Collection<ActivityDocument> {
  const db = getDatabase();
  return db.collection<ActivityDocument>(ACTIVITIES_COLLECTION);
}

/**
 * Get typed organizations collection
 */
export function organizations(): Collection<OrganizationDocument> {
  const db = getDatabase();
  return db.collection<OrganizationDocument>(ORGANIZATIONS_COLLECTION);
}
