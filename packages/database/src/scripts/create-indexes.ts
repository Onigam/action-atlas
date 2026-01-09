#!/usr/bin/env node
import {
  connectToDatabase,
  disconnectFromDatabase,
  getActivitiesCollection,
  getOrganizationsCollection,
  activityIndexes,
  organizationIndexes,
} from '../index';

async function createIndexes() {
  console.log('Creating database indexes...');
  const db = await connectToDatabase();

  // Create activity indexes
  const activities = getActivitiesCollection(db);
  console.log('Creating activity indexes...');
  for (const index of activityIndexes) {
    await activities.createIndex(index.key, { name: index.name });
    console.log(`  ✓ Created index: ${index.name}`);
  }

  // Create organization indexes
  const organizations = getOrganizationsCollection(db);
  console.log('Creating organization indexes...');
  for (const index of organizationIndexes) {
    await organizations.createIndex(index.key, { name: index.name });
    console.log(`  ✓ Created index: ${index.name}`);
  }

  console.log('All indexes created successfully');
  await disconnectFromDatabase();
}

createIndexes().catch((error) => {
  console.error('Error creating indexes:', error);
  process.exit(1);
});
