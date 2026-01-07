# Alternative Data Management Solutions

> Alternative approaches to the recommended MongoDB Atlas shared development cluster.

## Overview

While we recommend **Shared MongoDB Atlas** for most teams, these alternatives may be suitable for specific situations:

- **GitHub Releases** - File distribution, no cloud dependency
- **Git LFS** - Version control for data files
- **AWS S3** - Cloud storage with fine-grained access
- **Local MongoDB** - Full developer isolation

---

## GitHub Releases

### Overview

Distribute the `seed-dataset.agz` file via GitHub Releases, developers download on setup.

### When to Use

✅ **Good for**:
- Teams without cloud accounts
- Offline-first development
- Simple file distribution
- No vendor lock-in

❌ **Not ideal for**:
- Need for consistent embeddings
- Frequent data updates
- Large teams (>10 developers)

### Setup

**Maintainer**:
```bash
# Upload data file to GitHub Release
gh release create v1.0-data \
  seed-dataset.agz \
  --title "Development Data v1.0" \
  --notes "Initial POC data"
```

**Developer**:
```bash
# Download from release
bash scripts/github-releases/download-data.sh

# Extract and restore
mongorestore --gzip --archive=seed-dataset.agz \
  --uri="mongodb://localhost:27017/actionatlas"

# Generate embeddings (costs $1-2 per developer)
pnpm data:generate-embeddings
```

### Cost

- **Storage**: $0 (unlimited)
- **Bandwidth**: $0 (unlimited)
- **Per Developer**: $1-2 (embeddings)
- **Team of 5**: $5-10 total

### Pros & Cons

**Pros**:
- Zero infrastructure cost
- No cloud dependency
- Full control over data
- Works offline after download

**Cons**:
- Each developer generates embeddings ($1-2)
- Inconsistent embeddings across team
- Manual download step
- No shared updates

---

## Git LFS (Large File Storage)

### Overview

Store data files in Git LFS while keeping repository small.

### When to Use

✅ **Good for**:
- Teams already using Git extensively
- Need version control for data
- Files 50MB-500MB
- Infrequent updates

❌ **Not ideal for**:
- Very large files (>500MB)
- Frequent updates (bandwidth costs)
- Team size >20 (bandwidth limits)

### Setup

**Install Git LFS**:
```bash
# macOS
brew install git-lfs

# Ubuntu
sudo apt-get install git-lfs

# Initialize
git lfs install
```

**Track Data Files**:
```bash
# Track .agz files
git lfs track "*.agz"
git add .gitattributes

# Add data file
git add seed-dataset.agz
git commit -m "Add development data via Git LFS"
git push
```

**Developer Setup**:
```bash
# Clone repository (LFS files download automatically)
git clone https://github.com/YOUR_ORG/action-atlas.git

# If LFS not installed initially
git lfs install
git lfs pull

# Restore to MongoDB
mongorestore --gzip --archive=seed-dataset.agz \
  --uri="mongodb://localhost:27017/actionatlas"

# Generate embeddings
pnpm data:generate-embeddings
```

### Cost (GitHub)

- **Free tier**: 1GB storage + 1GB bandwidth/month
- **Paid**: $5/month for 50GB storage + 50GB bandwidth
- **Per developer**: $1-2 (embeddings)

**Estimate for 26MB file**:
- Storage: 0.026GB (fits in free tier)
- 5 developers × 1 clone = 0.13GB (fits in free tier)
- **Total**: $0-5/month

### Pros & Cons

**Pros**:
- Integrated with Git workflow
- Version history preserved
- Familiar tools
- Good for teams 5-20

**Cons**:
- Additional tool installation
- Bandwidth costs at scale
- Each developer still generates embeddings
- Confusion if LFS not installed ("pointer files")

---

## AWS S3 (Cloud Storage)

### Overview

Store data in AWS S3, provide presigned URLs or IAM access to developers.

### When to Use

✅ **Good for**:
- Production-scale needs
- Multiple environments (dev/staging/prod)
- Need fine-grained access control
- Large teams (>20 developers)

❌ **Not ideal for**:
- MVP/early stage
- Small teams
- No AWS experience
- Cost sensitivity

### Setup

**Create S3 Bucket**:
```bash
# Install AWS CLI
brew install awscli

# Configure credentials
aws configure

# Create bucket
aws s3 mb s3://action-atlas-data --region us-east-1

# Upload data
aws s3 cp seed-dataset.agz s3://action-atlas-data/ \
  --storage-class INTELLIGENT_TIERING
```

**Developer Access (Presigned URL)**:
```bash
# Maintainer generates temporary URL
aws s3 presign s3://action-atlas-data/seed-dataset.agz \
  --expires-in 3600  # 1 hour

# Share URL with developers
# Developers download:
curl -o seed-dataset.agz "https://...presigned-url..."
```

**Developer Access (IAM)**:
```bash
# Developers with AWS credentials
aws s3 cp s3://action-atlas-data/seed-dataset.agz .

# Restore to MongoDB
mongorestore --gzip --archive=seed-dataset.agz \
  --uri="mongodb://localhost:27017/actionatlas"

# Generate embeddings
pnpm data:generate-embeddings
```

### Cost

- **Storage**: $0.023/GB/month = $0.0006/month
- **GET requests**: $0.0004 per 1,000 = negligible
- **Data transfer**: First 100GB free, then $0.09/GB
- **Per developer**: $1-2 (embeddings)

**Estimate**: $0.10/month (essentially free at this scale)

### Pros & Cons

**Pros**:
- Infinite scalability
- Fine-grained access control (IAM)
- Versioning built-in
- Production-ready

**Cons**:
- AWS account complexity
- IAM setup required
- Vendor lock-in
- Overkill for MVP

---

## Local MongoDB (Per-Developer)

### Overview

Each developer runs local MongoDB and generates their own data/embeddings.

### When to Use

✅ **Good for**:
- Offline development (trains, planes)
- Schema testing and experiments
- Learning/exploration
- Privacy concerns

❌ **Not ideal for**:
- Team consistency
- Cost optimization
- Onboarding speed

### Setup

**Start Local MongoDB**:
```bash
# Docker (recommended)
docker run -d -p 27017:27017 --name mongo mongo:latest

# Or install natively
brew install mongodb-community  # macOS
# See: https://www.mongodb.com/docs/manual/installation/
```

**Restore Data**:
```bash
# Get data file (from GitHub Releases or team)
# Extract to local MongoDB
mongorestore --gzip --archive=seed-dataset.agz \
  --uri="mongodb://localhost:27017/actionatlas"
```

**Transform Schema**:
```bash
# Run transformation scripts
pnpm data:transform

# Generate embeddings (costs $1-2)
export OPENAI_API_KEY=sk-...
pnpm data:generate-embeddings
```

**Update Environment**:
```env
# .env.local
MONGODB_URI=mongodb://localhost:27017/actionatlas
OPENAI_API_KEY=your_key
```

### Cost

- **MongoDB**: $0 (Docker/local)
- **Data transfer**: $0 (local files)
- **Per developer**: $1-2 (embeddings)
- **Team of 5**: $5-10 total

### Pros & Cons

**Pros**:
- Full control and isolation
- Works completely offline
- Fast queries (local)
- Good for experiments

**Cons**:
- Inconsistent data across team
- $1-2 cost per developer
- 30-minute setup time
- Resource usage (RAM, disk)

---

## DVC (Data Version Control)

### Overview

Git-like version control specifically for data files, works with any storage backend.

### When to Use

✅ **Good for**:
- ML/data science teams
- Multiple datasets and experiments
- Need pipeline orchestration
- Tracking model performance

❌ **Not ideal for**:
- Simple seed data
- Non-ML workflows
- Small teams
- MVP stage

### Setup

**Install DVC**:
```bash
pip install dvc dvc-s3  # or dvc-gs, dvc-azure
```

**Initialize**:
```bash
# Initialize DVC in repository
dvc init

# Configure remote (e.g., S3)
dvc remote add -d storage s3://action-atlas-dvc/data

# Add data file
dvc add thegseed-datasetoodsearch.agz
git add seed-dataset.agz.dvc .dvc/config
git commit -m "Track data with DVC"

# Push to remote
dvc push
```

**Developer Setup**:
```bash
# Clone repository
git clone https://github.com/YOUR_ORG/action-atlas.git

# Pull data from DVC remote
dvc pull

# Data file now available locally
# Proceed with restore and embedding generation
```

### Cost

- **DVC**: $0 (open source)
- **Storage backend**: Same as S3/GCS ($0.10/month)
- **Per developer**: $1-2 (embeddings)

### Pros & Cons

**Pros**:
- Purpose-built for data versioning
- Storage-agnostic (S3, GCS, Azure, SSH)
- Pipeline orchestration
- Experiment tracking

**Cons**:
- **Overkill for simple seed data**
- Steeper learning curve
- Additional tooling complexity
- More conceptual overhead

---

## Comparison Matrix

| Solution | Setup Time | Monthly Cost | Per-Dev Cost | Consistency | Offline | Best For |
|----------|-----------|--------------|--------------|-------------|---------|----------|
| **MongoDB Atlas** (Recommended) | 5 min | $0 | $0 | Perfect | No | MVP, teams 1-10 |
| **GitHub Releases** | 10 min | $0 | $1-2 | Poor | Yes | Offline-first |
| **Git LFS** | 15 min | $0-5 | $1-2 | Medium | Yes | Git-centric teams |
| **AWS S3** | 30 min | $0.10 | $1-2 | Medium | Yes | Scale, production |
| **Local MongoDB** | 30 min | $0 | $1-2 | Poor | Yes | Individual devs |
| **DVC** | 60 min | $0.10 | $1-2 | Good | Yes | ML/data teams |

---

## Migration Scenarios

### Scenario 1: Start with GitHub Releases → Migrate to Atlas

**When**: Initial offline development, then want consistency

```bash
# Phase 1: GitHub Releases (Week 1-2)
# Developers work locally with downloaded data

# Phase 2: Create shared Atlas cluster (Week 3)
# One person uploads data to Atlas

# Phase 3: Team switches to Atlas (Week 3+)
# Update README, team uses shared cluster
```

**Cost**: $0 → $0 (free tier)
**Effort**: Low (4 hours)

### Scenario 2: Atlas M0 → Atlas M10 (Scale Up)

**When**: Storage exceeds 400MB or need production features

```bash
# In MongoDB Atlas UI
# Cluster → Edit Configuration → Upgrade to M10
# Zero downtime, automatic migration
```

**Cost**: $0 → $57/month
**Effort**: Trivial (10 minutes)

### Scenario 3: Atlas → Git LFS (Local-First)

**When**: Team wants local-first development

```bash
# Export from Atlas
mongodump --uri="..." --archive=data.agz --gzip

# Setup Git LFS
git lfs install
git lfs track "*.agz"
git add .gitattributes data.agz
git commit && git push

# Update README for new setup process
```

**Cost**: $0 → $5/month
**Effort**: Medium (2-3 hours)

---

## Recommendations by Team Size

### Solo Developer (1 person)

**Recommended**: Local MongoDB or GitHub Releases
- No coordination needed
- Offline work flexibility
- Simplest setup

### Small Team (2-5 people)

**Recommended**: Shared MongoDB Atlas
- Best balance of simplicity and consistency
- Zero cost
- Fast onboarding

### Growing Team (6-15 people)

**Recommended**: Shared MongoDB Atlas or Git LFS
- Atlas for cloud-first teams
- Git LFS for local-first teams
- Still cost-effective

### Large Team (15+ people)

**Recommended**: AWS S3 with IAM or DVC
- Fine-grained access control
- Multiple environments
- Production-grade infrastructure

---

## Scripts Available

### GitHub Releases Approach
Location: `scripts/github-releases/`
- `download-data.sh` - Download from release
- `upload-data-release.sh` - Upload new version
- `verify-data-checksum.sh` - Verify integrity
- `setup-dev-environment.sh` - Complete setup

---

## Getting Help

**Questions about alternatives?**
- Read [Data Management Guide](./data-management.md)
- Check [System Architecture](../architecture.md)
- Ask in team chat

**Want to switch approaches?**
- Review migration scenarios above
- Estimate effort and cost
- Plan transition timeline
- Update team documentation

---

**Last Updated**: 2026-01-07
**Version**: 1.0
