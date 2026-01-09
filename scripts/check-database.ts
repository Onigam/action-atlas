#!/usr/bin/env tsx

/**
 * Database Status Check Script
 *
 * Checks database connection, counts documents, and verifies indexes.
 *
 * Usage:
 *   pnpm db:status           # Check database status
 *   pnpm db:status --verbose # Show detailed information
 *   pnpm db:status --help    # Show help
 */

import path from 'path';

import chalk from 'chalk';
import { config } from 'dotenv';

import {
  connectToDatabase,
  disconnectFromDatabase,
  getDatabase,
  getDatabaseStats,
  healthCheck,
} from '@action-atlas/database';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

interface CliArgs {
  verbose: boolean;
  help: boolean;
  json: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  return {
    verbose: args.includes('--verbose') || args.includes('-v'),
    json: args.includes('--json'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

function showHelp(): void {
  console.log(`
${chalk.bold('Database Status Check Script')}

${chalk.bold('Usage:')}
  pnpm db:status [options]

${chalk.bold('Options:')}
  --verbose, -v    Show detailed information
  --json           Output as JSON
  --help, -h       Show this help message

${chalk.bold('Description:')}
  Checks MongoDB connection, document counts, index status,
  and embedding coverage.

${chalk.bold('Examples:')}
  pnpm db:status       # Basic status check
  pnpm db:status -v    # Detailed information
  pnpm db:status --json # JSON output
  `);
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (!args.json) {
    console.log(chalk.bold.blue('\n=== Database Status Check ===\n'));
  }

  const status: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    connection: {},
    collections: {},
    indexes: {},
    embeddings: {},
    stats: {},
  };

  try {
    // Check connection
    if (!args.json) {
      console.log(chalk.blue('Checking connection...'));
    }

    await connectToDatabase();
    const health = await healthCheck();

    if (!health.connected) {
      status['connection'] = {
        status: 'disconnected',
        error: health.error,
      };

      if (args.json) {
        console.log(JSON.stringify(status, null, 2));
      } else {
        console.error(chalk.red('✗ Failed to connect to MongoDB'));
        console.error(chalk.yellow(health.error));
      }
      process.exit(1);
    }

    status['connection'] = {
      status: 'connected',
      uri: process.env['MONGODB_URI']?.replace(/:[^:]*@/, ':****@'), // Hide password
    };

    if (!args.json) {
      console.log(chalk.green('✓ Connected to MongoDB\n'));
    }

    const db = getDatabase();

    // Count documents
    if (!args.json) {
      console.log(chalk.blue('Counting documents...'));
    }

    const activityCount = await db.collection('activities').countDocuments();
    const organizationCount = await db.collection('organizations').countDocuments();
    const activitiesWithEmbeddings = await db
      .collection('activities')
      .countDocuments({ embedding: { $exists: true, $ne: [] } });

    status['collections'] = {
      activities: activityCount,
      organizations: organizationCount,
    };

    if (!args.json) {
      console.log(chalk.cyan(`  Activities: ${activityCount}`));
      console.log(chalk.cyan(`  Organizations: ${organizationCount}\n`));
    }

    // Check indexes
    if (!args.json) {
      console.log(chalk.blue('Checking indexes...'));
    }

    let activityIndexes: unknown[] = [];
    let organizationIndexes: unknown[] = [];

    try {
      activityIndexes = await db.collection('activities').indexes();
    } catch {
      // Collection doesn't exist yet
    }

    try {
      organizationIndexes = await db.collection('organizations').indexes();
    } catch {
      // Collection doesn't exist yet
    }

    status['indexes'] = {
      activities: activityIndexes.length,
      organizations: organizationIndexes.length,
      details: args.verbose
        ? {
            activities: activityIndexes.map((idx) => idx['name']),
            organizations: organizationIndexes.map((idx) => idx['name']),
          }
        : undefined,
    };

    if (!args.json) {
      console.log(chalk.cyan(`  Activity indexes: ${activityIndexes.length}`));
      console.log(
        chalk.cyan(`  Organization indexes: ${organizationIndexes.length}\n`)
      );

      if (args.verbose) {
        console.log(chalk.dim('Activity indexes:'));
        activityIndexes.forEach((idx) => {
          console.log(chalk.dim(`  - ${idx['name']}`));
        });
        console.log(chalk.dim('Organization indexes:'));
        organizationIndexes.forEach((idx) => {
          console.log(chalk.dim(`  - ${idx['name']}`));
        });
        console.log();
      }
    }

    // Check embeddings
    if (!args.json) {
      console.log(chalk.blue('Checking embeddings...'));
    }

    const embeddingCoverage =
      activityCount > 0
        ? ((activitiesWithEmbeddings / activityCount) * 100).toFixed(1)
        : '0';

    status['embeddings'] = {
      total: activityCount,
      withEmbeddings: activitiesWithEmbeddings,
      withoutEmbeddings: activityCount - activitiesWithEmbeddings,
      coverage: `${embeddingCoverage}%`,
    };

    if (!args.json) {
      console.log(chalk.cyan(`  Activities with embeddings: ${activitiesWithEmbeddings}`));
      console.log(
        chalk.cyan(
          `  Activities without embeddings: ${activityCount - activitiesWithEmbeddings}`
        )
      );
      console.log(chalk.cyan(`  Coverage: ${embeddingCoverage}%\n`));

      if (activitiesWithEmbeddings < activityCount) {
        console.log(
          chalk.yellow(
            `Run: pnpm generate-embeddings to generate missing embeddings`
          )
        );
        console.log();
      }
    }

    // Database stats
    if (args.verbose) {
      if (!args.json) {
        console.log(chalk.blue('Database statistics...'));
      }

      const stats = await getDatabaseStats();

      status['stats'] = {
        collections: stats.collections,
        dataSize: formatBytes(stats.dataSize),
        indexSize: formatBytes(stats.indexSize),
        storageSize: formatBytes(stats.storageSize),
      };

      if (!args.json) {
        console.log(chalk.cyan(`  Collections: ${stats.collections}`));
        console.log(chalk.cyan(`  Data size: ${formatBytes(stats.dataSize)}`));
        console.log(chalk.cyan(`  Index size: ${formatBytes(stats.indexSize)}`));
        console.log(
          chalk.cyan(`  Storage size: ${formatBytes(stats.storageSize)}\n`)
        );
      }
    }

    // Output
    if (args.json) {
      console.log(JSON.stringify(status, null, 2));
    } else {
      console.log(chalk.bold.green('✓ Database status check completed!\n'));

      // Show warnings
      if (activityCount === 0) {
        console.log(chalk.yellow('Warning: No activities in database'));
        console.log(chalk.yellow('Run: pnpm seed to load sample data\n'));
      }

      if (activityIndexes.length < 4) {
        console.log(chalk.yellow('Warning: Some indexes may be missing'));
        console.log(chalk.yellow('Run: pnpm create-indexes to create indexes\n'));
      }
    }
  } catch (error) {
    if (args.json) {
      status['error'] = error instanceof Error ? error.message : 'Unknown error';
      console.log(JSON.stringify(status, null, 2));
    } else {
      console.error(chalk.red('\n✗ Database status check failed'));
      if (error instanceof Error) {
        console.error(chalk.red(error.message));
        if (args.verbose && error.stack) {
          console.error(chalk.dim(error.stack));
        }
      }
    }
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
