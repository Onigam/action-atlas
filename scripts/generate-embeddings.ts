#!/usr/bin/env tsx

/**
 * Embedding Generation Script
 *
 * Generates OpenAI embeddings for activities that don't have them.
 *
 * Usage:
 *   pnpm generate-embeddings              # Generate embeddings for all activities
 *   pnpm generate-embeddings --batch 50   # Custom batch size
 *   pnpm generate-embeddings --limit 100  # Process only first 100 activities
 *   pnpm generate-embeddings --verbose    # Show detailed output
 *   pnpm generate-embeddings --help       # Show help
 */

import path from 'path';

import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { config } from 'dotenv';

import {
  connectToDatabase,
  disconnectFromDatabase,
  findActivitiesWithoutEmbeddingsWithOrganization,
  updateActivityEmbedding,
  clearAllEmbeddings,
} from '@action-atlas/database';

import {
  generateEmbeddings,
  prepareActivityForEmbedding,
} from '@action-atlas/ai';

// Load environment variables from root or apps/web
const rootEnvPath = path.join(process.cwd(), '.env.local');
const webEnvPath = path.join(process.cwd(), 'apps', 'web', '.env.local');

// Try root first, then fallback to web app
config({ path: rootEnvPath });
if (!process.env['OPENAI_API_KEY']) {
  config({ path: webEnvPath });
}

interface CliArgs {
  batch: number;
  limit: number | null;
  verbose: boolean;
  help: boolean;
  delay: number;
  reset: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);

  const batchIndex = args.indexOf('--batch');
  const limitIndex = args.indexOf('--limit');
  const delayIndex = args.indexOf('--delay');

  return {
    batch: batchIndex !== -1 ? parseInt(args[batchIndex + 1] ?? '50', 10) : 50,
    limit: limitIndex !== -1 ? parseInt(args[limitIndex + 1] ?? '0', 10) : null,
    delay: delayIndex !== -1 ? parseInt(args[delayIndex + 1] ?? '1000', 10) : 1000,
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h'),
    reset: args.includes('--reset'),
  };
}

function showHelp(): void {
  console.log(`
${chalk.bold('Embedding Generation Script')}

${chalk.bold('Usage:')}
  pnpm generate-embeddings [options]

${chalk.bold('Options:')}
  --batch <n>      Number of activities to process per batch (default: 50)
  --limit <n>      Maximum number of activities to process (default: all)
  --delay <ms>     Delay between batches in milliseconds (default: 1000)
  --reset          Clear all existing embeddings before generating new ones
  --verbose, -v    Show detailed output
  --help, -h       Show this help message

${chalk.bold('Description:')}
  Generates OpenAI embeddings for activities that don't have them yet.
  Uses text-embedding-3-small model (1536 dimensions).

  ${chalk.yellow('Note:')} Requires OPENAI_API_KEY environment variable to be set.

${chalk.bold('Reset Mode:')}
  Use --reset to clear all existing embeddings and recalculate from scratch.
  This is useful when you change the embedding calculation logic.

${chalk.bold('Cost Estimation:')}
  text-embedding-3-small: $0.02 per 1M tokens
  Average activity: ~200 tokens
  1000 activities: ~$0.004 (less than half a cent)

${chalk.bold('Rate Limits:')}
  OpenAI Tier 1: 3M tokens/min, 3000 requests/min
  Script includes automatic delays between batches

${chalk.bold('Examples:')}
  pnpm generate-embeddings              # Process activities without embeddings
  pnpm generate-embeddings --reset      # Clear all embeddings and regenerate
  pnpm generate-embeddings --batch 100  # Larger batches (faster)
  pnpm generate-embeddings --limit 50   # Test with 50 activities
  pnpm generate-embeddings -v           # Verbose output
  `);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatCost(tokens: number): string {
  const costPer1M = 0.02; // $0.02 per 1M tokens
  const cost = (tokens / 1_000_000) * costPer1M;
  return cost < 0.001 ? '< $0.001' : `$${cost.toFixed(3)}`;
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  console.log(chalk.bold.blue('\n=== Embedding Generation ===\n'));

  // Check for OpenAI API key
  if (!process.env['OPENAI_API_KEY']) {
    console.error(chalk.red('Error: OPENAI_API_KEY environment variable is not set'));
    console.error(
      chalk.yellow('Please set your OpenAI API key in .env.local file.')
    );
    process.exit(1);
  }

  if (args.verbose) {
    console.log(chalk.dim(`MongoDB URI: ${process.env['MONGODB_URI']}`));
    console.log(chalk.dim(`Batch size: ${args.batch}`));
    console.log(chalk.dim(`Delay between batches: ${args.delay}ms`));
    if (args.limit) {
      console.log(chalk.dim(`Limit: ${args.limit} activities`));
    }
    if (args.reset) {
      console.log(chalk.dim(`Reset mode: enabled (will clear all embeddings first)`));
    }
    console.log();
  }

  let totalProcessed = 0;
  let totalSuccess = 0;
  let totalFailed = 0;
  let totalTokens = 0;

  const progressBar = new cliProgress.SingleBar(
    {
      format:
        'Progress |{bar}| {percentage}% | {value}/{total} activities | Tokens: {tokens}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );

  try {
    // Connect to database
    console.log(chalk.blue('Connecting to MongoDB...'));
    await connectToDatabase();
    console.log(chalk.green('✓ Connected to MongoDB\n'));

    // Reset mode: clear all existing embeddings
    if (args.reset) {
      console.log(chalk.yellow('⚠ Reset mode enabled - clearing all existing embeddings...'));
      const clearedCount = await clearAllEmbeddings();
      console.log(chalk.green(`✓ Cleared embeddings from ${clearedCount} activities\n`));
    }

    // Find activities without embeddings (with organization data)
    console.log(chalk.blue('Finding activities without embeddings (with organization lookup)...'));
    const limit = args.limit ?? 10000; // Reasonable default
    const activities = await findActivitiesWithoutEmbeddingsWithOrganization(limit);

    if (activities.length === 0) {
      console.log(chalk.green('✓ All activities already have embeddings!'));
      process.exit(0);
    }

    console.log(
      chalk.cyan(`Found ${activities.length} activities without embeddings\n`)
    );

    // Process in batches
    const batches = Math.ceil(activities.length / args.batch);
    progressBar.start(activities.length, 0, { tokens: 0 });

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const start = batchIndex * args.batch;
      const end = Math.min(start + args.batch, activities.length);
      const batch = activities.slice(start, end);

      try {
        // Prepare texts for embedding
        const texts = batch.map((activity) =>
          prepareActivityForEmbedding({
            title: activity.title,
            description: activity.description,
            organization: activity.organization,
            skills: activity.skills,
            category: activity.category,
            location: activity.location,
          })
        );

        // Generate embeddings
        const result = await generateEmbeddings(texts);
        totalTokens += result.totalTokensUsed;

        // Update activities with embeddings
        for (let i = 0; i < batch.length; i++) {
          const activity = batch[i];
          const embedding = result.embeddings[i];

          if (!activity || !embedding) {
            console.error(chalk.yellow(`Warning: Missing data for index ${i}`));
            continue;
          }

          try {
            // Use _id as fallback if activityId doesn't exist (for legacy seed data)
            const id = activity.activityId || activity._id?.toString();
            if (!id) {
              throw new Error('Activity has no ID');
            }
            await updateActivityEmbedding(id, embedding);
            totalSuccess++;
          } catch (error) {
            totalFailed++;
            if (args.verbose && error instanceof Error) {
              const activityIdStr = activity.activityId || activity._id?.toString() || 'unknown';
              console.error(
                chalk.yellow(`Failed to update ${activityIdStr}: ${error.message}`)
              );
            }
          }
        }

        totalProcessed += batch.length;
        progressBar.update(totalProcessed, { tokens: totalTokens });

        // Add delay between batches to respect rate limits
        if (batchIndex < batches - 1) {
          await sleep(args.delay);
        }
      } catch (error) {
        progressBar.stop();
        console.error(chalk.red(`\nError processing batch ${batchIndex + 1}:`));
        if (error instanceof Error) {
          console.error(chalk.red(error.message));

          // Check for rate limit error
          if (error.message.includes('rate') || error.message.includes('429')) {
            console.error(
              chalk.yellow('\nRate limit exceeded. Try increasing --delay or reducing --batch size.')
            );
          }
        }
        totalFailed += batch.length;
        progressBar.start(activities.length, totalProcessed, { tokens: totalTokens });
      }
    }

    progressBar.stop();
    console.log();

    // Show summary
    console.log(chalk.bold.green('\n✓ Embedding generation completed!\n'));
    console.log(chalk.cyan('Summary:'));
    console.log(chalk.cyan(`  Total processed: ${totalProcessed}`));
    console.log(chalk.green(`  Successful: ${totalSuccess}`));
    if (totalFailed > 0) {
      console.log(chalk.red(`  Failed: ${totalFailed}`));
    }
    console.log(chalk.cyan(`  Total tokens used: ${totalTokens.toLocaleString()}`));
    console.log(chalk.cyan(`  Estimated cost: ${formatCost(totalTokens)}`));
    console.log();

    if (totalFailed > 0) {
      console.log(
        chalk.yellow(`Warning: ${totalFailed} activities failed to update`)
      );
      console.log(chalk.yellow('Run the script again to retry failed activities'));
    }
  } catch (error) {
    progressBar.stop();
    console.error(chalk.red('\n✗ Embedding generation failed'));
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
