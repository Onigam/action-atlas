# Development Environment Setup

> Complete guide for setting up your Action Atlas development environment and managing the thegoodsearch POC data.

## 📋 Quick Links

- **New Developer?** → Start with [Quick Start Guide](#quick-start-5-minutes)
- **Need Details?** → Read [Data Management Strategy](./data-management.md)
- **Alternative Approaches?** → See [Alternative Solutions](./alternatives.md)
- **Troubleshooting?** → Check [Common Issues](#troubleshooting)

---

## 🎯 Overview

Action Atlas uses a **26MB MongoDB archive** (`thegoodsearch.agz`) containing real charity and volunteering activity data for development. This guide explains how to set up your environment efficiently.

### What's in the Data File?

- **Format**: MongoDB BSON archive (gzipped)
- **Size**: 26MB compressed, 109MB uncompressed
- **Collections**: `charities` (organizations) and `activities` (volunteering opportunities)
- **Source**: thegoodsearch POC data
- **Purpose**: Seed data for development and testing

---

## 🚀 Quick Start (5 Minutes)

### Recommended: Shared MongoDB Atlas

**Best for**: MVP development, small teams, fastest setup

```bash
# 1. Clone repository
git clone https://github.com/YOUR_ORG/action-atlas.git
cd action-atlas

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local

# 4. Add MongoDB Atlas connection (get from team)
# Edit .env.local:
MONGODB_URI=mongodb+srv://dev-readonly:PASSWORD@action-atlas-dev.mongodb.net/actionatlas-dev

# Optional: Only if testing search functionality
OPENAI_API_KEY=sk-...  # Get from https://platform.openai.com/api-keys

# 5. Start development
pnpm dev

# 6. Open browser
# http://localhost:3000
```

**That's it!** The shared development database already contains:
- ✅ Transformed activity data (Action Atlas schema)
- ✅ Generated vector embeddings (no OpenAI key needed for this!)
- ✅ Configured search indexes
- ✅ Ready to query

**Setup time**: 5 minutes
**Cost**: $0 (or ~$0.01 if testing many searches)
**Onboarding friction**: Minimal

> **💡 About the OpenAI API Key:**
> - **NOT required** for: UI development, database work, browsing activities
> - **Only required** for: Testing the search functionality (query embedding)
> - **Cost**: ~$0.00002 per search query (20 searches = $0.0004)
> - **Activity embeddings** are already in the database (pre-generated)

---

## 📊 Approach Comparison

| Approach | Setup | Cost | Best For | Documentation |
|----------|-------|------|----------|---------------|
| **Shared MongoDB Atlas** | 5 min | $0 | MVP, teams | [Data Management](./data-management.md) |
| GitHub Releases | 10 min | $0 | File distribution | [Alternatives](./alternatives.md#github-releases) |
| Git LFS | 15 min | $0-5 | Version control | [Alternatives](./alternatives.md#git-lfs) |
| AWS S3 | 30 min | $0.10 | Production scale | [Alternatives](./alternatives.md#aws-s3) |

**Recommendation**: Start with **Shared MongoDB Atlas** for fastest development, migrate later if needed.

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
   # Extract thegoodsearch.agz
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

### thegoodsearch.agz Structure

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

The data is transformed from thegoodsearch schema to Action Atlas schema:

**Before (thegoodsearch)**:
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
