# Data Management Scripts (MongoDB Atlas Approach)

> Scripts for transforming seed-dataset data and uploading to MongoDB Atlas.

## Overview

These scripts support the **recommended approach**: Shared MongoDB Atlas development cluster.

**See**: [docs/development-setup/README.md](../../docs/development-setup/README.md)

---

## Scripts

### transform-seed-dataset.ts

Transforms seed-dataset schema to Action Atlas schema.

**Purpose**:
- Extract `charities` → `organizations`
- Transform `activities` schema
- Parse Draft.js descriptions to plain text
- Extract primary geolocations
- Infer categories from content

**Usage**:
```bash
# Prerequisites: Local MongoDB with seed-dataset data
mongorestore --gzip --archive=seed-dataset.agz \
  --uri="mongodb://localhost:27017/seed-dataset_raw"

# Run transformation
pnpm data:transform

# Output: actionatlas database with transformed collections
```

**Status**: 🚧 To be implemented

---

### generate-embeddings.ts

Generates vector embeddings for all activities using OpenAI API.

**Purpose**:
- Batch process activities
- Generate 1536-dimensional vectors
- Update MongoDB documents with embeddings
- Estimate and track costs

**Usage**:
```bash
# Set API key
export OPENAI_API_KEY=sk-...

# Generate embeddings
pnpm data:generate-embeddings

# Options:
# --batch-size=100    # Process 100 at a time
# --incremental       # Only generate for new activities
```

**Cost**: ~$0.0003 per 100 activities (text-embedding-3-small)

**Status**: 🚧 To be implemented (enhance existing script from Milestone 3.4)

---

### upload-to-atlas.ts

Uploads transformed data and embeddings to MongoDB Atlas development cluster.

**Purpose**:
- Export from local MongoDB
- Upload to Atlas cluster
- Verify data integrity
- Configure connection

**Usage**:
```bash
# Prerequisites: Transformed data in local MongoDB

# Set Atlas connection
export ATLAS_URI=mongodb+srv://dev-admin:PASSWORD@...

# Upload
pnpm data:upload

# Verifies:
# - All activities uploaded
# - All embeddings present
# - Indexes created
```

**Status**: 🚧 To be implemented

---

## Workflow

**One-Time Setup (Maintainer)**:

```bash
# 1. Extract seed-dataset.agz
mongorestore --gzip --archive=seed-dataset.agz \
  --uri="mongodb://localhost:27017/seed-dataset_raw"

# 2. Transform schema
pnpm data:transform

# 3. Generate embeddings (costs ~$2)
export OPENAI_API_KEY=sk-...
pnpm data:generate-embeddings

# 4. Upload to Atlas
export ATLAS_URI=mongodb+srv://...
pnpm data:upload

# 5. Configure vector search index in Atlas UI
```

**Developer Setup (5 minutes)**:

```bash
# 1. Get connection string from team
# 2. Add to .env.local:
MONGODB_URI=mongodb+srv://dev-readonly:PASSWORD@...

# 3. Start development
pnpm dev
```

---

## Related Documentation

- [Development Setup Guide](../../docs/development-setup/README.md)
- [Data Management Strategy](../../docs/development-setup/data-management.md)
- [System Architecture](../../docs/architecture.md)

---

**Last Updated**: 2026-01-07
