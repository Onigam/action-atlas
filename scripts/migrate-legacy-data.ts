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
 * Phase 1 Mode (--phase1):
 * - Deletes activities with invalid types (keeps only: COLLECTION, VOLUNTEERING, SKILLBASED)
 * - Deletes activities with invalid status (keeps only: PUBLISHED)
 * - Removes legacy fields from all remaining documents
 *
 * Usage:
 *   pnpm migrate-data                    # Dry run (preview changes)
 *   pnpm migrate-data --execute          # Execute migration
 *   pnpm migrate-data --limit 10         # Limit to first 10 documents
 *   pnpm migrate-data --cleanup          # Remove legacy fields (requires --execute)
 *   pnpm migrate-data --phase1           # Phase 1: filter activities and remove legacy fields
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
  phase1: boolean;
  limit?: number;
  help: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  return {
    execute: args.includes('--execute'),
    cleanup: args.includes('--cleanup'),
    phase1: args.includes('--phase1'),
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
  pnpm migrate-data --phase1           # Phase 1: filter + cleanup (dry run)
  pnpm migrate-data --phase1 --execute # Phase 1: filter + cleanup (execute)

Options:
  --execute    Execute the migration (default: dry run)
  --cleanup    Remove legacy fields after migration (requires --execute)
  --phase1     Phase 1 data cleanup:
               - Delete activities with invalid types (keep: COLLECTION, VOLUNTEERING, SKILLBASED)
               - Delete activities with invalid status (keep: PUBLISHED)
               - Remove 17 legacy fields from all remaining documents
  --limit N    Limit to first N documents
  --help, -h   Show this help message

Examples:
  pnpm migrate-data --limit 3          # Preview first 3 documents
  pnpm migrate-data --execute --limit 10  # Migrate first 10 documents
  pnpm migrate-data --execute --cleanup   # Migrate all and cleanup legacy fields
  pnpm migrate-data --phase1           # Preview Phase 1 changes
  pnpm migrate-data --phase1 --execute # Execute Phase 1 cleanup
`);
}

// Phase 1 Constants
const VALID_TYPES = ['COLLECTION', 'VOLUNTEERING', 'SKILLBASED'] as const;
const VALID_STATUS = ['PUBLISHED'] as const;

const PHASE1_LEGACY_FIELDS = [
  'name',                        // Duplicate of title
  'location',                    // Legacy string format (superseded by geolocations → location object)
  '__v',                         // Mongoose version key
  '_descriptionConvertedAt',     // Migration metadata
  '_originalDraftJSDescription', // Migration backup data
  '_descriptionConversionNote',  // Migration error notes
  'activityWorkLanguages',       // Contains empty strings
  'owningOrganizations',         // Always empty
  'timeSlotsIds',                // Always empty
  'sustainableDevelopmentGoals', // Always empty
  'donationsTiers',              // Always empty
  'autoCreateOpportunities',     // Internal flag
  'autoCreatePost',              // Internal flag
  'sourceHash',                  // Import tracking
  'popularityScoreBias',         // Unused metric (always 0)
  'searchableText',              // Will be regenerated with new embeddable fields
  'creationDate',                // Duplicate of createdAt
  'updateAt',                    // Typo duplicate of updatedAt
] as const;

interface Phase1Stats {
  totalActivities: number;
  activitiesToDelete: number;
  activitiesWithInvalidType: number;
  activitiesWithInvalidStatus: number;
  activitiesToClean: number;
  fieldsRemoved: number;
}

async function runPhase1(args: CliArgs): Promise<void> {
  console.log('🔄 Phase 1: Data Cleanup\n');

  if (args.execute) {
    console.log('⚠️  EXECUTE MODE - Changes will be written to database\n');
  } else {
    console.log('📋 DRY RUN MODE - No changes will be made\n');
  }

  try {
    console.log('📡 Connecting to database...');
    await connectToDatabase();
    const collection = activities();

    const stats: Phase1Stats = {
      totalActivities: 0,
      activitiesToDelete: 0,
      activitiesWithInvalidType: 0,
      activitiesWithInvalidStatus: 0,
      activitiesToClean: 0,
      fieldsRemoved: 0,
    };

    // Get total count
    stats.totalActivities = await collection.countDocuments();
    console.log(`✅ Connected to database`);
    console.log(`📊 Total activities in database: ${stats.totalActivities}\n`);

    // Step 1: Find activities with invalid types
    const invalidTypeQuery = {
      $or: [
        { type: { $exists: true, $nin: VALID_TYPES } },
        { type: { $exists: false } },
      ],
    };
    const invalidTypeCount = await collection.countDocuments(invalidTypeQuery);
    stats.activitiesWithInvalidType = invalidTypeCount;

    console.log('📋 Step 1: Filter by type');
    console.log(`   Valid types: ${VALID_TYPES.join(', ')}`);
    console.log(`   Activities with invalid/missing type: ${invalidTypeCount}`);

    if (invalidTypeCount > 0 && !args.execute) {
      // Show sample of activities to be deleted
      const samples = await collection.find(invalidTypeQuery).limit(5).toArray();
      console.log('   Sample activities to delete:');
      for (const doc of samples) {
        console.log(`     - ${doc._id}: type="${doc.type || 'undefined'}", title="${doc.title || doc.name || 'N/A'}"`);
      }
    }

    // Step 2: Find activities with invalid status (among valid types)
    const invalidStatusQuery = {
      type: { $in: VALID_TYPES },
      $or: [
        { status: { $exists: true, $nin: VALID_STATUS } },
        { status: { $exists: false } },
      ],
    };
    const invalidStatusCount = await collection.countDocuments(invalidStatusQuery);
    stats.activitiesWithInvalidStatus = invalidStatusCount;

    console.log('\n📋 Step 2: Filter by status');
    console.log(`   Valid status: ${VALID_STATUS.join(', ')}`);
    console.log(`   Activities with invalid/missing status: ${invalidStatusCount}`);

    if (invalidStatusCount > 0 && !args.execute) {
      const samples = await collection.find(invalidStatusQuery).limit(5).toArray();
      console.log('   Sample activities to delete:');
      for (const doc of samples) {
        console.log(`     - ${doc._id}: status="${doc.status || 'undefined'}", title="${doc.title || doc.name || 'N/A'}"`);
      }
    }

    stats.activitiesToDelete = invalidTypeCount + invalidStatusCount;

    // Step 3: Count activities that will remain and need cleanup
    const remainingQuery = {
      type: { $in: VALID_TYPES },
      status: { $in: VALID_STATUS },
    };
    stats.activitiesToClean = await collection.countDocuments(remainingQuery);

    console.log('\n📋 Step 3: Remove legacy fields');
    console.log(`   Activities remaining after filter: ${stats.activitiesToClean}`);
    console.log(`   Legacy fields to remove (${PHASE1_LEGACY_FIELDS.length}):`);
    console.log(`     ${PHASE1_LEGACY_FIELDS.join(', ')}`);

    // Count how many documents have each legacy field
    if (!args.execute) {
      console.log('\n   Field occurrence in remaining activities:');
      for (const field of PHASE1_LEGACY_FIELDS) {
        const count = await collection.countDocuments({
          ...remainingQuery,
          [field]: { $exists: true },
        });
        if (count > 0) {
          console.log(`     - ${field}: ${count} documents`);
          stats.fieldsRemoved += count;
        }
      }
    }

    // Execute if requested
    if (args.execute) {
      console.log('\n🚀 Executing Phase 1...\n');

      // Delete activities with invalid type
      if (invalidTypeCount > 0) {
        const deleteTypeResult = await collection.deleteMany(invalidTypeQuery);
        console.log(`🗑️  Deleted ${deleteTypeResult.deletedCount} activities with invalid type`);
      }

      // Delete activities with invalid status
      if (invalidStatusCount > 0) {
        const deleteStatusResult = await collection.deleteMany(invalidStatusQuery);
        console.log(`🗑️  Deleted ${deleteStatusResult.deletedCount} activities with invalid status`);
      }

      // Remove legacy fields from remaining activities
      const unsetFields: Record<string, string> = {};
      for (const field of PHASE1_LEGACY_FIELDS) {
        unsetFields[field] = '';
      }

      const updateResult = await collection.updateMany(
        remainingQuery,
        { $unset: unsetFields }
      );
      console.log(`🧹 Cleaned ${updateResult.modifiedCount} activities (removed legacy fields)`);

      // Final count
      const finalCount = await collection.countDocuments();
      console.log(`\n✅ Final activity count: ${finalCount}`);
    }

    // Summary
    console.log('\n📈 Phase 1 Summary:');
    console.log(`   Total activities before: ${stats.totalActivities}`);
    console.log(`   Activities to delete: ${stats.activitiesToDelete}`);
    console.log(`     - Invalid type: ${stats.activitiesWithInvalidType}`);
    console.log(`     - Invalid status: ${stats.activitiesWithInvalidStatus}`);
    console.log(`   Activities remaining: ${stats.activitiesToClean}`);
    console.log(`   Legacy fields to remove: ${PHASE1_LEGACY_FIELDS.length}`);

    if (!args.execute) {
      console.log('\n💡 Run with --execute to apply changes');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Phase 1 failed:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
  }
}

async function migrateData(args: CliArgs): Promise<void> {
  // Handle Phase 1 separately
  if (args.phase1) {
    return runPhase1(args);
  }

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
        { skillsIds: { $exists: true } },
        { timeCommitment: { $exists: false } },
        { contact: { $exists: false } },
        { causesIds: { $exists: true }},
        { causes: { $exists: true }},
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
