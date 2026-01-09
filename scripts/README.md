# Action Atlas DevOps Scripts

This directory contains automation scripts for database operations, development environment setup, and deployment.

## Quick Reference

```bash
# Full development setup (one command)
pnpm setup

# Database operations
pnpm seed                    # Load seed data
pnpm create-indexes          # Create MongoDB indexes
pnpm generate-embeddings     # Generate OpenAI embeddings

# Database utilities
pnpm db:status              # Check database status
pnpm db:reset               # Reset database (destructive!)
```

## Scripts Overview

### 1. Complete Setup (`setup-dev.ts`)

**Command:** `pnpm setup`

One-command setup for new developers. Runs the complete initialization sequence:

1. Checks Docker is running
2. Verifies MongoDB container
3. Connects to MongoDB
4. Seeds database with sample data
5. Creates all required indexes
6. Generates embeddings for activities

**Options:**
- `--skip-embeddings` - Skip embedding generation (faster, ~1 minute)
- `--skip-seed` - Use existing database data
- `--skip-indexes` - Use existing indexes
- `--verbose` - Show detailed output

**Examples:**
```bash
pnpm setup                    # Full setup (~5 minutes)
pnpm setup --skip-embeddings  # Quick setup without embeddings
pnpm setup -v                 # Verbose output
```

**Prerequisites:**
- Docker Desktop running
- MongoDB container started: `docker-compose up -d`
- `.env.local` file with `MONGODB_URI` and `OPENAI_API_KEY`

### 2. Database Seeding (`seed-database.ts`)

**Command:** `pnpm seed`

Loads sample activities and organizations from the seed data archive.

**Options:**
- `--force` - Overwrite existing data without prompts
- `--verbose` - Show detailed MongoDB output

**Examples:**
```bash
pnpm seed           # Interactive (prompts if data exists)
pnpm seed --force   # Force overwrite
pnpm seed -v        # Verbose output
```

**What it does:**
- Checks if seed data file exists (`data/seed-dataset.agz`)
- Prompts for confirmation if data already exists
- Drops existing collections
- Loads data using `mongorestore`
- Verifies data loaded successfully
- Reports statistics

**Seed Data:**
- Location: `/data/seed-dataset.agz`
- Size: 26MB
- Format: MongoDB archive (gzip compressed)
- Contains: Sample activities and organizations for development

### 3. Index Creation (`create-indexes.ts`)

**Command:** `pnpm create-indexes`

Creates all required MongoDB indexes for optimal query performance.

**Options:**
- `--drop` - Drop existing indexes before creating new ones
- `--skip-vector` - Skip vector search index creation
- `--verbose` - Show detailed output

**Examples:**
```bash
pnpm create-indexes         # Create all indexes
pnpm create-indexes --drop  # Recreate all indexes
pnpm create-indexes -v      # Verbose output
```

**Indexes Created:**

**Activities Collection:**
- `category_active_location` - Compound index for filtering + geospatial
- `text_search` - Text index for keyword fallback
- `organization_active` - Filter by organization
- `created_date` - Sort by creation date
- `activity_vector_search` - Vector search (Atlas only)

**Organizations Collection:**
- `organization_id` - Unique identifier
- `location_coordinates` - Geospatial index

**Note:** Vector search index must be created via MongoDB Atlas UI or CLI. The script will display the required configuration.

### 4. Embedding Generation (`generate-embeddings.ts`)

**Command:** `pnpm generate-embeddings`

Generates OpenAI embeddings for activities that don't have them.

**Options:**
- `--batch <n>` - Activities per batch (default: 50)
- `--limit <n>` - Maximum activities to process (default: all)
- `--delay <ms>` - Delay between batches (default: 1000ms)
- `--verbose` - Show detailed output

**Examples:**
```bash
pnpm generate-embeddings              # Process all activities
pnpm generate-embeddings --batch 100  # Larger batches
pnpm generate-embeddings --limit 50   # Test with 50 activities
pnpm generate-embeddings -v           # Verbose output
```

**Features:**
- Progress bar with real-time updates
- Automatic batching to respect rate limits
- Token usage tracking
- Cost estimation
- Resume on failure (idempotent)
- Retry logic for rate limit errors

**Performance:**
- Model: `text-embedding-3-small`
- Dimensions: 1536
- Cost: $0.02 per 1M tokens
- Average activity: ~200 tokens
- 1000 activities: ~$0.004

**Rate Limits:**
- OpenAI Tier 1: 3M tokens/min, 3000 requests/min
- Script includes delays between batches
- Adjust `--batch` and `--delay` if hitting rate limits

### 5. Database Status Check (`check-database.ts`)

**Command:** `pnpm db:status`

Checks database connection, counts documents, and verifies indexes.

**Options:**
- `--verbose` - Show detailed information
- `--json` - Output as JSON

**Examples:**
```bash
pnpm db:status       # Basic status check
pnpm db:status -v    # Detailed information
pnpm db:status --json # JSON output
```

**Information Displayed:**
- Connection status
- Document counts (activities, organizations)
- Index counts
- Embedding coverage
- Database statistics (size, storage)

**Use Cases:**
- Verify setup completed successfully
- Check if embeddings need generation
- Monitor database health
- CI/CD pipeline checks

### 6. Database Reset (`reset-database.ts`)

**Command:** `pnpm db:reset`

Drops all collections from the database.

**Options:**
- `--force` - Skip confirmation prompts (dangerous!)
- `--no-seed` - Don't reseed after reset
- `--verbose` - Show detailed output

**Examples:**
```bash
pnpm db:reset              # Interactive with confirmations
pnpm db:reset --force      # Force reset (no prompts)
pnpm db:reset --no-seed    # Reset but don't reseed
```

**Warning:** This operation is DESTRUCTIVE and cannot be undone!

**What gets deleted:**
- All activities
- All organizations
- All indexes
- All embeddings

**Safety Features:**
- Double confirmation required (unless `--force`)
- Shows what will be deleted
- Suggests next steps after reset

## Environment Variables

All scripts require these environment variables in `.env.local`:

```bash
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/actionatlas

# OpenAI API key (required for embeddings)
OPENAI_API_KEY=sk-proj-your-key-here
```

## Development Workflow

### Initial Setup (New Developer)

```bash
# 1. Clone repository
git clone <repo-url>
cd action-atlas

# 2. Install dependencies
pnpm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local with your OPENAI_API_KEY

# 4. Start Docker
docker-compose up -d

# 5. Run complete setup
pnpm setup

# 6. Start development server
pnpm dev
```

### Daily Development

```bash
# Start Docker (if not running)
docker-compose up -d

# Check database status
pnpm db:status

# Start development server
pnpm dev
```

### Resetting Development Environment

```bash
# Option 1: Reset database only
pnpm db:reset
pnpm setup

# Option 2: Full Docker reset
docker-compose down -v
docker-compose up -d
pnpm setup
```

### Testing Workflow

```bash
# Use separate test database
MONGODB_URI=mongodb://localhost:27017/actionatlas_test pnpm seed
MONGODB_URI=mongodb://localhost:27017/actionatlas_test pnpm create-indexes

# Run tests
pnpm test
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Setup Database
  run: |
    docker-compose up -d
    sleep 10  # Wait for MongoDB
    pnpm setup --skip-embeddings
  env:
    MONGODB_URI: mongodb://localhost:27017/actionatlas
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

- name: Check Database Status
  run: pnpm db:status --json
```

## Troubleshooting

### MongoDB Connection Failed

```bash
# Check Docker is running
docker ps

# Check MongoDB container
docker logs action-atlas-mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Seed Data Not Found

```bash
# Check file exists
ls -lh data/seed-dataset.agz

# File should be 26MB
# If missing, restore from backup or download from releases
```

### Embedding Generation Fails

```bash
# Check OpenAI API key
echo $OPENAI_API_KEY

# Check rate limits
# Reduce batch size or increase delay
pnpm generate-embeddings --batch 25 --delay 2000
```

### Indexes Not Created

```bash
# Drop and recreate indexes
pnpm create-indexes --drop

# Check index status
pnpm db:status -v
```

## Script Architecture

### Dependencies

- **tsx** - TypeScript execution
- **chalk** - Terminal colors
- **cli-progress** - Progress bars
- **dotenv** - Environment variables
- **@action-atlas/database** - Database operations
- **@action-atlas/ai** - AI/embedding services

### Error Handling

All scripts include:
- Try-catch blocks with proper error messages
- Graceful connection cleanup
- Exit codes (0 = success, 1 = failure)
- Verbose mode for debugging

### Idempotency

Scripts are designed to be idempotent:
- Safe to run multiple times
- Check existing state before operations
- Skip unnecessary work
- Resume from last successful state

### Progress Indicators

Scripts use `cli-progress` for:
- Real-time progress bars
- Status messages
- Token/cost tracking
- Time estimates

## Performance Targets

- **Setup (full):** < 5 minutes
- **Setup (no embeddings):** < 1 minute
- **Seeding:** < 30 seconds
- **Index creation:** < 10 seconds
- **Embedding generation (1000 activities):** < 2 minutes

## Best Practices

1. **Always run `pnpm db:status`** before making changes
2. **Use `--verbose`** when debugging issues
3. **Test scripts with `--limit`** before full runs
4. **Backup data** before running `pnpm db:reset`
5. **Monitor costs** when generating embeddings
6. **Use `--skip-embeddings`** for faster setup during development

## Additional Resources

- [CLAUDE.md](/CLAUDE.md) - Project development guide
- [DOCKER_OPERATIONS.md](/docs/DOCKER_OPERATIONS.md) - Docker operations guide
- [Database Package](/packages/database/README.md) - Database documentation
- [AI Package](/packages/ai/README.md) - AI services documentation

---

**Last Updated:** 2026-01-09
**Scripts Version:** 1.0.0
**Status:** Production-ready
