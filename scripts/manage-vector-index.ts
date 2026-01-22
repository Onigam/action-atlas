#!/usr/bin/env tsx

/**
 * MongoDB Atlas Vector Index Management Script
 *
 * Manages vector search indexes on MongoDB Atlas using the MongoDB driver.
 * Uses the MONGODB_URI connection string from .env.local
 *
 * Usage:
 *   pnpm manage-vector-index create     # Create the vector search index
 *   pnpm manage-vector-index status     # Check index status
 *   pnpm manage-vector-index delete     # Delete the vector search index
 *   pnpm manage-vector-index recreate   # Delete and recreate the index
 *   pnpm manage-vector-index --help     # Show help
 */

import path from 'path';

import chalk from 'chalk';
import { config } from 'dotenv';

import {
  connectToDatabase,
  disconnectFromDatabase,
} from '@action-atlas/database';

// Load environment variables
const rootEnvPath = path.join(process.cwd(), '.env.local');
const webEnvPath = path.join(process.cwd(), 'apps', 'web', '.env.local');

config({ path: rootEnvPath });
if (!process.env['MONGODB_URI']) {
  config({ path: webEnvPath });
}

// Configuration
const COLLECTION_NAME = 'activities';
const INDEX_NAME = 'activity_vector_search';

// Vector index definition
const VECTOR_INDEX_DEFINITION = {
  name: INDEX_NAME,
  type: 'vectorSearch' as const,
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
      {
        type: 'filter',
        path: 'remote',
      },
    ],
  },
};

interface SearchIndex {
  id?: string;
  name: string;
  type: string;
  status?: string;
  queryable?: boolean;
  latestDefinition?: {
    fields?: Array<{
      type: string;
      path: string;
      numDimensions?: number;
      similarity?: string;
    }>;
  };
}

async function listSearchIndexes(): Promise<SearchIndex[]> {
  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);

  try {
    const indexes = await collection.listSearchIndexes().toArray();
    return indexes as SearchIndex[];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('ns does not exist') || errorMessage.includes('no such collection')) {
      return [];
    }
    throw error;
  }
}

async function getSearchIndex(indexName: string): Promise<SearchIndex | null> {
  const indexes = await listSearchIndexes();
  return indexes.find((idx) => idx.name === indexName) || null;
}

async function createVectorIndex(): Promise<void> {
  console.log(chalk.blue('\nCreating vector search index...'));
  console.log(chalk.dim(`  Index name: ${INDEX_NAME}`));
  console.log(chalk.dim(`  Collection: ${COLLECTION_NAME}`));
  console.log(chalk.dim(`  Dimensions: 1536 (text-embedding-3-small)`));
  console.log(chalk.dim(`  Similarity: cosine`));
  console.log(chalk.dim(`  Filters: category, isActive, remote`));

  // Check if index already exists
  const existing = await getSearchIndex(INDEX_NAME);
  if (existing) {
    console.log(chalk.yellow(`\n⚠️  Index "${INDEX_NAME}" already exists.`));
    console.log(chalk.dim('Use "recreate" command to delete and recreate the index.'));
    return;
  }

  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);

  try {
    await collection.createSearchIndex(VECTOR_INDEX_DEFINITION);
    console.log(chalk.green('\n✓ Vector search index created successfully!'));
    console.log(chalk.dim('\nNote: Index building may take a few minutes depending on collection size.'));
    console.log(chalk.dim('Use "status" command to check indexing progress.'));
  } catch (error) {
    console.error(chalk.red('\n✗ Failed to create index'));
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  }
}

async function deleteVectorIndex(): Promise<void> {
  console.log(chalk.blue(`\nDeleting vector search index "${INDEX_NAME}"...`));

  // Check if index exists
  const existing = await getSearchIndex(INDEX_NAME);
  if (!existing) {
    console.log(chalk.yellow(`\n⚠️  Index "${INDEX_NAME}" does not exist.`));
    return;
  }

  const db = await connectToDatabase();
  const collection = db.collection(COLLECTION_NAME);

  try {
    await collection.dropSearchIndex(INDEX_NAME);
    console.log(chalk.green('\n✓ Vector search index deleted successfully!'));
  } catch (error) {
    console.error(chalk.red('\n✗ Failed to delete index'));
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  }
}

async function recreateVectorIndex(): Promise<void> {
  console.log(chalk.blue('\nRecreating vector search index...'));

  // Delete if exists
  const existing = await getSearchIndex(INDEX_NAME);
  if (existing) {
    console.log(chalk.dim(`Deleting existing index "${INDEX_NAME}"...`));
    const db = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);

    try {
      await collection.dropSearchIndex(INDEX_NAME);
      console.log(chalk.dim('Index deleted. Waiting for deletion to complete...'));

      // Wait for index to be fully deleted
      let attempts = 0;
      const maxAttempts = 30;
      while (attempts < maxAttempts) {
        await sleep(2000);
        const stillExists = await getSearchIndex(INDEX_NAME);
        if (!stillExists) {
          break;
        }
        attempts++;
        process.stdout.write(chalk.dim('.'));
      }
      console.log();

      if (attempts >= maxAttempts) {
        console.log(chalk.yellow('\n⚠️  Index deletion is taking longer than expected.'));
        console.log(chalk.dim('Please wait a moment and try running "create" command manually.'));
        return;
      }
    } catch (error) {
      console.error(chalk.red('\n✗ Failed to delete existing index'));
      if (error instanceof Error) {
        console.error(chalk.red(error.message));
      }
      process.exit(1);
    }
  }

  // Create new index
  await createVectorIndex();
}

async function showStatus(): Promise<void> {
  console.log(chalk.blue('\nVector Search Index Status'));
  console.log(chalk.dim('━'.repeat(50)));

  const indexes = await listSearchIndexes();

  if (indexes.length === 0) {
    console.log(chalk.yellow('\nNo search indexes found.'));
    console.log(chalk.dim(`Collection: ${COLLECTION_NAME}`));
    console.log(chalk.dim('\nUse "create" command to create the index.'));
    return;
  }

  for (const idx of indexes) {
    console.log(chalk.cyan(`\nIndex: ${idx.name}`));
    if (idx.id) {
      console.log(chalk.dim(`  ID: ${idx.id}`));
    }
    console.log(chalk.dim(`  Type: ${idx.type}`));

    // Status with color coding
    if (idx.status) {
      const statusColor =
        idx.status === 'READY'
          ? chalk.green
          : idx.status === 'BUILDING' || idx.status === 'PENDING'
            ? chalk.yellow
            : chalk.red;
      console.log(`  Status: ${statusColor(idx.status)}`);
    }

    if (idx.queryable !== undefined) {
      console.log(`  Queryable: ${idx.queryable ? chalk.green('Yes') : chalk.red('No')}`);
    }

    if (idx.latestDefinition?.fields) {
      console.log(chalk.dim('  Fields:'));
      for (const field of idx.latestDefinition.fields) {
        if (field.type === 'vector') {
          console.log(
            chalk.dim(`    - ${field.path}: vector (${field.numDimensions}D, ${field.similarity})`)
          );
        } else {
          console.log(chalk.dim(`    - ${field.path}: ${field.type}`));
        }
      }
    }
  }

  console.log();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function showHelp(): void {
  console.log(`
${chalk.bold('MongoDB Atlas Vector Index Management')}

${chalk.bold('Usage:')}
  pnpm manage-vector-index <command>

${chalk.bold('Commands:')}
  create    Create the vector search index
  status    Show current index status
  delete    Delete the vector search index
  recreate  Delete and recreate the index (useful for updating definition)

${chalk.bold('Environment Variables:')}
  MONGODB_URI   MongoDB connection string (from .env.local)

${chalk.bold('Index Definition:')}
  Name:       ${INDEX_NAME}
  Collection: ${COLLECTION_NAME}
  Vector:     embedding (1536 dimensions, cosine similarity)
  Filters:    category, isActive, remote

${chalk.bold('Examples:')}
  pnpm manage-vector-index create    # Create new index
  pnpm manage-vector-index status    # Check index status
  pnpm manage-vector-index recreate  # Delete and recreate index
  pnpm manage-vector-index delete    # Remove index
`);
}

async function main(): Promise<void> {
  const command = process.argv[2];

  if (!command || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }

  console.log(chalk.bold.blue('\n=== MongoDB Atlas Vector Index Manager ==='));

  try {
    switch (command) {
      case 'create':
        await createVectorIndex();
        break;
      case 'status':
        await showStatus();
        break;
      case 'delete':
        await deleteVectorIndex();
        break;
      case 'recreate':
        await recreateVectorIndex();
        break;
      default:
        console.error(chalk.red(`Unknown command: ${command}`));
        console.log(chalk.dim('Use --help to see available commands.'));
        process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('\n✗ Error:'));
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    }
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
  }
}

// Run if called directly
main();
