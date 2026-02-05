import type { Collection, Db } from 'mongodb';

import type { ActivityDocument } from '@action-atlas/types';

export const ACTIVITIES_COLLECTION = 'activities';

export function getActivitiesCollection(
  db: Db
): Collection<ActivityDocument> {
  return db.collection<ActivityDocument>(ACTIVITIES_COLLECTION);
}

export const activityIndexes = [
  // Compound index for filtering
  {
    key: { category: 1, isActive: 1, 'location.coordinates': '2dsphere' },
    name: 'category_active_location',
  },
  // Text index for fallback keyword search
  {
    key: { title: 'text', description: 'text' },
    name: 'text_search',
  },
  // Index for organization queries
  {
    key: { organizationId: 1, isActive: 1 },
    name: 'organization_active',
  },
  // Index for created date sorting
  {
    key: { createdAt: -1 },
    name: 'created_date',
  },
  // Unique index for external source deduplication (upsert by provider + externalId)
  {
    key: { 'source.provider': 1, 'source.externalId': 1 },
    name: 'source_provider_externalId',
    unique: true,
    sparse: true, // Only index documents that have the source field
  },
] as const;
