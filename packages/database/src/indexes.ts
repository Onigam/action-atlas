import type { Db } from 'mongodb';

import { ACTIVITIES_COLLECTION, activityIndexes } from './schemas/activity';
import { ORGANIZATIONS_COLLECTION, organizationIndexes } from './schemas/organization';

/**
 * Vector search index configuration for MongoDB Atlas
 * This must be created via the Atlas UI or Atlas CLI
 */
export const VECTOR_SEARCH_INDEX_NAME = 'activity_vector_search';

export const vectorSearchIndexDefinition = {
  name: VECTOR_SEARCH_INDEX_NAME,
  type: 'vectorSearch',
  definition: {
    fields: [
      {
        type: 'vector',
        path: 'embedding',
        numDimensions: 1536,
        similarity: 'cosine',
      },
      {
        type: 'filter',
        path: 'category',
      },
      {
        type: 'filter',
        path: 'isActive',
      },
    ],
  },
} as const;

/**
 * Create all MongoDB indexes for activities and organizations
 */
export async function createIndexes(db: Db): Promise<void> {
  const activitiesCollection = db.collection(ACTIVITIES_COLLECTION);
  const organizationsCollection = db.collection(ORGANIZATIONS_COLLECTION);

  // Create activity indexes
  console.log('Creating activity indexes...');
  for (const index of activityIndexes) {
    try {
      await activitiesCollection.createIndex(index.key, {
        name: index.name,
      });
      console.log(`✓ Created index: ${index.name}`);
    } catch (error) {
      console.error(`✗ Failed to create index ${index.name}:`, error);
    }
  }

  // Create organization indexes
  console.log('Creating organization indexes...');
  for (const index of organizationIndexes) {
    try {
      await organizationsCollection.createIndex(index.key, {
        name: index.name,
      });
      console.log(`✓ Created index: ${index.name}`);
    } catch (error) {
      console.error(`✗ Failed to create index ${index.name}:`, error);
    }
  }

  console.log('\nNote: Vector search index must be created via MongoDB Atlas UI');
  console.log('Index name:', VECTOR_SEARCH_INDEX_NAME);
  console.log('Configuration:', JSON.stringify(vectorSearchIndexDefinition, null, 2));
}

/**
 * Drop all indexes (useful for testing)
 */
export async function dropIndexes(db: Db): Promise<void> {
  const activitiesCollection = db.collection(ACTIVITIES_COLLECTION);
  const organizationsCollection = db.collection(ORGANIZATIONS_COLLECTION);

  await activitiesCollection.dropIndexes();
  await organizationsCollection.dropIndexes();
  console.log('All indexes dropped');
}

/**
 * List all indexes
 */
export async function listIndexes(db: Db): Promise<void> {
  const activitiesCollection = db.collection(ACTIVITIES_COLLECTION);
  const organizationsCollection = db.collection(ORGANIZATIONS_COLLECTION);

  console.log('\nActivity indexes:');
  const activityIndexList = await activitiesCollection.indexes();
  activityIndexList.forEach((idx) => {
    console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
  });

  console.log('\nOrganization indexes:');
  const orgIndexList = await organizationsCollection.indexes();
  orgIndexList.forEach((idx) => {
    console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
  });
}
