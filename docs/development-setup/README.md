# Development Environment Setup

> Complete guide for setting up your Action Atlas development environment and managing the seed-dataset POC data.

## 📋 Quick Links

- **New Developer?** → Start with [Quick Start Guide](#quick-start-5-minutes)
- **Need Details?** → Read [Data Management Strategy](./data-management.md)
- **Alternative Approaches?** → See [Alternative Solutions](./alternatives.md)
- **Troubleshooting?** → Check [Common Issues](#troubleshooting)

---

## 🎯 Overview

Action Atlas uses a **26MB MongoDB archive** (`seed-dataset.agz`) containing real charity and volunteering activity data for development. This guide explains how to set up your environment efficiently.

### What's in the Data File?

- **Format**: MongoDB BSON archive (gzipped)
- **Size**: 26MB compressed, 109MB uncompressed
- **Collections**: `charities` (organizations) and `activities` (volunteering opportunities)
- **Source**: seed-dataset POC data
- **Purpose**: Seed data for development and testing

---

## 🚀 Quick Start (10 Minutes)

> **🎉 NEW (January 2026)**: MongoDB vector search now works locally! Docker is now the recommended approach.

### ⭐ Recommended: Docker with Local Vector Search

**Best for**: All teams, offline development, consistent environment

```bash
# 1. Clone repository
git clone https://github.com/YOUR_ORG/action-atlas.git
cd action-atlas

# 2. Start MongoDB with vector search (Docker required)
docker-compose up -d

# Wait for initialization (first run: ~2-3 minutes)
# Check progress: docker-compose logs -f mongodb-init

# 3. Install dependencies
pnpm install

# 4. Set up environment
cp .env.example .env.local

# Edit .env.local:
MONGODB_URI=mongodb://localhost:27017/actionatlas
OPENAI_API_KEY=sk-...  # For search queries only

# 5. Start development
pnpm dev

# 6. Open browser and test!
# http://localhost:3000
```

**What you get:**
- ✅ Full MongoDB 8.2 with vector search support
- ✅ Pre-loaded data with embeddings (from GitHub Releases)
- ✅ Configured vector search indexes
- ✅ Works completely offline
- ✅ $0 cost, no cloud dependencies

**Setup time**: 10 minutes (first run), 30 seconds after
**Cost**: $0/month
**Requirements**: Docker Desktop

**See detailed guide**: [Docker Local Setup](./docker-local-setup.md)

---

### Alternative: Shared MongoDB Atlas (Cloud)

**Best for**: No Docker, quick cloud setup

```bash
# 1-3. Same as above

# 4. Configure cloud connection
# Edit .env.local:
MONGODB_URI=mongodb+srv://dev-readonly:PASSWORD@action-atlas-dev.mongodb.net/actionatlas-dev
OPENAI_API_KEY=sk-...

# 5-6. Same as above
```

**What you get:**
- ✅ Instant setup (no Docker needed)
- ✅ Shared data across team
- ✅ Automatic backups
- ❌ Requires internet connection

**Setup time**: 5 minutes
**Cost**: $0/month (free tier)
**Requirements**: MongoDB Atlas account

> **💡 Why the change?**
> MongoDB released vector search for Community Edition in September 2025. You can now run everything locally - no cloud needed!

---

## 📊 Approach Comparison

| Approach | Setup | Cost | Offline | Vector Search | Consistency | Documentation |
|----------|-------|------|---------|---------------|-------------|---------------|
| **Docker + Local** ⭐ | 10 min | $0 | ✅ Yes | ✅ MongoDB 8.2 | ✅ Perfect | [Docker Setup](./docker-local-setup.md) |
| MongoDB Atlas (cloud) | 5 min | $0 | ❌ No | ✅ Atlas | ✅ Perfect | [Data Management](./data-management.md) |
| GitHub Releases | 15 min | $2/dev | ✅ Yes | ❌ Manual | ❌ Poor | [Alternatives](./alternatives.md#github-releases) |
| Git LFS | 20 min | $0-5 | ✅ Yes | ❌ Manual | ⚠️ Medium | [Alternatives](./alternatives.md#git-lfs) |

**🎉 NEW Recommendation (January 2026)**: Start with **Docker + Local Vector Search** for best developer experience.

---

## 🏗️ Architecture

### Shared Development Database Pattern

```
Developer → Git Clone → Connect to MongoDB Atlas (shared)
                              ↓
                        Pre-seeded data
                        Pre-generated embeddings
                        Configured indexes
                              ↓
                        Start coding immediately
```

### Why This Works

1. **Zero Setup Friction**: No data downloads or transformations
2. **Consistent Results**: Everyone sees identical search results
3. **Cost Effective**: One-time embedding generation (~$2 total)
4. **Production-Like**: Same database technology as production
5. **Instant Updates**: Data updates immediately available to all developers

---

## 🛠️ For Maintainers

### Initial Setup (One-Time)

If you're setting up the shared development environment for the first time:

1. **Create MongoDB Atlas M0 Cluster**
   - Cluster name: `action-atlas-dev`
   - Database: `actionatlas-dev`
   - Create users: `dev-readonly`, `dev-admin`

2. **Transform and Upload Data**
   ```bash
   # Extract seed-dataset.agz
   pnpm data:extract

   # Transform to Action Atlas schema
   pnpm data:transform

   # Generate embeddings (costs ~$1-2)
   pnpm data:generate-embeddings

   # Upload to Atlas
   pnpm data:upload
   ```

3. **Configure Vector Search Index**
   - In MongoDB Atlas UI
   - Follow: [docs/architecture.md](../architecture.md) (search index section)

4. **Share Connection String**
   - Provide `MONGODB_URI` to team members
   - Document in team wiki/secrets manager

**See**: [Data Management Guide](./data-management.md#maintainer-setup) for detailed instructions.

---

## 🔄 Alternative Setups

### Local MongoDB (Optional)

For offline development or schema testing:

```bash
# Start local MongoDB
docker run -d -p 27017:27017 --name mongo mongo:latest

# Update .env.local
MONGODB_URI=mongodb://localhost:27017/actionatlas

# Seed local database
pnpm data:seed-local

# Generate embeddings (costs ~$1-2 per developer)
pnpm data:generate-embeddings
```

**When to use**:
- Offline development
- Testing schema changes
- Personal experimentation

**Trade-offs**:
- Requires embedding generation ($1-2 per developer)
- Data consistency issues across team
- More setup time (~30 minutes)

### GitHub Releases (File Distribution)

For teams that prefer file-based distribution:

```bash
# Download data file
pnpm data:download

# Extract and restore
pnpm data:restore

# Generate embeddings
pnpm data:generate-embeddings
```

**See**: [Alternative Solutions Guide](./alternatives.md#github-releases)

---

## 🔍 Understanding the Data

### seed-dataset.agz Structure

**Collections**:

1. **charities** (Organizations)
   - Fields: `cuid`, `name`, `email`, `website`, `description`, `address`, `geolocation`
   - Translations: Multi-language support
   - Status: Approval workflow

2. **activities** (Volunteering Activities)
   - Fields: `cuid`, `name`, `charity`, `geolocations`, `description`, `status`
   - Indexes: Geospatial (2dsphere), text search
   - Relationships: References to charities

### Schema Transformation

The data is transformed from seed-dataset schema to Action Atlas schema:

**Before (seed-dataset)**:
```json
{
  "cuid": "ckxxx",
  "name": "Activity Name",
  "charity": "ckyyy",
  "geolocations": [{"coordinates": [6.1, 46.2]}],
  "status": "APPROVED"
}
```

**After (Action Atlas)**:
```json
{
  "activityId": "ckxxx",
  "title": "Activity Name",
  "organizationId": "ckyyy",
  "location": {
    "coordinates": {"type": "Point", "coordinates": [6.1, 46.2]}
  },
  "embedding": [...], // 1536-dimensional vector
  "isActive": true
}
```

**See**: [Data Transformation Details](./data-management.md#schema-transformation)

---

## 🐛 Troubleshooting

### Cannot Connect to MongoDB Atlas

**Error**: `MongoServerError: Authentication failed`

**Solutions**:
1. Check `MONGODB_URI` in `.env.local`
2. Verify password doesn't contain special characters (URL encode if needed)
3. Confirm IP address is whitelisted in Atlas (or use `0.0.0.0/0` for dev)
4. Test connection: `pnpm test:connection`

### Search Returns No Results

**Issue**: Vector search not working

**Solutions**:
1. Verify vector search index exists in Atlas UI
2. Check embeddings are generated: `db.activities.findOne({embedding: {$exists: true}})`
3. Confirm index name matches code: `activity_vector_search`
4. Rebuild index if corrupted

### Data Seems Outdated

**Issue**: Activities don't match expected data

**Solutions**:
1. Check database name: Should be `actionatlas-dev`
2. Verify connection string points to correct cluster
3. Contact maintainer for data refresh
4. Check last update: `db.activities.findOne({}, {sort: {updatedAt: -1}})`

### Embedding Generation Fails

**Error**: `OpenAI API rate limit exceeded`

**Solutions**:
1. Check `OPENAI_API_KEY` is valid
2. Verify API key has sufficient credits
3. Use batch mode with delays: `pnpm data:generate-embeddings --batch-size=50`
4. Contact maintainer to share pre-generated embeddings

---

## 📚 Additional Resources

### Documentation

- **[Data Management Strategy](./data-management.md)** - Complete architecture and decisions
- **[Alternative Solutions](./alternatives.md)** - GitHub Releases, Git LFS, AWS S3
- **[System Architecture](../architecture.md)** - Overall Action Atlas architecture
- **[Tech Stack](../tech-stack.md)** - Technology decisions

### Scripts

- **`scripts/data/`** - MongoDB Atlas approach (transformation, embeddings)
- **`scripts/github-releases/`** - File distribution approach
- **`data/`** - Data directory (gitignored)

### Related Milestones

- **[Milestone 2.4](../milestones.md)** - Database seeding
- **[Milestone 3.4](../milestones.md)** - Embedding generation

---

## 💰 Cost Summary

| Approach | One-Time | Monthly | Per Developer |
|----------|----------|---------|---------------|
| **Shared MongoDB Atlas** | $1-2 | $0 | $0 |
| GitHub Releases + Local | $0 | $0 | $1-2 (embeddings) |
| Git LFS | $0 | $0-5 | $1-2 (embeddings) |
| AWS S3 | $0 | $0.10 | $1-2 (embeddings) |

**Key Insight**: Shared approach saves $1-2 per developer by generating embeddings once.

---

## 🎯 Next Steps

### For New Developers

1. ✅ Follow [Quick Start](#quick-start-5-minutes)
2. ✅ Test search: `curl http://localhost:3000/api/search -d '{"query":"help kids"}'`
3. ✅ Read [System Architecture](../architecture.md)
4. ✅ Start building!

### For Maintainers

1. ✅ Set up MongoDB Atlas cluster (if not done)
2. ✅ Transform and upload data (one-time)
3. ✅ Generate embeddings (one-time, ~$2)
4. ✅ Share connection string with team

### For Teams Considering Alternatives

1. ✅ Review [Alternative Solutions](./alternatives.md)
2. ✅ Evaluate trade-offs for your team size
3. ✅ Consider migration path: Atlas → Git LFS → S3

---

## 📞 Support

**Questions?**
- Check [Troubleshooting](#troubleshooting)
- Read [Data Management Guide](./data-management.md)
- Ask in team chat
- Create GitHub issue

**Found a bug in data?**
- Report to maintainer
- Include query and expected vs. actual results
- Check `activityId` for tracing

---

**Last Updated**: 2026-01-07
**Version**: 1.0
**Status**: Recommended for MVP development
