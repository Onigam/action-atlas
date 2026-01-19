#!/usr/bin/env tsx

/**
 * MongoDB Atlas Vector Index Management Script
 *
 * Manages vector search indexes on MongoDB Atlas.
 * Requires MongoDB Atlas Admin API credentials.
 *
 * Environment Variables Required:
 *   MONGODB_ATLAS_PUBLIC_KEY  - Atlas API public key
 *   MONGODB_ATLAS_PRIVATE_KEY - Atlas API private key
 *   MONGODB_ATLAS_PROJECT_ID  - Atlas project ID
 *   MONGODB_ATLAS_CLUSTER_NAME - Atlas cluster name
 *
 * Usage:
 *   pnpm manage-vector-index create     # Create the vector search index
 *   pnpm manage-vector-index status     # Check index status
 *   pnpm manage-vector-index delete     # Delete the vector search index
 *   pnpm manage-vector-index update     # Update the vector search index definition
 *   pnpm manage-vector-index --help     # Show help
 */

import path from 'path';

import chalk from 'chalk';
import { config } from 'dotenv';

// Load environment variables
const rootEnvPath = path.join(process.cwd(), '.env.local');
const webEnvPath = path.join(process.cwd(), 'apps', 'web', '.env.local');

config({ path: rootEnvPath });
if (!process.env['MONGODB_ATLAS_PUBLIC_KEY']) {
  config({ path: webEnvPath });
}

// Configuration
const ATLAS_BASE_URL = 'https://cloud.mongodb.com/api/atlas/v2';
const DATABASE_NAME = process.env['MONGODB_DATABASE'] || 'action-atlas';
const COLLECTION_NAME = 'activities';
const INDEX_NAME = 'activity_vector_search';

// Vector index definition based on ADR-001
const VECTOR_INDEX_DEFINITION = {
  name: INDEX_NAME,
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
};

interface AtlasConfig {
  publicKey: string;
  privateKey: string;
  projectId: string;
  clusterName: string;
}

function getAtlasConfig(): AtlasConfig {
  const publicKey = process.env['MONGODB_ATLAS_PUBLIC_KEY'];
  const privateKey = process.env['MONGODB_ATLAS_PRIVATE_KEY'];
  const projectId = process.env['MONGODB_ATLAS_PROJECT_ID'];
  const clusterName = process.env['MONGODB_ATLAS_CLUSTER_NAME'];

  if (!publicKey || !privateKey || !projectId || !clusterName) {
    console.error(chalk.red('Missing required Atlas API credentials.'));
    console.error(chalk.yellow('\nRequired environment variables:'));
    console.error(chalk.yellow('  MONGODB_ATLAS_PUBLIC_KEY  - Atlas API public key'));
    console.error(chalk.yellow('  MONGODB_ATLAS_PRIVATE_KEY - Atlas API private key'));
    console.error(chalk.yellow('  MONGODB_ATLAS_PROJECT_ID  - Atlas project ID'));
    console.error(chalk.yellow('  MONGODB_ATLAS_CLUSTER_NAME - Atlas cluster name'));
    console.error(chalk.dim('\nYou can create an API key in Atlas: Organization → Access Manager → API Keys'));
    process.exit(1);
  }

  return { publicKey, privateKey, projectId, clusterName };
}

function getAuthHeader(config: AtlasConfig): string {
  const credentials = Buffer.from(`${config.publicKey}:${config.privateKey}`).toString('base64');
  return `Basic ${credentials}`;
}

async function atlasRequest(
  method: string,
  endpoint: string,
  config: AtlasConfig,
  body?: object
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const url = `${ATLAS_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Authorization': getAuthHeader(config),
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.atlas.2023-02-01+json',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    throw new Error(`Atlas API request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function listVectorIndexes(config: AtlasConfig): Promise<unknown[]> {
  const endpoint = `/groups/${config.projectId}/clusters/${config.clusterName}/fts/indexes/${DATABASE_NAME}/${COLLECTION_NAME}`;
  const result = await atlasRequest('GET', endpoint, config);

  if (!result.ok) {
    if (result.status === 404) {
      return [];
    }
    throw new Error(`Failed to list indexes: ${JSON.stringify(result.data)}`);
  }

  return (result.data as unknown[]) || [];
}

async function getVectorIndex(config: AtlasConfig, indexName: string): Promise<unknown | null> {
  const indexes = await listVectorIndexes(config);
  return indexes.find((idx: unknown) => (idx as { name: string }).name === indexName) || null;
}

async function createVectorIndex(config: AtlasConfig): Promise<void> {
  console.log(chalk.blue('\nCreating vector search index...'));
  console.log(chalk.dim(`  Index name: ${INDEX_NAME}`));
  console.log(chalk.dim(`  Database: ${DATABASE_NAME}`));
  console.log(chalk.dim(`  Collection: ${COLLECTION_NAME}`));
  console.log(chalk.dim(`  Dimensions: 1536 (text-embedding-3-small)`));
  console.log(chalk.dim(`  Similarity: cosine`));
  console.log(chalk.dim(`  Filters: category, isActive`));

  // Check if index already exists
  const existing = await getVectorIndex(config, INDEX_NAME);
  if (existing) {
    console.log(chalk.yellow(`\n⚠️  Index "${INDEX_NAME}" already exists.`));
    console.log(chalk.dim('Use "update" command to modify the index definition.'));
    return;
  }

  const endpoint = `/groups/${config.projectId}/clusters/${config.clusterName}/fts/indexes`;

  const body = {
    collectionName: COLLECTION_NAME,
    database: DATABASE_NAME,
    ...VECTOR_INDEX_DEFINITION,
  };

  const result = await atlasRequest('POST', endpoint, config, body);

  if (!result.ok) {
    console.error(chalk.red('\n✗ Failed to create index'));
    console.error(chalk.red(JSON.stringify(result.data, null, 2)));
    process.exit(1);
  }

  console.log(chalk.green('\n✓ Vector search index created successfully!'));
  console.log(chalk.dim('\nNote: Index building may take a few minutes depending on collection size.'));
  console.log(chalk.dim('Use "status" command to check indexing progress.'));
}

async function deleteVectorIndex(config: AtlasConfig): Promise<void> {
  console.log(chalk.blue(`\nDeleting vector search index "${INDEX_NAME}"...`));

  // Find the index to get its ID
  const existing = await getVectorIndex(config, INDEX_NAME);
  if (!existing) {
    console.log(chalk.yellow(`\n⚠️  Index "${INDEX_NAME}" does not exist.`));
    return;
  }

  const indexId = (existing as { indexID?: string }).indexID;
  if (!indexId) {
    console.error(chalk.red('Could not determine index ID.'));
    process.exit(1);
  }

  const endpoint = `/groups/${config.projectId}/clusters/${config.clusterName}/fts/indexes/${indexId}`;
  const result = await atlasRequest('DELETE', endpoint, config);

  if (!result.ok && result.status !== 204) {
    console.error(chalk.red('\n✗ Failed to delete index'));
    console.error(chalk.red(JSON.stringify(result.data, null, 2)));
    process.exit(1);
  }

  console.log(chalk.green('\n✓ Vector search index deleted successfully!'));
}

async function updateVectorIndex(config: AtlasConfig): Promise<void> {
  console.log(chalk.blue(`\nUpdating vector search index "${INDEX_NAME}"...`));

  // Find the index to get its ID
  const existing = await getVectorIndex(config, INDEX_NAME);
  if (!existing) {
    console.log(chalk.yellow(`\n⚠️  Index "${INDEX_NAME}" does not exist.`));
    console.log(chalk.dim('Use "create" command to create the index first.'));
    return;
  }

  const indexId = (existing as { indexID?: string }).indexID;
  if (!indexId) {
    console.error(chalk.red('Could not determine index ID.'));
    process.exit(1);
  }

  const endpoint = `/groups/${config.projectId}/clusters/${config.clusterName}/fts/indexes/${indexId}`;

  const body = {
    collectionName: COLLECTION_NAME,
    database: DATABASE_NAME,
    ...VECTOR_INDEX_DEFINITION,
  };

  const result = await atlasRequest('PATCH', endpoint, config, body);

  if (!result.ok) {
    console.error(chalk.red('\n✗ Failed to update index'));
    console.error(chalk.red(JSON.stringify(result.data, null, 2)));
    process.exit(1);
  }

  console.log(chalk.green('\n✓ Vector search index update initiated!'));
  console.log(chalk.dim('\nNote: Index rebuilding may take a few minutes depending on collection size.'));
  console.log(chalk.dim('Use "status" command to check indexing progress.'));
}

async function showStatus(config: AtlasConfig): Promise<void> {
  console.log(chalk.blue('\nVector Search Index Status'));
  console.log(chalk.dim('━'.repeat(50)));

  const indexes = await listVectorIndexes(config);

  if (indexes.length === 0) {
    console.log(chalk.yellow('\nNo vector search indexes found.'));
    console.log(chalk.dim(`Database: ${DATABASE_NAME}`));
    console.log(chalk.dim(`Collection: ${COLLECTION_NAME}`));
    console.log(chalk.dim('\nUse "create" command to create the index.'));
    return;
  }

  for (const index of indexes) {
    const idx = index as {
      name: string;
      type: string;
      status: string;
      queryable: boolean;
      indexID?: string;
      definition?: {
        fields?: Array<{
          type: string;
          path: string;
          numDimensions?: number;
          similarity?: string;
        }>;
      };
    };

    console.log(chalk.cyan(`\nIndex: ${idx.name}`));
    console.log(chalk.dim(`  ID: ${idx.indexID || 'N/A'}`));
    console.log(chalk.dim(`  Type: ${idx.type}`));

    // Status with color coding
    const statusColor = idx.status === 'READY' ? chalk.green :
                        idx.status === 'BUILDING' ? chalk.yellow :
                        chalk.red;
    console.log(`  Status: ${statusColor(idx.status)}`);
    console.log(`  Queryable: ${idx.queryable ? chalk.green('Yes') : chalk.red('No')}`);

    if (idx.definition?.fields) {
      console.log(chalk.dim('  Fields:'));
      for (const field of idx.definition.fields) {
        if (field.type === 'vector') {
          console.log(chalk.dim(`    - ${field.path}: vector (${field.numDimensions}D, ${field.similarity})`));
        } else {
          console.log(chalk.dim(`    - ${field.path}: ${field.type}`));
        }
      }
    }
  }

  console.log();
}

function showHelp(): void {
  console.log(`
${chalk.bold('MongoDB Atlas Vector Index Management')}

${chalk.bold('Usage:')}
  pnpm manage-vector-index <command>

${chalk.bold('Commands:')}
  create    Create the vector search index
  status    Show current index status
  update    Update the vector search index definition
  delete    Delete the vector search index

${chalk.bold('Environment Variables:')}
  MONGODB_ATLAS_PUBLIC_KEY   Atlas API public key
  MONGODB_ATLAS_PRIVATE_KEY  Atlas API private key
  MONGODB_ATLAS_PROJECT_ID   Atlas project ID
  MONGODB_ATLAS_CLUSTER_NAME Atlas cluster name

${chalk.bold('Index Definition:')}
  Name:       ${INDEX_NAME}
  Database:   ${DATABASE_NAME}
  Collection: ${COLLECTION_NAME}
  Vector:     embedding (1536 dimensions, cosine similarity)
  Filters:    category, isActive

${chalk.bold('Getting Atlas API Credentials:')}
  1. Go to Atlas: Organization → Access Manager → API Keys
  2. Create a new API key with "Project Owner" role
  3. Whitelist your IP address
  4. Save the public and private keys

${chalk.bold('Finding Project ID and Cluster Name:')}
  - Project ID: Atlas → Project Settings → Project ID
  - Cluster Name: The name of your cluster in the Atlas UI

${chalk.bold('Examples:')}
  pnpm manage-vector-index create   # Create new index
  pnpm manage-vector-index status   # Check index status
  pnpm manage-vector-index update   # Update index definition
  pnpm manage-vector-index delete   # Remove index
`);
}

async function main(): Promise<void> {
  const command = process.argv[2];

  if (!command || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }

  console.log(chalk.bold.blue('\n=== MongoDB Atlas Vector Index Manager ==='));

  const config = getAtlasConfig();

  try {
    switch (command) {
      case 'create':
        await createVectorIndex(config);
        break;
      case 'status':
        await showStatus(config);
        break;
      case 'update':
        await updateVectorIndex(config);
        break;
      case 'delete':
        await deleteVectorIndex(config);
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
  }
}

// Run if called directly
main();
