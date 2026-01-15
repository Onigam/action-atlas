#!/usr/bin/env tsx

/**
 * Database Seeding Script
 *
 * Loads seed data from MongoDB archive file and populates the database.
 *
 * Usage:
 *   pnpm seed                    # Load seed data (prompts if data exists)
 *   pnpm seed --force            # Force overwrite existing data
 *   pnpm seed --verbose          # Show detailed output
 *   pnpm seed --help             # Show help
 */

import { exec } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { promisify } from 'util';

import chalk from 'chalk';
import { config } from 'dotenv';
import readline from 'readline';

import {
  connectToDatabase,
  disconnectFromDatabase,
  getDatabase,
} from '@action-atlas/database';

const execAsync = promisify(exec);

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const SEED_DATA_PATH = path.join(process.cwd(), 'data', 'seed-dataset.agz');

interface CliArgs {
  force: boolean;
  verbose: boolean;
  help: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  return {
    force: args.includes('--force') || args.includes('-f'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

function showHelp(): void {
  console.log(`
${chalk.bold('Database Seeding Script')}

${chalk.bold('Usage:')}
  pnpm seed [options]

${chalk.bold('Options:')}
  --force, -f      Force overwrite existing data without prompting
  --verbose, -v    Show detailed output
  --help, -h       Show this help message

${chalk.bold('Description:')}
  Loads seed data from ${chalk.cyan('data/seed-dataset.agz')} into MongoDB.
  The seed data includes sample activities and organizations for development.

${chalk.bold('Examples:')}
  pnpm seed                # Load seed data with safety prompts
  pnpm seed --force        # Force reload (no prompts)
  pnpm seed --verbose      # Show detailed MongoDB output
  `);
}

async function askForConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function checkDataExists(): Promise<{
  hasActivities: boolean;
  hasOrganizations: boolean;
  activityCount: number;
  organizationCount: number;
}> {
  const db = getDatabase();
  const activityCount = await db.collection('activities').countDocuments();
  const charityCount = await db.collection('charities').countDocuments();

  return {
    hasActivities: activityCount > 0,
    hasOrganizations: charityCount > 0,
    activityCount,
    organizationCount: charityCount,
  };
}

async function dropExistingData(verbose: boolean): Promise<void> {
  const db = getDatabase();

  if (verbose) {
    console.log(chalk.dim('Dropping existing collections...'));
  }

  try {
    await db.collection('activities').drop();
    if (verbose) console.log(chalk.dim('  Dropped activities collection'));
  } catch (error) {
    // Collection might not exist
  }

  try {
    await db.collection('organizations').drop();
    if (verbose) console.log(chalk.dim('  Dropped organizations collection'));
  } catch (error) {
    // Collection might not exist
  }
}

async function loadSeedData(verbose: boolean): Promise<void> {
  console.log(chalk.blue('Loading seed data from archive...'));

  // Check if we should use Docker or local mongorestore
  const useDocker = await checkDockerAvailable();

  let command: string;

  if (useDocker) {
    // Use Docker to run mongorestore
    // The seed data is from "actionatlas" database, we need to restore it as "actionatlas"
    command = `docker exec -i mongo_vector_main mongorestore --gzip --archive --drop --nsFrom='actionatlas.*' --nsTo='actionatlas.*' < "${SEED_DATA_PATH}"`;
    if (verbose) {
      console.log(chalk.dim('Using Docker container for mongorestore'));
      console.log(chalk.dim('Restoring actionatlas → actionatlas'));
    }
  } else {
    // Use local mongorestore (if available)
    const mongoUri = process.env['MONGODB_URI'];
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    command = `mongorestore --uri="${mongoUri}" --gzip --archive="${SEED_DATA_PATH}" --drop --nsFrom='actionatlas.*' --nsTo='actionatlas.*'`;
    if (verbose) {
      console.log(chalk.dim('Using local mongorestore'));
      console.log(chalk.dim('Restoring actionatlas → actionatlas'));
    }
  }

  try {
    const { stdout, stderr } = await execAsync(command);

    if (verbose && stdout) {
      console.log(chalk.dim(stdout));
    }

    if (stderr && !stderr.includes('done') && !stderr.includes('preparing collections')) {
      console.error(chalk.yellow('Warning:'), stderr);
    }

    console.log(chalk.green('✓ Seed data loaded successfully'));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load seed data: ${error.message}`);
    }
    throw error;
  }
}

async function checkDockerAvailable(): Promise<boolean> {
  try {
    await execAsync('docker ps --filter "name=mongo_vector_main" --format "{{.Names}}"');
    return true;
  } catch {
    return false;
  }
}

async function verifySeedData(verbose: boolean): Promise<void> {
  const db = getDatabase();

  console.log(chalk.blue('Verifying loaded data...'));

  const activityCount = await db.collection('activities').countDocuments();
  // The seed data uses "charities" as the collection name
  const charityCount = await db.collection('charities').countDocuments();

  if (activityCount === 0 && charityCount === 0) {
    throw new Error('Data verification failed: No documents found after loading');
  }

  console.log(chalk.green('✓ Data verification successful'));
  console.log(chalk.cyan(`  Activities: ${activityCount}`));
  console.log(chalk.cyan(`  Charities/Organizations: ${charityCount}`));

  if (verbose) {
    // Show a sample activity
    const sampleActivity = await db.collection('activities').findOne();
    if (sampleActivity) {
      console.log(chalk.dim('\nSample activity:'));
      console.log(chalk.dim(`  Name: ${sampleActivity['name']}`));
      console.log(chalk.dim(`  Language: ${sampleActivity['language']}`));
      console.log(chalk.dim(`  Created: ${sampleActivity['createdAt']}`));
    }
  }
}

async function runDataMigration(verbose: boolean): Promise<void> {
  // Import the migration logic dynamically to avoid circular dependencies
  const { transformDocument } = await import('./migrate-legacy-data-lib');
  const { activities, getDatabase } = await import('@action-atlas/database');

  const collection = activities();
  const db = getDatabase();

  // Find documents that need migration
  const query = {
    $or: [
      { cuid: { $exists: true }, activityId: { $exists: false } },
      { name: { $exists: true }, title: { $exists: false } },
      { charity: { $exists: true }, organizationId: { $exists: false } },
      { geolocations: { $exists: true }, location: { $exists: false } },
      { skills: { $type: 'string' } },
      { timeCommitment: { $exists: false } },
      { contact: { $exists: false } },
      { category: { $exists: false } },
      { searchableText: { $exists: false } },
    ],
  };

  const documents = await collection.find(query).toArray();

  if (documents.length === 0) {
    if (verbose) {
      console.log(chalk.dim('  No documents need migration'));
    }
    return;
  }

  if (verbose) {
    console.log(chalk.dim(`  Found ${documents.length} documents to migrate`));
  }

  let migratedCount = 0;
  let errorCount = 0;

  for (const doc of documents) {
    try {
      const result = transformDocument(doc as any, true); // cleanup legacy fields

      if (Object.keys(result.updates).length === 0 && result.fieldsToUnset.length === 0) {
        continue;
      }

      // Build update operation
      const updateOp: Record<string, any> = { $set: result.updates };

      if (result.fieldsToUnset.length > 0) {
        const unsetFields: Record<string, string> = {};
        result.fieldsToUnset.forEach((field) => {
          unsetFields[field] = '';
        });
        updateOp.$unset = unsetFields;
      }

      // Execute update
      await collection.updateOne({ _id: doc._id }, updateOp);
      migratedCount++;

      if (verbose) {
        console.log(chalk.dim(`  ✓ Migrated: ${doc._id}`));
      }
    } catch (error) {
      errorCount++;
      if (verbose) {
        console.log(chalk.dim(`  ✗ Error migrating ${doc._id}`));
      }
    }
  }

  if (verbose || errorCount > 0) {
    console.log(chalk.dim(`  Migrated: ${migratedCount}, Errors: ${errorCount}`));
  }

  if (errorCount > 0) {
    throw new Error(`Migration completed with ${errorCount} errors`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  console.log(chalk.bold.blue('\n=== Database Seeding ===\n'));

  // Check if seed data file exists
  if (!existsSync(SEED_DATA_PATH)) {
    console.error(chalk.red('Error: Seed data file not found'));
    console.error(chalk.yellow(`Expected location: ${SEED_DATA_PATH}`));
    console.error(
      chalk.yellow(
        'Please ensure the seed-dataset.agz file is in the data/ directory.'
      )
    );
    process.exit(1);
  }

  if (args.verbose) {
    console.log(chalk.dim(`Seed data file: ${SEED_DATA_PATH}`));
    console.log(chalk.dim(`MongoDB URI: ${process.env['MONGODB_URI']}\n`));
  }

  try {
    // Connect to database
    console.log(chalk.blue('Connecting to MongoDB...'));
    await connectToDatabase();
    console.log(chalk.green('✓ Connected to MongoDB\n'));

    // Check existing data
    const existingData = await checkDataExists();

    if (
      !args.force &&
      (existingData.hasActivities || existingData.hasOrganizations)
    ) {
      console.log(chalk.yellow('Warning: Database already contains data'));
      console.log(
        chalk.cyan(`  Activities: ${existingData.activityCount}`)
      );
      console.log(
        chalk.cyan(`  Organizations: ${existingData.organizationCount}`)
      );
      console.log();

      const shouldContinue = await askForConfirmation(
        chalk.yellow(
          'This will DELETE all existing data. Do you want to continue? (y/N): '
        )
      );

      if (!shouldContinue) {
        console.log(chalk.blue('Operation cancelled.'));
        process.exit(0);
      }
    }

    // Drop existing data if needed
    if (existingData.hasActivities || existingData.hasOrganizations) {
      await dropExistingData(args.verbose);
      console.log(chalk.green('✓ Cleared existing data\n'));
    }

    // Load seed data
    await loadSeedData(args.verbose);
    console.log();

    // Verify loaded data
    await verifySeedData(args.verbose);

    // Run data migration to transform legacy data
    console.log(chalk.blue('\nMigrating legacy data to current schema...'));
    try {
      await runDataMigration(args.verbose);
      console.log(chalk.green('✓ Data migration completed'));
    } catch (error) {
      console.error(chalk.yellow('⚠ Data migration encountered errors'));
      if (error instanceof Error) {
        console.error(chalk.yellow(error.message));
      }
      console.log(chalk.yellow('You can run migration manually with: pnpm migrate-data --execute'));
    }

    console.log(chalk.bold.green('\n✓ Database seeding completed successfully!\n'));
  } catch (error) {
    console.error(chalk.red('\n✗ Database seeding failed'));
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
