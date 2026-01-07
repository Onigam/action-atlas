# What's New: Local Vector Search Support

> **January 2026 Update**: Complete architecture revision based on MongoDB 8.2 vector search capabilities.

## 🎉 Major Change: Docker is Now Recommended

### What Changed?

In **September 2025**, MongoDB [announced](https://www.mongodb.com/company/blog/product-release-announcements/supercharge-self-managed-apps-search-vector-search-capabilities) that **vector search is now available in MongoDB Community Edition 8.2**. This fundamentally changes how we approach development environment setup.

### Before (2024 - Early 2025)

**Problem**: Vector search was Atlas-only
- ❌ Required MongoDB Atlas cloud subscription
- ❌ Or separate vector database (ChromaDB, Pinecone)
- ❌ Complex local development setup

**Our Previous Recommendation**: Shared MongoDB Atlas development cluster

### After (September 2025+)

**Solution**: Full vector search in Community Edition
- ✅ Complete `$vectorSearch` support locally
- ✅ No cloud dependencies
- ✅ Works offline
- ✅ Free and open source

**Our New Recommendation**: Docker Compose with MongoDB 8.2

---

## 📊 Impact on Action Atlas

### Old Architecture (Cloud-First)

```
Developer → MongoDB Atlas (Cloud) → Vector Search
            ↑
            Requires internet
            Free tier (512MB limit)
            Shared across team
```

**Pros**: Fast setup, automatic backups
**Cons**: Internet required, cloud dependency

### New Architecture (Local-First)

```
Developer → Docker (Local) → MongoDB 8.2 → mongot → Vector Search
            ↑
            Works offline
            Unlimited storage
            Individual dev environment
```

**Pros**: Offline, unlimited, consistent, free
**Cons**: Requires Docker (very common nowadays)

---

## 🔄 Migration Guide

### If You Were Using MongoDB Atlas

**No action required!** You can continue using Atlas. But consider switching to Docker for:
- Offline development
- Faster local queries
- No internet dependency

**To migrate**:
```bash
# Export from Atlas
mongodump --uri="mongodb+srv://..." --gzip --archive=data/backup.agz

# Start Docker
docker-compose up -d

# Load your data
mongorestore --gzip --archive=data/backup.agz
```

### If You Were Planning Local Setup

**Great timing!** Now you can run everything locally with full vector search support.

**Setup**:
```bash
docker-compose up -d
pnpm install
pnpm dev
```

---

## 🆚 Detailed Comparison

| Aspect | Docker Local (New) | MongoDB Atlas (Previous) |
|--------|--------------------|--------------------------|
| **Vector Search** | ✅ Full `$vectorSearch` | ✅ Full support |
| **Setup Time** | 10 min (first run) | 5 min |
| **Internet Required** | ❌ No (after first download) | ✅ Yes (always) |
| **Cost** | $0 forever | $0 (free tier, 512MB limit) |
| **Storage Limit** | Unlimited (local disk) | 512MB (M0 tier) |
| **Data Isolation** | ✅ Per developer | ❌ Shared |
| **Backup** | Manual (volumes) | ✅ Automatic |
| **Performance** | ⚡ Very fast (local) | 🌐 Network latency |
| **Team Consistency** | ✅ Docker image versioning | ✅ Shared cluster |
| **Production Parity** | ⚠️ Medium | ✅ High |
| **Maintenance** | Low (Docker managed) | Zero (fully managed) |

---

## 📝 What This Means for You

### For New Developers

**Start with Docker!**
- Best developer experience
- Modern, standard approach
- Full feature parity with production
- Works offline (trains, planes, cafes)

**Setup**:
```bash
git clone action-atlas
docker-compose up -d
pnpm dev
```

### For Existing Developers (Using Atlas)

**No rush to migrate**, but consider Docker for:
- Offline development needs
- Experimenting without affecting shared cluster
- Testing schema changes locally
- Faster local queries

**When to stay on Atlas**:
- Team coordination on shared data
- No Docker Desktop available
- Prefer managed service

### For Teams

**Hybrid Approach Recommended**:
- **Development**: Docker (local, fast iteration)
- **Staging**: MongoDB Atlas (test cloud deployment)
- **Production**: MongoDB Atlas (managed, scalable)

---

## 🔍 Technical Details

### What's mongot?

MongoDB's new **search binary** that handles vector indexing and `$vectorSearch` queries.

**In Docker Compose**:
```yaml
services:
  mongot:
    image: mongodb/mongodb-community-search:0.53.1
    environment:
      - MONGODB_URI=mongodb://mongodb:27017
```

**It just works!** No configuration needed.

### Vector Search API Compatibility

The local vector search API is **100% compatible** with Atlas:

```javascript
// Same code works locally and in Atlas
db.activities.aggregate([
  {
    $vectorSearch: {
      index: "activity_vector_search",
      path: "embedding",
      queryVector: [0.123, -0.456, ...], // 1536 dimensions
      numCandidates: 100,
      limit: 20
    }
  }
])
```

No code changes needed when moving to production!

### Data Loading

**First run**:
1. Docker init container downloads `seed-dataset.agz` from GitHub Releases
2. Loads into MongoDB
3. Creates vector search index
4. Takes ~2-3 minutes

**Subsequent runs**:
- Data persisted in Docker volume
- Instant startup (~10 seconds)
- Index already configured

---

## 📚 Updated Documentation

We've reorganized and updated all documentation:

### New Documents
- **[docker-local-setup.md](./docker-local-setup.md)** ⭐ - Complete Docker guide
- **[WHATS-NEW.md](./WHATS-NEW.md)** - This document

### Updated Documents
- **[README.md](./README.md)** - Docker now primary recommendation
- **[data-management.md](./data-management.md)** - Added Docker approach
- **[alternatives.md](./alternatives.md)** - Updated with local vector search context

### Unchanged (Still Valid)
- **[product-vision.md](../product-vision.md)** - Product goals unchanged
- **[architecture.md](../architecture.md)** - Core architecture still valid
- **[tech-stack.md](../tech-stack.md)** - MongoDB Atlas Vector Search still production choice

---

## 🎯 Recommendations by Scenario

### Solo Developer
**Use**: Docker
**Why**: Full control, offline work, fast iteration

### Small Team (2-5)
**Use**: Docker + Optional shared Atlas for collaboration
**Why**: Local speed + cloud coordination when needed

### Growing Team (6-15)
**Use**: Docker local + Staging on Atlas
**Why**: Fast local dev, shared staging for integration testing

### Large Team (15+)
**Use**: Docker local + Atlas for staging/production
**Why**: Professional workflow, proper environments

---

## 🚀 Getting Started

### If You're New to Action Atlas

**Follow the main guide**: [Development Setup README](./README.md)

**TL;DR**:
```bash
git clone action-atlas
docker-compose up -d
pnpm install
pnpm dev
```

### If You're Updating Your Setup

**Check the migration guide**: [Docker Local Setup - Migration Section](./docker-local-setup.md#migration-from-previous-setup)

---

## 🔗 Sources & Further Reading

- [MongoDB Announces Vector Search for Community Edition](https://www.mongodb.com/company/blog/product-release-announcements/supercharge-self-managed-apps-search-vector-search-capabilities) (September 2025)
- [MongoDB 8.2 Release Notes](https://www.mongodb.com/company/blog/mongodb-2025-in-review-2026-predictions)
- [Vector Search Tutorial with Community Edition](https://www.ostberg.dev/work/2025/10/12/mongodb-community-vector-search.html)
- [MongoDB Atlas Local Documentation](https://www.mongodb.com/docs/atlas/cli/current/atlas-cli-deploy-docker/)
- [Docker Hub: mongodb-atlas-local](https://hub.docker.com/r/mongodb/mongodb-atlas-local)

---

## ❓ FAQ

### Q: Do I need to change my code?

**A**: No! The vector search API is identical between local and Atlas.

### Q: Can I still use MongoDB Atlas?

**A**: Yes! Atlas is still recommended for production. Docker is for development.

### Q: What if I don't have Docker?

**A**: Use MongoDB Atlas (cloud) instead. Still works great!

### Q: Is vector search stable in Community Edition?

**A**: It's in **public preview** (as of January 2026). Expected GA in Q1 2026. Safe for development, not yet for production.

### Q: Will this change again?

**A**: Unlikely. This is a major MongoDB platform decision. Vector search in Community Edition is here to stay.

---

**Last Updated**: 2026-01-07
**Impact**: High (Architecture change)
**Action Required**: Optional (Docker setup recommended, not required)
