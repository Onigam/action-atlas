#!/usr/bin/env node
import { connectToDatabase, disconnectFromDatabase } from '../client';

async function seed() {
  console.log('Seeding database...');
  const db = await connectToDatabase();

  // TODO: Implement seeding logic
  console.log('Database:', db.databaseName);
  console.log('Seeding not yet implemented');

  await disconnectFromDatabase();
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
