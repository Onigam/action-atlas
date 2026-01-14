#!/usr/bin/env tsx

/**
 * DraftJS to Markdown Conversion Script
 *
 * Converts DraftJS formatted descriptions to Markdown using Gemini API
 * for both activities and charities collections.
 *
 * Usage:
 *   pnpm convert-draftjs                # Convert all DraftJS descriptions
 *   pnpm convert-draftjs --dry-run      # Preview changes without updating
 *   pnpm convert-draftjs --collection activities  # Process only activities
 *   pnpm convert-draftjs --collection charities   # Process only charities
 *   pnpm convert-draftjs --limit 10     # Process only first 10 documents
 *   pnpm convert-draftjs --verbose      # Show detailed output
 *   pnpm convert-draftjs --help         # Show help
 */

import path from 'path';

import { GoogleGenerativeAI } from '@google/generative-ai';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { config } from 'dotenv';
import { MongoClient, type Collection, type Db, type Document } from 'mongodb';

// Load environment variables
const rootEnvPath = path.join(process.cwd(), '.env.local');
const webEnvPath = path.join(process.cwd(), 'apps', 'web', '.env.local');

config({ path: rootEnvPath });
if (!process.env['GOOGLE_API_KEY']) {
  config({ path: webEnvPath });
}

// MongoDB connection string - hardcoded as per requirement
const MONGODB_URI = 'mongodb://localhost:27018/actionatlas';

interface CliArgs {
  dryRun: boolean;
  collection: 'all' | 'activities' | 'charities';
  limit: number | null;
  verbose: boolean;
  help: boolean;
  delay: number;
}

interface DraftJSBlock {
  key: string;
  text: string;
  type: string;
  depth: number;
  inlineStyleRanges: Array<{ offset: number; length: number; style: string }>;
  entityRanges: Array<{ offset: number; length: number; key: number }>;
  data?: Record<string, unknown>;
}

interface DraftJSContent {
  blocks: DraftJSBlock[];
  entityMap: Record<
    string,
    { type: string; mutability: string; data: Record<string, unknown> }
  >;
}

interface ConversionResult {
  success: boolean;
  original: string;
  markdown?: string;
  error?: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);

  const limitIndex = args.indexOf('--limit');
  const delayIndex = args.indexOf('--delay');
  const collectionIndex = args.indexOf('--collection');

  let collection: 'all' | 'activities' | 'charities' = 'all';
  if (collectionIndex !== -1) {
    const value = args[collectionIndex + 1];
    if (value === 'activities' || value === 'charities') {
      collection = value;
    }
  }

  return {
    dryRun: args.includes('--dry-run'),
    collection,
    limit: limitIndex !== -1 ? parseInt(args[limitIndex + 1] ?? '0', 10) : null,
    delay:
      delayIndex !== -1 ? parseInt(args[delayIndex + 1] ?? '500', 10) : 500,
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

function showHelp(): void {
  console.log(`
${chalk.bold('DraftJS to Markdown Conversion Script')}

${chalk.bold('Usage:')}
  pnpm convert-draftjs [options]

${chalk.bold('Options:')}
  --dry-run              Preview changes without updating the database
  --collection <name>    Process only specific collection ('activities' or 'charities')
  --limit <n>            Maximum number of documents to process (default: all)
  --delay <ms>           Delay between API calls in milliseconds (default: 500)
  --verbose, -v          Show detailed output
  --help, -h             Show this help message

${chalk.bold('Description:')}
  Scans activities and charities collections for descriptions with DraftJS formatting,
  converts them to Markdown using Gemini API, and updates the database.

  ${chalk.yellow('Note:')} Requires GOOGLE_API_KEY environment variable to be set.

${chalk.bold('DraftJS Detection:')}
  The script detects DraftJS content by looking for JSON objects containing
  'blocks' and 'entityMap' fields, which is the standard DraftJS format.

${chalk.bold('Examples:')}
  pnpm convert-draftjs                          # Convert all DraftJS descriptions
  pnpm convert-draftjs --dry-run                # Preview without changes
  pnpm convert-draftjs --collection activities  # Only process activities
  pnpm convert-draftjs --limit 5 --verbose      # Test with 5 documents, verbose output
  `);
}

/**
 * Check if a string contains DraftJS formatted content
 */
function isDraftJSContent(description: unknown): description is string {
  if (typeof description !== 'string') {
    return false;
  }

  // Quick check - DraftJS content starts with { and contains "blocks"
  if (!description.trim().startsWith('{')) {
    return false;
  }

  try {
    const parsed = JSON.parse(description) as unknown;

    // Check if it has the DraftJS structure
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'blocks' in parsed &&
      Array.isArray((parsed as DraftJSContent).blocks)
    ) {
      // Additional validation - check if blocks have expected structure
      const blocks = (parsed as DraftJSContent).blocks;
      if (blocks.length > 0 && 'text' in blocks[0]! && 'type' in blocks[0]) {
        return true;
      }
    }
  } catch {
    // Not valid JSON, not DraftJS
    return false;
  }

  return false;
}

/**
 * Parse DraftJS content to extract plain text (fallback)
 */
function extractPlainTextFromDraftJS(draftJSString: string): string {
  try {
    const content = JSON.parse(draftJSString) as DraftJSContent;
    return content.blocks.map((block) => block.text).join('\n');
  } catch {
    return draftJSString;
  }
}

/**
 * Convert DraftJS to Markdown using Gemini API
 */
async function convertDraftJSToMarkdown(
  genAI: GoogleGenerativeAI,
  draftJSString: string,
  verbose: boolean
): Promise<ConversionResult> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite-001',
    });

    const prompt = `Convert the following DraftJS JSON content to clean, well-formatted Markdown.

Rules:
1. Preserve all text content and meaning
2. Convert block types to appropriate Markdown:
   - "header-one" → # heading
   - "header-two" → ## heading
   - "header-three" → ### heading
   - "unordered-list-item" → - list item
   - "ordered-list-item" → numbered list
   - "blockquote" → > blockquote
   - "code-block" → \`\`\`code\`\`\`
   - "unstyled" → normal paragraph
3. Apply inline styles:
   - BOLD → **bold**
   - ITALIC → *italic*
   - UNDERLINE → <u>underline</u> or just keep as-is
   - CODE → \`code\`
4. Convert entity links to [text](url) format
5. Maintain proper spacing between paragraphs
6. Remove any empty lines that don't add value
7. Output ONLY the Markdown content, no explanations or code fences

DraftJS Content:
${draftJSString}

Markdown Output:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const markdown = response.text().trim();

    if (verbose) {
      console.log(chalk.dim('\n--- Conversion Preview ---'));
      console.log(
        chalk.dim('Original (first 200 chars):'),
        draftJSString.slice(0, 200)
      );
      console.log(
        chalk.dim('Markdown (first 200 chars):'),
        markdown.slice(0, 200)
      );
      console.log(chalk.dim('--- End Preview ---\n'));
    }

    return {
      success: true,
      original: draftJSString,
      markdown,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Fallback to plain text extraction
    const plainText = extractPlainTextFromDraftJS(draftJSString);

    return {
      success: false,
      original: draftJSString,
      markdown: plainText, // Use plain text as fallback
      error: errorMessage,
    };
  }
}

/**
 * Find documents with DraftJS descriptions in a collection
 */
async function findDraftJSDocuments(
  collection: Collection<Document>,
  limit: number | null,
  verbose: boolean
): Promise<Document[]> {
  // Query for documents where description looks like JSON (starts with {)
  // We'll filter more precisely in code
  const query = {
    description: { $regex: /^\s*\{.*"blocks"/, $options: 's' },
  };

  let cursor = collection.find(query);

  if (limit) {
    cursor = cursor.limit(limit);
  }

  const documents = await cursor.toArray();

  // Filter to only documents with valid DraftJS content
  const draftJSDocs = documents.filter((doc) =>
    isDraftJSContent(doc['description'])
  );

  if (verbose) {
    console.log(
      chalk.dim(
        `  Found ${documents.length} potential documents, ${draftJSDocs.length} confirmed DraftJS`
      )
    );
  }

  return draftJSDocs;
}

/**
 * Process a single collection
 */
async function processCollection(
  db: Db,
  collectionName: string,
  genAI: GoogleGenerativeAI,
  args: CliArgs,
  progressBar: cliProgress.SingleBar
): Promise<{ processed: number; updated: number; failed: number }> {
  const collection = db.collection(collectionName);

  console.log(chalk.blue(`\nProcessing ${collectionName} collection...`));

  // Find documents with DraftJS descriptions
  const documents = await findDraftJSDocuments(
    collection,
    args.limit,
    args.verbose
  );

  if (documents.length === 0) {
    console.log(
      chalk.green(`✓ No DraftJS descriptions found in ${collectionName}`)
    );
    return { processed: 0, updated: 0, failed: 0 };
  }

  console.log(
    chalk.cyan(`Found ${documents.length} documents with DraftJS descriptions`)
  );

  let processed = 0;
  let updated = 0;
  let failed = 0;

  progressBar.start(documents.length, 0);

  for (const doc of documents) {
    const docId = doc['_id'];
    const description = doc['description'] as string;

    try {
      // Convert to Markdown
      const result = await convertDraftJSToMarkdown(
        genAI,
        description,
        args.verbose
      );

      if (result.success && result.markdown) {
        if (!args.dryRun) {
          // Update the document
          await collection.updateOne(
            { _id: docId },
            {
              $set: {
                description: result.markdown,
                _originalDraftJSDescription: description, // Keep backup
                _descriptionConvertedAt: new Date(),
              },
            }
          );
          updated++;
        } else {
          if (args.verbose) {
            console.log(chalk.yellow(`\n[DRY RUN] Would update ${docId}`));
          }
          updated++;
        }
      } else if (result.markdown) {
        // Partial success - used fallback
        if (!args.dryRun) {
          await collection.updateOne(
            { _id: docId },
            {
              $set: {
                description: result.markdown,
                _originalDraftJSDescription: description,
                _descriptionConvertedAt: new Date(),
                _descriptionConversionNote: `Fallback to plain text: ${result.error}`,
              },
            }
          );
          updated++;
        }
        if (args.verbose) {
          console.log(
            chalk.yellow(`\n⚠ ${docId}: Used fallback - ${result.error}`)
          );
        }
      } else {
        failed++;
        if (args.verbose) {
          console.log(chalk.red(`\n✗ ${docId}: ${result.error}`));
        }
      }

      processed++;
      progressBar.update(processed);

      // Add delay to respect API rate limits
      if (processed < documents.length) {
        await sleep(args.delay);
      }
    } catch (error) {
      failed++;
      if (args.verbose && error instanceof Error) {
        console.log(chalk.red(`\n✗ ${docId}: ${error.message}`));
      }
      progressBar.update(++processed);
    }
  }

  progressBar.stop();

  return { processed, updated, failed };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  console.log(chalk.bold.blue('\n=== DraftJS to Markdown Conversion ===\n'));

  // Check for Gemini API key
  const apiKey = process.env['GOOGLE_API_KEY'];
  if (!apiKey) {
    console.error(
      chalk.red('Error: GOOGLE_API_KEY environment variable is not set')
    );
    console.error(
      chalk.yellow('Please set your Google API key in .env.local file.')
    );
    console.error(
      chalk.yellow(
        'Get your API key from: https://makersuite.google.com/app/apikey'
      )
    );
    process.exit(1);
  }

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(apiKey);

  if (args.verbose) {
    console.log(chalk.dim(`MongoDB URI: ${MONGODB_URI}`));
    console.log(chalk.dim(`Collection: ${args.collection}`));
    console.log(chalk.dim(`Dry run: ${args.dryRun}`));
    console.log(chalk.dim(`Delay between calls: ${args.delay}ms`));
    if (args.limit) {
      console.log(chalk.dim(`Limit: ${args.limit} documents`));
    }
    console.log();
  }

  if (args.dryRun) {
    console.log(
      chalk.yellow(
        '🔍 DRY RUN MODE - No changes will be made to the database\n'
      )
    );
  }

  let client: MongoClient | null = null;

  const progressBar = new cliProgress.SingleBar(
    {
      format: 'Progress |{bar}| {percentage}% | {value}/{total} documents',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );

  try {
    // Connect to database
    console.log(chalk.blue('Connecting to MongoDB...'));
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();

    const db = client.db('actionatlas');
    console.log(chalk.green('✓ Connected to MongoDB'));

    // Track totals
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalFailed = 0;

    // Process collections based on args
    const collectionsToProcess: string[] = [];
    if (args.collection === 'all' || args.collection === 'activities') {
      collectionsToProcess.push('activities');
    }
    if (args.collection === 'all' || args.collection === 'charities') {
      collectionsToProcess.push('charities');
    }

    for (const collectionName of collectionsToProcess) {
      const result = await processCollection(
        db,
        collectionName,
        genAI,
        args,
        progressBar
      );
      totalProcessed += result.processed;
      totalUpdated += result.updated;
      totalFailed += result.failed;
    }

    // Show summary
    console.log(chalk.bold.green('\n✓ Conversion completed!\n'));
    console.log(chalk.cyan('Summary:'));
    console.log(chalk.cyan(`  Total processed: ${totalProcessed}`));
    console.log(chalk.green(`  Updated: ${totalUpdated}`));
    if (totalFailed > 0) {
      console.log(chalk.red(`  Failed: ${totalFailed}`));
    }

    if (args.dryRun) {
      console.log(chalk.yellow('\n💡 Run without --dry-run to apply changes'));
    }

    if (totalUpdated > 0 && !args.dryRun) {
      console.log(
        chalk.dim(
          '\n📝 Original DraftJS content backed up to _originalDraftJSDescription field'
        )
      );
    }

    console.log();
  } catch (error) {
    progressBar.stop();
    console.error(chalk.red('\n✗ Conversion failed'));
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
      if (args.verbose && error.stack) {
        console.error(chalk.dim(error.stack));
      }
    }
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
