#!/usr/bin/env tsx

/**
 * Legacy Data Migration Script
 *
 * Transforms legacy activity documents to match the current Activity schema:
 * - Maps cuid → activityId
 * - Maps name → title
 * - Maps charity → organizationId
 * - Transforms geolocations array → location object
 * - Transforms skills string → array of Skill objects
 * - Adds missing required fields (timeCommitment, contact, category)
 * - Removes legacy fields after successful migration
 *
 * Usage:
 *   pnpm migrate-data                    # Dry run (preview changes)
 *   pnpm migrate-data --execute          # Execute migration
 *   pnpm migrate-data --limit 10         # Limit to first 10 documents
 *   pnpm migrate-data --cleanup          # Remove legacy fields (requires --execute)
 */

import { config } from 'dotenv';
import { ObjectId } from 'mongodb';
import path from 'path';

import {
  activities,
  connectToDatabase,
  disconnectFromDatabase,
} from '@action-atlas/database';
import { transformDocument, type LegacyDocument, type TransformResult } from './migrate-legacy-data-lib';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

interface CliArgs {
  execute: boolean;
  cleanup: boolean;
  limit?: number;
  help: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  return {
    execute: args.includes('--execute'),
    cleanup: args.includes('--cleanup'),
    limit: args.includes('--limit')
      ? parseInt(args[args.indexOf('--limit') + 1] || '0', 10)
      : undefined,
    help: args.includes('--help') || args.includes('-h'),
  };
}

function showHelp(): void {
  console.log(`
Legacy Data Migration Script

Transforms legacy activity documents to match the current Activity schema.

Usage:
  pnpm migrate-data                    # Dry run (preview changes)
  pnpm migrate-data --execute          # Execute migration
  pnpm migrate-data --limit 10         # Limit to first 10 documents
  pnpm migrate-data --execute --cleanup  # Execute and remove legacy fields

Options:
  --execute    Execute the migration (default: dry run)
  --cleanup    Remove legacy fields after migration (requires --execute)
  --limit N    Limit to first N documents
  --help, -h   Show this help message

Examples:
  pnpm migrate-data --limit 3          # Preview first 3 documents
  pnpm migrate-data --execute --limit 10  # Migrate first 10 documents
  pnpm migrate-data --execute --cleanup   # Migrate all and cleanup legacy fields
`);
}

async function migrateData(args: CliArgs): Promise<void> {
  console.log('🔄 Legacy Data Migration Script\n');

  if (args.cleanup && !args.execute) {
    console.log('❌ ERROR: --cleanup requires --execute flag\n');
    showHelp();
    process.exit(1);
  }

  if (args.execute) {
    console.log('⚠️  EXECUTE MODE - Changes will be written to database');
    if (args.cleanup) {
      console.log('🧹 CLEANUP MODE - Legacy fields will be removed');
    }
    console.log('');
  } else {
    console.log('📋 DRY RUN MODE - No changes will be made\n');
  }

  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    await connectToDatabase();
    const collection = activities();

    // Find legacy documents that need migration
    const query: Record<string, unknown> = {
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

    const findOptions = args.limit ? { limit: args.limit } : {};
    const documents = await collection.find(query, findOptions).toArray();

    console.log(`✅ Connected to database`);
    console.log(`📊 Found ${documents.length} documents to migrate\n`);

    if (documents.length === 0) {
      console.log('✨ No documents need migration!');
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const doc of documents) {
      try {
        const result = transformDocument(doc as LegacyDocument, args.cleanup);

        // Display errors if any
        if (result.errors.length > 0) {
          console.log(`⚠️  Warnings for ${doc._id}:`);
          result.errors.forEach((err) => console.log(`   - ${err}`));
        }

        if (Object.keys(result.updates).length === 0 && result.fieldsToUnset.length === 0) {
          skippedCount++;
          continue;
        }

        if (args.execute) {
          // Build update operation
          const updateOp: Record<string, unknown> = { $set: result.updates };

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
          const legacyFields = result.fieldsToUnset.length > 0
            ? ` (removed ${result.fieldsToUnset.join(', ')})`
            : '';
          console.log(`✅ Migrated: ${doc._id}${legacyFields}`);
        } else {
          // Dry run - show summary of changes
          console.log(`📝 Would migrate: ${doc._id}`);
          console.log(`   Changed fields: ${Object.keys(result.updates).join(', ')}`);

          if (result.fieldsToUnset.length > 0) {
            console.log(`   Remove legacy fields: ${result.fieldsToUnset.join(', ')}`);
          }

          // Show key transformations
          if (result.updates.activityId) {
            console.log(`   cuid → activityId: ${result.updates.activityId}`);
          }
          if (result.updates.title) {
            console.log(`   name → title: ${result.updates.title}`);
          }
          if (result.updates.location) {
            const loc = result.updates.location as { address: { city: string } };
            console.log(`   geolocations → location: ${loc.address.city}`);
          }
          if (result.updates.skills) {
            const skills = result.updates.skills as Array<{ name: string }>;
            console.log(`   skills (string) → skills (array): ${skills.length} skills`);
          }

          console.log('');
          migratedCount++;
        }
      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ Error migrating ${doc._id}: ${errorMessage}`);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   Total documents found: ${documents.length}`);
    console.log(`   Successfully migrated: ${migratedCount}`);
    console.log(`   Skipped (no changes): ${skippedCount}`);
    console.log(`   Errors: ${errorCount}`);

    if (!args.execute) {
      console.log('\n💡 Run with --execute to apply changes');
      console.log('💡 Add --cleanup to remove legacy fields after migration');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Migration failed:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
  }
}

// Main execution
const args = parseArgs();

if (args.help) {
  showHelp();
  process.exit(0);
}

migrateData(args)
  .then(() => {
    console.log('\n✅ Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
