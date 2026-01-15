#!/usr/bin/env tsx

/**
 * Complete Development Environment Setup Script
 *
 * One-command setup for new developers. This script:
 * 1. Checks Docker is running
 * 2. Verifies MongoDB connection
 * 3. Seeds the database
 * 4. Creates indexes
 * 5. Generates embeddings
 *
 * Usage:
 *   pnpm setup           # Full setup
 *   pnpm setup --skip-embeddings  # Skip embedding generation (faster)
 *   pnpm setup --verbose # Show detailed output
 *   pnpm setup --help    # Show help
 */

import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { config } from 'dotenv';

import {
  connectToDatabase,
  disconnectFromDatabase,
  getDatabase,
  healthCheck,
} from '@action-atlas/database';

const execAsync = promisify(exec);

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

interface CliArgs {
  skipEmbeddings: boolean;
  skipSeed: boolean;
  skipIndexes: boolean;
  verbose: boolean;
  help: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  return {
    skipEmbeddings: args.includes('--skip-embeddings'),
    skipSeed: args.includes('--skip-seed'),
    skipIndexes: args.includes('--skip-indexes'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h'),
  };
}

function showHelp(): void {
  console.log(`
${chalk.bold('Development Environment Setup Script')}

${chalk.bold('Usage:')}
  pnpm setup [options]

${chalk.bold('Options:')}
  --skip-embeddings  Skip embedding generation (faster setup)
  --skip-seed        Skip database seeding (use existing data)
  --skip-indexes     Skip index creation (use existing indexes)
  --verbose, -v      Show detailed output
  --help, -h         Show this help message

${chalk.bold('Description:')}
  Complete one-command setup for new developers. This script will:

  1. Check Docker is running
  2. Verify MongoDB connection
  3. Initialize replica set (if needed)
  4. Seed database with sample data
  5. Create all required indexes
  6. Generate OpenAI embeddings for activities

  ${chalk.yellow('Prerequisites:')}
  - Docker Desktop running
  - MongoDB container started (docker-compose up -d)
  - .env.local file with MONGODB_URI and OPENAI_API_KEY

${chalk.bold('Examples:')}
  pnpm setup                    # Full setup (~5 minutes)
  pnpm setup --skip-embeddings  # Quick setup without embeddings (~1 minute)
  pnpm setup -v                 # Verbose output
  `);
}

async function checkDockerRunning(): Promise<boolean> {
  try {
    await execAsync('docker ps');
    return true;
  } catch {
    return false;
  }
}

async function checkMongoDBContainer(): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      'docker ps --filter "name=mongo_vector_main" --format "{{.Names}}"'
    );
    return stdout.trim().includes('mongo_vector_main');
  } catch {
    return false;
  }
}

async function runScript(
  scriptName: string,
  args: string[] = []
): Promise<void> {
  const scriptPath = path.join(process.cwd(), 'scripts', `${scriptName}.ts`);
  const command = `tsx ${scriptPath} ${args.join(' ')}`;

  const { stdout, stderr } = await execAsync(command);

  if (stdout) {
    console.log(stdout);
  }

  if (stderr && !stderr.includes('Warning:') && !stderr.includes('deprecated')) {
    throw new Error(stderr);
  }
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  console.log(chalk.bold.blue('\n=== Action Atlas Development Setup ===\n'));

  const startTime = Date.now();

  const multiBar = new cliProgress.MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      format: '{step} |{bar}| {percentage}%',
    },
    cliProgress.Presets.shades_grey
  );

  const overallProgress = multiBar.create(100, 0, { step: 'Overall Progress' });

  try {
    // Step 1: Check Docker
    overallProgress.update(5, { step: 'Checking Docker...' });
    console.log(chalk.blue('1. Checking Docker...'));

    const dockerRunning = await checkDockerRunning();
    if (!dockerRunning) {
      multiBar.stop();
      console.error(chalk.red('✗ Docker is not running'));
      console.error(chalk.yellow('Please start Docker Desktop and try again.'));
      process.exit(1);
    }
    console.log(chalk.green('✓ Docker is running\n'));
    overallProgress.update(10);

    // Step 2: Check MongoDB container
    overallProgress.update(15, { step: 'Checking MongoDB container...' });
    console.log(chalk.blue('2. Checking MongoDB container...'));

    const mongoRunning = await checkMongoDBContainer();
    if (!mongoRunning) {
      multiBar.stop();
      console.error(chalk.red('✗ MongoDB container is not running'));
      console.error(
        chalk.yellow('Please run: docker-compose up -d')
      );
      process.exit(1);
    }
    console.log(chalk.green('✓ MongoDB container is running\n'));
    overallProgress.update(20);

    // Step 3: Connect to MongoDB
    overallProgress.update(25, { step: 'Connecting to MongoDB...' });
    console.log(chalk.blue('3. Connecting to MongoDB...'));

    await connectToDatabase();
    const health = await healthCheck();

    if (!health.connected) {
      multiBar.stop();
      console.error(chalk.red('✗ Failed to connect to MongoDB'));
      console.error(chalk.yellow(health.error));
      process.exit(1);
    }
    console.log(chalk.green('✓ Connected to MongoDB\n'));
    overallProgress.update(30);

    // Step 4: Seed database
    if (!args.skipSeed) {
      overallProgress.update(35, { step: 'Seeding database...' });
      console.log(chalk.blue('4. Seeding database...'));

      const db = getDatabase();
      const activityCount = await db.collection('activities').countDocuments();

      if (activityCount > 0) {
        console.log(
          chalk.yellow(`Database already has ${activityCount} activities`)
        );
        console.log(chalk.cyan('Skipping seed (use --force to reseed)\n'));
      } else {
        multiBar.stop();
        await runScript('seed-database', ['--force']);
        multiBar.create(100, 50, { step: 'Overall Progress' });
      }
      overallProgress.update(50);
    } else {
      console.log(chalk.dim('4. Skipping database seeding\n'));
      overallProgress.update(50);
    }

    // Step 5: Create indexes
    if (!args.skipIndexes) {
      overallProgress.update(55, { step: 'Creating indexes...' });
      console.log(chalk.blue('5. Creating indexes...'));

      multiBar.stop();
      await runScript('create-indexes', args.verbose ? ['--verbose'] : []);
      multiBar.create(100, 70, { step: 'Overall Progress' });
      overallProgress.update(70);
    } else {
      console.log(chalk.dim('5. Skipping index creation\n'));
      overallProgress.update(70);
    }

    // Step 6: Generate embeddings
    if (!args.skipEmbeddings) {
      overallProgress.update(75, { step: 'Generating embeddings...' });
      console.log(chalk.blue('6. Generating embeddings...'));

      if (!process.env['OPENAI_API_KEY']) {
        console.log(chalk.yellow('Warning: OPENAI_API_KEY not set'));
        console.log(chalk.yellow('Skipping embedding generation\n'));
      } else {
        multiBar.stop();
        await runScript(
          'generate-embeddings',
          args.verbose ? ['--verbose'] : []
        );
        multiBar.create(100, 95, { step: 'Overall Progress' });
      }
      overallProgress.update(95);
    } else {
      console.log(chalk.dim('6. Skipping embedding generation\n'));
      overallProgress.update(95);
    }

    // Complete
    overallProgress.update(100, { step: 'Setup complete!' });
    multiBar.stop();

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(chalk.bold.green('\n✓ Development environment setup completed!\n'));
    console.log(chalk.cyan(`Total time: ${duration}s\n`));

    // Show next steps
    console.log(chalk.bold('Next steps:'));
    console.log(chalk.cyan('  1. Start the development server: pnpm dev'));
    console.log(chalk.cyan('  2. Open browser: http://localhost:3000'));
    console.log(chalk.cyan('  3. Check database status: pnpm db:status'));
    console.log();

  } catch (error) {
    multiBar.stop();
    console.error(chalk.red('\n✗ Setup failed'));
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
