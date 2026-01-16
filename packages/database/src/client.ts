import { MongoClient, type Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  const uri = process.env['MONGODB_URI'];
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  // Debug: Log the URI being used (masking any credentials)
  console.log(
    '[Database] Connecting to MongoDB:',
    uri.replace(/:[^:]*@/, ':****@')
  );

  // Determine if connecting to MongoDB Atlas (uses mongodb+srv://)
  const isAtlas = uri.startsWith('mongodb+srv://');

  client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    // TLS is required for MongoDB Atlas connections
    // For Atlas (mongodb+srv://), TLS is enabled by default
    // These options help resolve SSL handshake issues in containerized environments
    ...(isAtlas && {
      tls: true,
      // Retry writes to handle transient network issues
      retryWrites: true,
      // Use majority write concern for consistency
      w: 'majority',
    }),
  });

  try {
    await client.connect();
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    throw error;
  }

  const dbName = new URL(uri).pathname.slice(1) || 'actionatlas';
  db = client.db(dbName);

  return db;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return db;
}

export function getClient(): MongoClient {
  if (!client) {
    throw new Error(
      'Database client not initialized. Call connectToDatabase() first.'
    );
  }
  return client;
}

/**
 * Check if database is connected and healthy
 */
export async function healthCheck(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    if (!client || !db) {
      return { connected: false, error: 'Not connected' };
    }

    // Ping the database
    await db.admin().ping();

    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  collections: number;
  dataSize: number;
  indexSize: number;
  storageSize: number;
}> {
  const database = getDatabase();
  const stats = await database.stats();

  return {
    collections: stats['collections'],
    dataSize: stats['dataSize'],
    indexSize: stats['indexSize'],
    storageSize: stats['storageSize'],
  };
}
