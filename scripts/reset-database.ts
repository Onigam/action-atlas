#!/usr/bin/env tsx

/**
 * Database Reset Script
 *
 * Drops collections and optionally reseeds the database.
 *
 * Usage:
 *   pnpm db:reset               # Interactive reset with prompts
 *   pnpm db:reset --force       # Force reset without prompts
 *   pnpm db:reset --no-seed     # Reset without reseeding
 *   pnpm db:reset --help        # Show help
 */

import path from 'path';

import chalk from 'chalk';
import { config } from 'dotenv';
import readline from 'readline';

import {
  connectToDatabase,
  disconnectFromDatabase,
  getDatabase,
} from '@action-atlas/database';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

interface CliArgs {
  force: boolean;
  noSeed: boolean;
  verbose: boolean;
  help: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  return {
    force: args.includes('--force') || args.includes('-f'),
    noSeed: args.includes('--no-seed'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

function showHelp(): void {
  console.log(`
${chalk.bold('Database Reset Script')}

${chalk.bold('Usage:')}
  pnpm db:reset [options]

${chalk.bold('Options:')}
  --force, -f      Force reset without confirmation prompts
  --no-seed        Don't reseed after reset
  --verbose, -v    Show detailed output
  --help, -h       Show this help message

${chalk.bold('Description:')}
  Drops all collections from the database and optionally reseeds
  with fresh sample data.

  ${chalk.bold.red('WARNING:')} This operation is DESTRUCTIVE and cannot be undone!

${chalk.bold('What gets deleted:')}
  - All activities
  - All organizations
  - All indexes (will be recreated on reseed)
  - All embeddings

${chalk.bold('Examples:')}
  pnpm db:reset              # Interactive reset with confirmation
  pnpm db:reset --force      # Skip confirmation (dangerous!)
  pnpm db:reset --no-seed    # Reset but don't reseed
  pnpm db:reset -v           # Verbose output
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

async function dropAllCollections(verbose: boolean): Promise<void> {
  const db = getDatabase();

  console.log(chalk.blue('Dropping collections...'));

  const collections = await db.listCollections().toArray();

  for (const collectionInfo of collections) {
    const collectionName = collectionInfo['name'];

    // Skip system collections
    if (collectionName.startsWith('system.')) {
      continue;
    }

    try {
      await db.collection(collectionName).drop();
      if (verbose) {
        console.log(chalk.dim(`  Dropped: ${collectionName}`));
      }
    } catch (error) {
      console.error(
        chalk.yellow(`Warning: Failed to drop ${collectionName}`)
      );
      if (verbose && error instanceof Error) {
        console.error(chalk.dim(`  ${error.message}`));
      }
    }
  }

  console.log(chalk.green('✓ All collections dropped\n'));
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  console.log(chalk.bold.red('\n=== Database Reset ===\n'));

  if (args.verbose) {
    console.log(chalk.dim(`MongoDB URI: ${process.env['MONGODB_URI']}\n`));
  }

  try {
    // Connect to database
    console.log(chalk.blue('Connecting to MongoDB...'));
    await connectToDatabase();
    console.log(chalk.green('✓ Connected to MongoDB\n'));

    const db = getDatabase();

    // Count existing data
    const activityCount = await db.collection('activities').countDocuments();
    const organizationCount = await db.collection('organizations').countDocuments();

    if (activityCount === 0 && organizationCount === 0) {
      console.log(chalk.yellow('Database is already empty.'));
      if (!args.noSeed) {
        console.log(chalk.cyan('Run: pnpm seed to load sample data\n'));
      }
      process.exit(0);
    }

    // Show what will be deleted
    console.log(chalk.yellow('This will DELETE the following data:'));
    console.log(chalk.cyan(`  Activities: ${activityCount}`));
    console.log(chalk.cyan(`  Organizations: ${organizationCount}`));
    console.log();

    // Confirm reset
    if (!args.force) {
      console.log(
        chalk.bold.red('⚠️  WARNING: This operation is DESTRUCTIVE and cannot be undone!')
      );
      console.log();

      const confirmed = await askForConfirmation(
        chalk.yellow('Are you absolutely sure you want to reset the database? (y/N): ')
      );

      if (!confirmed) {
        console.log(chalk.blue('Operation cancelled.'));
        process.exit(0);
      }

      // Double confirmation for safety
      const doubleConfirmed = await askForConfirmation(
        chalk.yellow('Type "yes" to confirm: ')
      );

      if (!doubleConfirmed) {
        console.log(chalk.blue('Operation cancelled.'));
        process.exit(0);
      }

      console.log();
    }

    // Drop all collections
    await dropAllCollections(args.verbose);

    console.log(chalk.bold.green('✓ Database reset completed!\n'));

    // Suggest next steps
    if (!args.noSeed) {
      console.log(chalk.cyan('Next steps:'));
      console.log(chalk.cyan('  1. Reseed database: pnpm seed'));
      console.log(chalk.cyan('  2. Create indexes: pnpm create-indexes'));
      console.log(chalk.cyan('  3. Generate embeddings: pnpm generate-embeddings'));
      console.log();
      console.log(chalk.cyan('Or run full setup: pnpm setup'));
      console.log();
    }
  } catch (error) {
    console.error(chalk.red('\n✗ Database reset failed'));
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
