# Data Directory

> Storage for development data files (excluded from Git).

## Overview

This directory contains the **seed-dataset.agz** data file (26MB MongoDB archive) used for development. Files here are excluded from Git via `.gitignore`.

**👉 For setup instructions, see**: [docs/development-setup/README.md](../docs/development-setup/README.md)

---

## Files

### seed-dataset.agz (Not in Git)

- **Format**: MongoDB BSON archive (gzipped)
- **Size**: 26MB compressed, 109MB uncompressed
- **Contains**: Real charity and volunteering activity data
- **Collections**: `charities` (~50-100 orgs), `activities` (~100+ activities)

---

## Getting the Data

### Recommended: Use Shared MongoDB Atlas

**No file download needed!** Connect directly to the shared development cluster.

```bash
# 1. Get connection string from team
# 2. Add to .env.local:
MONGODB_URI=mongodb+srv://dev-readonly:PASSWORD@action-atlas-dev.mongodb.net/actionatlas-dev

# 3. Start development
pnpm dev
```

**See**: [Development Setup Guide](../docs/development-setup/README.md)

### Alternative: Download File

If using local MongoDB or GitHub Releases approach:

```bash
# Option 1: Automated download
bash scripts/github-releases/download-data.sh

# Option 2: Get from team
# Ask maintainer for the file and place in data/
```

---

## Using the Data File

### Extract to Local MongoDB

```bash
# Start MongoDB
docker run -d -p 27017:27017 --name mongo mongo:latest

# Restore data
mongorestore --gzip --archive=data/seed-dataset.agz \
  --uri="mongodb://localhost:27017/actionatlas"

# Verify
mongosh "mongodb://localhost:27017/actionatlas" \
  --eval "db.activities.countDocuments()"
```

### Transform Schema

```bash
# Transform seed-dataset → Action Atlas schema
pnpm data:transform
```

### Generate Embeddings

```bash
# Set API key
export OPENAI_API_KEY=sk-...

# Generate embeddings (costs ~$1-2)
pnpm data:generate-embeddings
```

---

## File Structure

```
data/
├── .gitkeep              # Keeps directory in Git
├── README.md             # This file
└── seed-dataset.agz     # Data file (in .gitignore)
```

---

## For Maintainers

### Upload New Version

```bash
# Upload to GitHub Release
bash scripts/github-releases/upload-data-release.sh

# OR upload to MongoDB Atlas
pnpm data:upload
```

### Update Team

**For Shared Atlas** (Recommended):
- Upload transformed data to Atlas
- Team automatically gets updates (shared cluster)
- Zero coordination needed

**For GitHub Releases**:
1. Upload new release
2. Update `RELEASE_TAG` in download script
3. Notify team: "Run `pnpm data:update`"

---

## Related Documentation

- **[Development Setup](../docs/development-setup/README.md)** - Main setup guide
- **[Data Management](../docs/development-setup/data-management.md)** - Architecture and decisions
- **[Alternatives](../docs/development-setup/alternatives.md)** - Other approaches
- **[MongoDB Atlas Approach](../scripts/data/README.md)** - Transformation scripts
- **[GitHub Releases Approach](../scripts/github-releases/README.md)** - Distribution scripts

---

**Last Updated**: 2026-01-07
