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
 * With --cleanup flag:
 * - First deletes activities with invalid types (keeps only: COLLECTION, VOLUNTEERING, SKILLBASED)
 * - Then deletes activities with invalid status (keeps only: PUBLISHED)
 * - Finally removes all legacy fields from remaining documents
 *
 * Usage:
 *   pnpm migrate-data                    # Dry run (preview changes)
 *   pnpm migrate-data --execute          # Execute migration
 *   pnpm migrate-data --limit 10         # Limit to first 10 documents
 *   pnpm migrate-data --execute --cleanup  # Execute migration with full cleanup
 */

import { config } from 'dotenv';
import { ObjectId } from 'mongodb';
import path from 'path';

import {
  activities,
  connectToDatabase,
  disconnectFromDatabase,
} from '@action-atlas/database';
import { transformDocument, LEGACY_FIELDS_TO_REMOVE, type LegacyDocument, type TransformResult } from './migrate-legacy-data-lib';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

// Activity filtering constants
const VALID_TYPES = ['COLLECTION', 'VOLUNTEERING', 'SKILLBASED'] as const;
const VALID_STATUS = ['PUBLISHED'] as const;

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
  --cleanup    Full cleanup mode (requires --execute):
               - Delete activities with invalid types (keep: COLLECTION, VOLUNTEERING, SKILLBASED)
               - Delete activities with invalid status (keep: PUBLISHED)
               - Remove ${LEGACY_FIELDS_TO_REMOVE.length} legacy fields from all remaining documents
  --limit N    Limit to first N documents
  --help, -h   Show this help message

Examples:
  pnpm migrate-data --limit 3          # Preview first 3 documents
  pnpm migrate-data --execute --limit 10  # Migrate first 10 documents
  pnpm migrate-data --execute --cleanup   # Full migration with cleanup
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
      console.log('🧹 CLEANUP MODE - Will filter activities and remove legacy fields');
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

    const totalBefore = await collection.countDocuments();
    console.log(`✅ Connected to database`);
    console.log(`📊 Total activities in database: ${totalBefore}\n`);

    // Step 1: Filter activities by type and status (only with --cleanup)
    if (args.cleanup) {
      console.log('━━━ Step 1: Filter invalid activities ━━━\n');

      // Find activities with invalid types
      const invalidTypeQuery = {
        $or: [
          { type: { $exists: true, $nin: VALID_TYPES } },
          { type: { $exists: false } },
        ],
      };
      const invalidTypeCount = await collection.countDocuments(invalidTypeQuery);

      console.log(`📋 Filter by type (valid: ${VALID_TYPES.join(', ')})`);
      console.log(`   Activities with invalid/missing type: ${invalidTypeCount}`);

      if (invalidTypeCount > 0 && !args.execute) {
        const samples = await collection.find(invalidTypeQuery).limit(3).toArray();
        console.log('   Samples:');
        for (const doc of samples) {
          console.log(`     - ${doc._id}: type="${doc.type || 'undefined'}"`);
        }
      }

      // Find activities with invalid status (among valid types)
      const invalidStatusQuery = {
        type: { $in: VALID_TYPES },
        $or: [
          { status: { $exists: true, $nin: VALID_STATUS } },
          { status: { $exists: false } },
        ],
      };
      const invalidStatusCount = await collection.countDocuments(invalidStatusQuery);

      console.log(`\n📋 Filter by status (valid: ${VALID_STATUS.join(', ')})`);
      console.log(`   Activities with invalid/missing status: ${invalidStatusCount}`);

      if (invalidStatusCount > 0 && !args.execute) {
        const samples = await collection.find(invalidStatusQuery).limit(3).toArray();
        console.log('   Samples:');
        for (const doc of samples) {
          console.log(`     - ${doc._id}: status="${doc.status || 'undefined'}"`);
        }
      }

      // Execute deletions
      if (args.execute) {
        if (invalidTypeCount > 0) {
          const result = await collection.deleteMany(invalidTypeQuery);
          console.log(`\n🗑️  Deleted ${result.deletedCount} activities with invalid type`);
        }
        if (invalidStatusCount > 0) {
          const result = await collection.deleteMany(invalidStatusQuery);
          console.log(`🗑️  Deleted ${result.deletedCount} activities with invalid status`);
        }

        const remainingCount = await collection.countDocuments();
        console.log(`\n✅ Activities remaining: ${remainingCount}`);
      } else {
        console.log(`\n📊 Total to delete: ${invalidTypeCount + invalidStatusCount}`);
        console.log(`   Would remain: ${totalBefore - invalidTypeCount - invalidStatusCount}`);
      }

      console.log('\n━━━ Step 2: Migrate and cleanup documents ━━━\n');
    }

    // Step 2: Find legacy documents that need migration
    // Build query to find documents that need transformation OR have legacy fields to remove
    const legacyFieldsExistConditions = LEGACY_FIELDS_TO_REMOVE.map(field => ({
      [field]: { $exists: true }
    }));

    /**
     * IMPORTANT: Query to find documents that need migration.
     *
     * When adding new migration logic, ALWAYS update this query to:
     * 1. Include conditions that identify documents needing the new transformation
     * 2. Exclude documents that have already been migrated (use patterns like:
     *    { oldField: { $exists: true }, newField: { $exists: false } })
     *
     * This prevents re-processing already migrated documents and ensures
     * idempotent migrations that can be safely re-run.
     */
    const query: Record<string, unknown> = {
      $or: [
        // Documents needing transformation (oldField exists, newField doesn't)
        { cuid: { $exists: true }, activityId: { $exists: false } },
        { name: { $exists: true }, title: { $exists: false } },
        { charity: { $exists: true }, organizationId: { $exists: false } },
        { geolocations: { $exists: true }, location: { $exists: false } },
        { skills: { $type: 'string' } },
        { skillsIds: { $exists: true } },
        { timeCommitment: { $exists: false } },
        { contact: { $exists: false } },
        { causesIds: { $exists: true } },
        { causes: { $exists: true } },
        // Documents with legacy fields to remove (only when cleanup is enabled)
        ...(args.cleanup ? legacyFieldsExistConditions : []),
      ],
    };

    const findOptions = args.limit ? { limit: args.limit } : {};
    const documents = await collection.find(query, findOptions).toArray();

    console.log(`📊 Found ${documents.length} documents to process\n`);

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
          const updateOp: Record<string, unknown> = {};

          if (Object.keys(result.updates).length > 0) {
            updateOp.$set = result.updates;
          }

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
            ? ` (removed ${result.fieldsToUnset.length} fields)`
            : '';
          console.log(`✅ Migrated: ${doc._id}${legacyFields}`);
        } else {
          // Dry run - show summary of changes
          console.log(`📝 Would migrate: ${doc._id}`);

          if (Object.keys(result.updates).length > 0) {
            console.log(`   Set fields: ${Object.keys(result.updates).join(', ')}`);
          }

          if (result.fieldsToUnset.length > 0) {
            console.log(`   Remove fields: ${result.fieldsToUnset.join(', ')}`);
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
    console.log(`   Total documents processed: ${documents.length}`);
    console.log(`   Successfully migrated: ${migratedCount}`);
    console.log(`   Skipped (no changes): ${skippedCount}`);
    console.log(`   Errors: ${errorCount}`);

    if (args.cleanup && args.execute) {
      const finalCount = await collection.countDocuments();
      console.log(`\n   Final activity count: ${finalCount} (was ${totalBefore})`);
    }

    if (!args.execute) {
      console.log('\n💡 Run with --execute to apply changes');
      console.log('💡 Add --cleanup to also filter activities and remove legacy fields');
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
