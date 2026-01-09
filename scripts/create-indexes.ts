#!/usr/bin/env tsx

/**
 * MongoDB Index Creation Script
 *
 * Creates all required MongoDB indexes including vector search indexes.
 *
 * Usage:
 *   pnpm create-indexes           # Create all indexes
 *   pnpm create-indexes --drop    # Drop indexes first, then recreate
 *   pnpm create-indexes --verbose # Show detailed output
 *   pnpm create-indexes --help    # Show help
 */

import path from 'path';

import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { config } from 'dotenv';

import {
  connectToDatabase,
  createIndexes,
  disconnectFromDatabase,
  dropIndexes,
  getDatabase,
  listIndexes,
  VECTOR_SEARCH_INDEX_NAME,
  vectorSearchIndexDefinition,
} from '@action-atlas/database';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

interface CliArgs {
  drop: boolean;
  verbose: boolean;
  help: boolean;
  skipVector: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  return {
    drop: args.includes('--drop') || args.includes('-d'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h'),
    skipVector: args.includes('--skip-vector'),
  };
}

function showHelp(): void {
  console.log(`
${chalk.bold('MongoDB Index Creation Script')}

${chalk.bold('Usage:')}
  pnpm create-indexes [options]

${chalk.bold('Options:')}
  --drop, -d       Drop all existing indexes before creating new ones
  --skip-vector    Skip vector search index creation (must be done via Atlas UI)
  --verbose, -v    Show detailed output
  --help, -h       Show this help message

${chalk.bold('Description:')}
  Creates all required MongoDB indexes for activities and organizations.

  ${chalk.yellow('Note:')} Vector search index must be created via MongoDB Atlas UI
  or using the Atlas CLI. This script will show the configuration needed.

${chalk.bold('Indexes Created:')}
  Activities:
    - category_active_location  (compound + geospatial)
    - text_search               (text index for fallback)
    - organization_active       (filter by organization)
    - created_date              (sort by creation date)
    - activity_vector_search    (vector search - Atlas only)

  Organizations:
    - organization_id           (unique identifier)
    - location_coordinates      (geospatial)

${chalk.bold('Examples:')}
  pnpm create-indexes          # Create all indexes
  pnpm create-indexes --drop   # Recreate all indexes
  pnpm create-indexes -v       # Show detailed output
  `);
}

async function createVectorSearchIndex(verbose: boolean): Promise<void> {
  console.log(chalk.blue('Attempting to create vector search index...'));

  const db = getDatabase();

  try {
    // Try to create search index (works on MongoDB Atlas)
    // @ts-expect-error - createSearchIndex is Atlas-specific
    await db.collection('activities').createSearchIndex(
      {
        name: VECTOR_SEARCH_INDEX_NAME,
        type: 'vectorSearch',
        definition: vectorSearchIndexDefinition.definition,
      }
    );

    console.log(chalk.green(`✓ Created vector search index: ${VECTOR_SEARCH_INDEX_NAME}`));
  } catch (error) {
    // Local MongoDB doesn't support createSearchIndex
    console.log(chalk.yellow('Note: Vector search index cannot be created locally'));
    console.log(chalk.cyan('\nFor MongoDB Atlas, create the index with this configuration:'));
    console.log(chalk.dim('----------------------------------------------------------'));
    console.log(JSON.stringify(vectorSearchIndexDefinition, null, 2));
    console.log(chalk.dim('----------------------------------------------------------'));
    console.log(
      chalk.cyan('\nVia Atlas UI: Database > Browse Collections > Search Indexes > Create Index')
    );
    console.log(
      chalk.cyan('Via Atlas CLI: atlas clusters search indexes create --clusterName <name>')
    );

    if (verbose && error instanceof Error) {
      console.log(chalk.dim(`\nError details: ${error.message}`));
    }
  }
}

async function verifyIndexes(verbose: boolean): Promise<void> {
  console.log(chalk.blue('\nVerifying indexes...'));

  const db = getDatabase();
  const activitiesCollection = db.collection('activities');
  const organizationsCollection = db.collection('organizations');

  const activityIndexes = await activitiesCollection.indexes();
  const organizationIndexes = await organizationsCollection.indexes();

  console.log(chalk.green('✓ Index verification complete'));
  console.log(chalk.cyan(`  Activity indexes: ${activityIndexes.length}`));
  console.log(chalk.cyan(`  Organization indexes: ${organizationIndexes.length}`));

  if (verbose) {
    console.log(chalk.dim('\nActivity indexes:'));
    activityIndexes.forEach((idx) => {
      console.log(chalk.dim(`  - ${idx['name']}: ${JSON.stringify(idx['key'])}`));
    });

    console.log(chalk.dim('\nOrganization indexes:'));
    organizationIndexes.forEach((idx) => {
      console.log(chalk.dim(`  - ${idx['name']}: ${JSON.stringify(idx['key'])}`));
    });
  }
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  console.log(chalk.bold.blue('\n=== Index Creation ===\n'));

  if (args.verbose) {
    console.log(chalk.dim(`MongoDB URI: ${process.env['MONGODB_URI']}\n`));
  }

  const progressBar = new cliProgress.SingleBar(
    {
      format: 'Progress |{bar}| {percentage}% | {step}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );

  try {
    // Connect to database
    progressBar.start(100, 0, { step: 'Connecting to MongoDB...' });
    await connectToDatabase();
    progressBar.update(20, { step: 'Connected to MongoDB' });

    if (args.drop) {
      progressBar.update(25, { step: 'Dropping existing indexes...' });
      await dropIndexes(getDatabase());
      progressBar.update(40, { step: 'Existing indexes dropped' });
      console.log(); // New line after progress bar
      console.log(chalk.green('✓ Dropped all existing indexes\n'));
    } else {
      progressBar.update(40, { step: 'Skipping drop' });
    }

    // Create standard indexes
    progressBar.update(45, { step: 'Creating standard indexes...' });
    progressBar.stop();
    console.log(); // New line after progress bar
    await createIndexes(getDatabase());

    // Create vector search index (if not skipped)
    if (!args.skipVector) {
      console.log();
      await createVectorSearchIndex(args.verbose);
    }

    // Verify indexes
    console.log();
    await verifyIndexes(args.verbose);

    console.log(chalk.bold.green('\n✓ Index creation completed successfully!\n'));
  } catch (error) {
    progressBar.stop();
    console.error(chalk.red('\n✗ Index creation failed'));
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
      if (args.verbose && error.stack) {
        console.error(chalk.dim(error.stack));
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
