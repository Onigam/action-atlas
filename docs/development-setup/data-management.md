# Data Management Strategy

> Comprehensive guide to managing the thegoodsearch POC data for Action Atlas development.

## Table of Contents

- [Overview](#overview)
- [Architecture Decision](#architecture-decision)
- [Data File Analysis](#data-file-analysis)
- [Recommended Solution](#recommended-solution)
- [Implementation Guide](#implementation-guide)
- [Schema Transformation](#schema-transformation)
- [Embedding Generation](#embedding-generation)
- [Cost Analysis](#cost-analysis)
- [Migration Paths](#migration-paths)

---

## Overview

### The Challenge

Action Atlas requires seed data for development containing real volunteering activities and organizations. The source data is a **26MB MongoDB archive** (`thegoodsearch.agz`) from the thegoodsearch POC containing:

- **109MB uncompressed** MongoDB BSON data
- **2 collections**: `charities` and `activities`
- **100+ real volunteering activities** with geolocation data
- **Multi-language** content (French/English)

### The Problem

Distributing this data to developers presents several challenges:

1. **Git Anti-Pattern**: Committing 26MB binary files bloats repository permanently
2. **Embedding Cost**: Each developer generating embeddings costs $1-2 × team size
3. **Consistency**: Different developers might have different data versions
4. **Schema Mismatch**: thegoodsearch schema differs from Action Atlas schema
5. **Setup Friction**: Complex onboarding reduces developer velocity

---

## Architecture Decision

### ✅ Recommended: Shared MongoDB Atlas Development Cluster

After comprehensive analysis by research, DevOps, and architecture review agents, the recommended solution is:

**Pattern**: Cloud-First Development Data

```
┌─────────────────────────────────────────────────────────────┐
│  Git Repository (Code Only)                                 │
│  ├── scripts/data/ (transformation scripts)                 │
│  ├── .gitignore → *.agz (exclude binaries)                  │
│  └── README → "Connect to shared Atlas cluster"            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  MongoDB Atlas M0 Sandbox (FREE)                            │
│  ├── Database: actionatlas-dev                              │
│  ├── Collections: activities, organizations                 │
│  ├── Indexes: Vector search, geospatial                     │
│  ├── Embeddings: Pre-generated (1536-dim vectors)           │
│  ├── Users: dev-readonly (developers)                       │
│  └── Cost: $0/month (512MB free tier)                       │
└─────────────────────────────────────────────────────────────┘
```

### Why This Approach?

**Alignment with Architecture**:
- ✅ MongoDB Atlas already chosen for production (ADR-001)
- ✅ Single source of truth for data
- ✅ Native vector search (no separate vector DB)
- ✅ Production-like environment from day one

**Developer Experience**:
- ✅ 5-minute onboarding (just connection string)
- ✅ Zero data downloads or transformations
- ✅ Consistent search results across team
- ✅ Instant access to latest data updates

**Cost Optimization**:
- ✅ One-time embedding generation (~$2 total)
- ✅ vs. Per-developer generation ($2 × team size)
- ✅ Free M0 tier (sufficient for development)
- ✅ No infrastructure overhead

---

## Data File Analysis

### File Format: MongoDB BSON Archive (.agz)

**What is .agz?**
- **NOT** AllegroGraph (common misconception)
- **IS** GZIP-compressed MongoDB BSON archive
- Created with: `mongodump --archive --gzip`
- Extracted with: `mongorestore --archive --gzip`

### Collections Structure

#### Collection 1: `charities` (Organizations)

```javascript
{
  _id: ObjectId("..."),
  cuid: "ckxxxxxxxxxxxxxx",          // Unique identifier
  name: "Organization Name",
  email: "contact@org.org",
  website: "https://org.org",
  logoUrl: "https://...",
  description: {
    blocks: [                          // Draft.js format
      { text: "Description...", type: "unstyled" }
    ]
  },
  address: {
    street: "123 Main St",
    city: "Geneva",
    postalCode: "1200",
    country: "Switzerland"
  },
  geolocation: {
    lat: 46.2044,
    lng: 6.1432
  },
  translations: {...},                 // Multi-language support
  status: "APPROVED",
  creationDate: ISODate("2024-01-15")
}
```

**Characteristics**:
- ~50-100 organizations
- Complete contact information
- Geolocation data for mapping
- Multi-language descriptions
- Approval workflow status

#### Collection 2: `activities` (Volunteering Activities)

```javascript
{
  _id: ObjectId("..."),
  cuid: "ckxxxxxxxxxxxxxx",          // Unique identifier
  name: "Activity Title",
  charity: "ckyyyyyyyyyyyyyyy",      // Reference to charity.cuid
  description: {
    blocks: [                          // Draft.js rich text
      { text: "Activity description...", type: "unstyled" }
    ]
  },
  geolocations: [                      // Multiple locations supported
    {
      coordinates: [6.1432, 46.2044],  // [lng, lat] - GeoJSON format
      address: {
        city: "Geneva",
        country: "Switzerland"
      }
    }
  ],
  countries: ["CH", "FR"],             // ISO country codes
  status: "APPROVED",
  creationDate: ISODate("2024-02-01"),
  translations: {...}
}
```

**Characteristics**:
- ~100+ volunteering activities
- Geospatial indexing (2dsphere)
- Rich text descriptions (Draft.js)
- Multiple location support
- Category implicit in description

### Data Quality

**Strengths**:
- ✅ Real-world data (production-quality)
- ✅ Geolocation data (for location-aware search)
- ✅ Realistic content diversity
- ✅ Multi-language (tests i18n requirements)

**Limitations**:
- ⚠️ No vector embeddings (need generation)
- ⚠️ Schema differs from Action Atlas design
- ⚠️ Draft.js format needs parsing
- ⚠️ Categories not explicit (need inference)

---

## Recommended Solution

### Implementation Architecture

```
Phase 1: One-Time Setup (Maintainer)
┌─────────────────────────────────────────────────────┐
│ 1. Extract thegoodsearch.agz → Local MongoDB       │
│ 2. Transform schema → Action Atlas format          │
│ 3. Generate embeddings → OpenAI API (~$2)          │
│ 4. Upload to MongoDB Atlas M0 → actionatlas-dev    │
│ 5. Configure vector search index → Atlas UI        │
└─────────────────────────────────────────────────────┘

Phase 2: Developer Onboarding (5 minutes)
┌─────────────────────────────────────────────────────┐
│ 1. git clone action-atlas                          │
│ 2. pnpm install                                     │
│ 3. Add MONGODB_URI to .env.local                   │
│ 4. pnpm dev → Ready!                                │
└─────────────────────────────────────────────────────┘
```

### Benefits Matrix

| Aspect | Shared Atlas | Local MongoDB | GitHub Releases | Git LFS |
|--------|-------------|---------------|-----------------|---------|
| **Onboarding Time** | 5 min | 30 min | 15 min | 10 min |
| **Setup Complexity** | Low | Medium | Medium | Medium |
| **Consistency** | Perfect | Poor | Medium | Medium |
| **Cost (team of 5)** | $2 total | $10 | $0 | $5/mo |
| **Git Bloat** | None | None | None | Better |
| **Offline Work** | No | Yes | Yes | Yes |
| **Production-Like** | Yes | Yes | No | No |

---

## Implementation Guide

### Maintainer Setup (One-Time)

#### Step 1: Create MongoDB Atlas Cluster

1. **Sign up/log in** to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create M0 Sandbox Cluster**:
   - Name: `action-atlas-dev`
   - Provider: AWS (or GCP/Azure)
   - Region: Closest to team
   - Tier: M0 Sandbox (FREE - 512MB storage)

3. **Create Database**:
   - Database name: `actionatlas-dev`
   - Collections: (will be created by scripts)

4. **Create Users**:
   ```
   Username: dev-readonly
   Password: <generate-secure-password>
   Role: readWrite on actionatlas-dev

   Username: dev-admin
   Password: <generate-secure-password>
   Role: readWrite on actionatlas-dev + Atlas Admin
   ```

5. **Network Access**:
   - Add IP: `0.0.0.0/0` (allow all - for development only)
   - Or: Add specific team IP addresses

6. **Get Connection String**:
   ```
   mongodb+srv://dev-readonly:PASSWORD@action-atlas-dev.xxxxx.mongodb.net/actionatlas-dev
   ```

#### Step 2: Transform and Upload Data

**Install MongoDB Tools** (if not installed):
```bash
# macOS
brew install mongodb-database-tools

# Ubuntu/Debian
sudo apt-get install mongodb-database-tools

# Windows
# Download from: https://www.mongodb.com/try/download/database-tools
```

**Extract thegoodsearch.agz**:
```bash
# Start local MongoDB (for transformation)
docker run -d -p 27017:27017 --name mongo-temp mongo:latest

# Extract archive
mongorestore --gzip --archive=thegoodsearch.agz \
  --uri="mongodb://localhost:27017/thegoodsearch_raw"

# Verify extraction
mongosh "mongodb://localhost:27017/thegoodsearch_raw" \
  --eval "db.activities.countDocuments()"
```

**Run Transformation Script**:
```bash
# Transform thegoodsearch → Action Atlas schema
pnpm data:transform

# This script:
# - Maps charities → organizations
# - Transforms activities schema
# - Parses Draft.js descriptions
# - Extracts primary geolocations
# - Infers categories from content
# - Creates searchableText field
```

**Generate Embeddings**:
```bash
# Set OpenAI API key
export OPENAI_API_KEY=sk-...

# Generate embeddings (costs ~$1-2 for 100+ activities)
pnpm data:generate-embeddings

# Progress output:
# Generating embeddings for 127 activities...
# Estimated cost: $0.0025
# Processing batch 1/2 (100 activities)...
# ✓ Processed 100/127
# Processing batch 2/2 (27 activities)...
# ✓ Processed 127/127
# Total cost: $0.0027
```

**Upload to Atlas**:
```bash
# Export transformed data
mongodump --uri="mongodb://localhost:27017/actionatlas" \
  --archive=actionatlas-dev.agz --gzip

# Upload to Atlas
mongorestore --gzip --archive=actionatlas-dev.agz \
  --uri="mongodb+srv://dev-admin:PASSWORD@action-atlas-dev.xxxxx.mongodb.net/actionatlas-dev"

# Verify upload
mongosh "mongodb+srv://dev-admin:PASSWORD@..." \
  --eval "
    use actionatlas-dev;
    print('Activities:', db.activities.countDocuments());
    print('With embeddings:', db.activities.countDocuments({embedding: {\$exists: true}}));
  "
```

#### Step 3: Configure Vector Search Index

1. **Open MongoDB Atlas UI** → Clusters → Browse Collections

2. **Navigate**: `actionatlas-dev` → `activities` collection

3. **Create Search Index**:
   - Click "Search Indexes" tab
   - Click "Create Search Index"
   - Choose "JSON Editor"
   - Index name: `activity_vector_search`

4. **Paste Configuration**:
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "embedding": {
        "type": "knnVector",
        "dimensions": 1536,
        "similarity": "cosine"
      },
      "location.coordinates": {
        "type": "geo"
      },
      "isActive": {
        "type": "boolean"
      },
      "category": {
        "type": "string"
      }
    }
  }
}
```

5. **Wait for Index** to build (~5-10 minutes)

#### Step 4: Share with Team

**Document Connection String** in team wiki/secrets:
```env
# Development MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://dev-readonly:PASSWORD@action-atlas-dev.xxxxx.mongodb.net/actionatlas-dev

# Read-only access for developers
# Full cluster name: action-atlas-dev
# Database: actionatlas-dev
# Collections: activities, organizations
```

---

## Schema Transformation

### Mapping: thegoodsearch → Action Atlas

#### Organizations (charities → organizations)

```typescript
// Transform function
function transformCharity(charity: TheGoodSearchCharity): Organization {
  return {
    organizationId: charity.cuid,
    name: charity.name,
    email: charity.email,
    website: charity.website,
    logoUrl: charity.logoUrl,
    mission: extractPlainText(charity.description),  // Draft.js → plain text
    address: {
      street: charity.address?.street,
      city: charity.address?.city || 'Unknown',
      postalCode: charity.address?.postalCode,
      country: charity.address?.country || 'Unknown',
    },
    location: charity.geolocation ? {
      coordinates: {
        type: 'Point',
        coordinates: [charity.geolocation.lng, charity.geolocation.lat]
      }
    } : null,
    isActive: charity.status === 'APPROVED',
    createdAt: charity.creationDate || new Date(),
    updatedAt: new Date(),
  };
}
```

#### Activities (activities → activities)

```typescript
// Transform function
function transformActivity(
  activity: TheGoodSearchActivity,
  charities: Map<string, TheGoodSearchCharity>
): Activity {
  const charity = charities.get(activity.charity);
  const primaryLocation = activity.geolocations?.[0];
  const description = extractPlainText(activity.description);

  return {
    activityId: activity.cuid,
    title: activity.name,
    description: description,
    organizationId: activity.charity,
    organization: charity ? {
      name: charity.name,
      email: charity.email,
      website: charity.website,
    } : null,

    category: inferCategory(activity.name, description),  // ML or keyword-based

    skills: [],  // Not in thegoodsearch, leave empty

    location: primaryLocation ? {
      address: {
        city: primaryLocation.address?.city || 'Unknown',
        country: primaryLocation.address?.country || 'Unknown',
      },
      coordinates: {
        type: 'Point',
        coordinates: primaryLocation.coordinates,  // [lng, lat]
      },
    } : null,

    timeCommitment: {
      isFlexible: true,    // Default assumption
      isOneTime: false,
      isRecurring: true,
    },

    contact: charity ? {
      name: charity.name,
      role: 'Organization',
      email: charity.email,
    } : {
      name: 'Contact',
      role: 'Coordinator',
      email: 'contact@unknown.org',
    },

    searchableText: `${activity.name} ${description} ${charity?.name || ''}`.trim(),
    embedding: [],  // Generated in next step

    isActive: activity.status === 'APPROVED',
    createdAt: activity.creationDate || new Date(),
    updatedAt: new Date(),
  };
}
```

### Category Inference

```typescript
function inferCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  const patterns = {
    education: /\b(teach|education|school|student|youth|child|tutor|mentor)\b/,
    environment: /\b(environment|nature|climate|clean|recycle|conservation|green)\b/,
    health: /\b(health|medical|hospital|care|wellness|mental)\b/,
    seniors: /\b(senior|elderly|elder|aged|retirement)\b/,
    animals: /\b(animal|pet|wildlife|shelter|rescue)\b/,
    food: /\b(food|meal|hunger|kitchen|pantry|soup)\b/,
    housing: /\b(housing|homeless|shelter|build|habitat)\b/,
    arts: /\b(art|music|culture|creative|paint|perform)\b/,
  };

  for (const [category, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return category;
    }
  }

  return 'other';
}
```

---

## Embedding Generation

### OpenAI Configuration

```typescript
// packages/ai/src/embedding-service.ts
import { OpenAI } from 'openai';

export class EmbeddingService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateBatch(texts: string[]): Promise<EmbeddingResult[]> {
    // OpenAI allows up to 2048 texts per request
    // We use smaller batches for reliability
    const batchSize = 100;
    const results: EmbeddingResult[] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      try {
        const response = await this.client.embeddings.create({
          model: 'text-embedding-3-small',  // 1536 dimensions
          input: batch,
          encoding_format: 'float',
        });

        results.push(...response.data.map((item, idx) => ({
          index: i + idx,
          embedding: item.embedding,
          tokens: response.usage.prompt_tokens / batch.length,  // Estimate
        })));

        // Rate limiting: 3,500 RPM on free tier
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Batch ${i}-${i+batchSize} failed:`, error);
        throw error;
      }
    }

    return results;
  }
}
```

### Cost Calculation

```typescript
interface EmbeddingCost {
  totalTokens: number;
  estimatedCost: number;
  model: string;
}

function calculateEmbeddingCost(activities: Activity[]): EmbeddingCost {
  // Average activity searchableText length
  const avgCharsPerActivity = 500;  // title + description + org
  const avgTokensPerActivity = avgCharsPerActivity / 4;  // ~4 chars/token

  const totalTokens = activities.length * avgTokensPerActivity;

  // text-embedding-3-small: $0.02 per 1M tokens
  const costPer1MTokens = 0.02;
  const estimatedCost = (totalTokens / 1_000_000) * costPer1MTokens;

  return {
    totalTokens,
    estimatedCost,
    model: 'text-embedding-3-small',
  };
}

// Example for 127 activities
const cost = calculateEmbeddingCost(activities);
console.log(`
Embedding Generation Cost Estimate:
- Activities: ${activities.length}
- Avg tokens/activity: 125
- Total tokens: ${cost.totalTokens.toLocaleString()}
- Estimated cost: $${cost.estimatedCost.toFixed(4)}
`);
// Output:
// Activities: 127
// Total tokens: 15,875
// Estimated cost: $0.0003
```

---

## Cost Analysis

### Detailed Cost Breakdown

#### Shared MongoDB Atlas Approach (Recommended)

**One-Time Costs**:
```
MongoDB Atlas M0 Setup:        $0 (free tier)
Data Transformation:           $0 (developer time)
Embedding Generation:          $2 (100+ activities, one-time)
Vector Index Configuration:    $0 (included)
─────────────────────────────────
Total One-Time:                $2
```

**Monthly Costs**:
```
MongoDB Atlas M0:              $0 (512MB limit, ~135MB used)
Bandwidth:                     $0 (included in free tier)
Maintenance:                   $0 (minimal, automated backups)
─────────────────────────────────
Total Monthly:                 $0
```

**Per-Developer Costs**:
```
Onboarding Time:               $0 (5 minutes)
API Keys:                      $0 (use personal OpenAI key for testing)
Embedding Generation:          $0 (already done)
─────────────────────────────────
Total Per-Developer:           $0
```

**Team of 5 Developers (6 months)**:
```
Setup:                         $2 (one-time)
Operations:                    $0 × 6 months = $0
Total:                         $2
```

#### Alternative: Each Developer Local MongoDB

**One-Time Costs**:
```
MongoDB Docker Setup:          $0 (free)
Data File Distribution:        $0 (GitHub Releases or similar)
─────────────────────────────────
Total One-Time:                $0
```

**Per-Developer Costs**:
```
Onboarding Time:               $0 (30 minutes)
Data Extraction:               $0
Schema Transformation:         $0 (scripted)
Embedding Generation:          $2 per developer
─────────────────────────────────
Total Per-Developer:           $2
```

**Team of 5 Developers (6 months)**:
```
Setup:                         $0
Embedding Generation:          $2 × 5 = $10
Operations:                    $0
Total:                         $10
```

**Savings with Shared Approach**: $8 (80% reduction)

---

## Migration Paths

### Growth Path: When to Migrate

```
Stage 1: MVP (Current - Month 3)
├── Solution: Shared MongoDB Atlas M0
├── Team: 1-5 developers
├── Cost: $0/month
└── Data: 100-500 activities

Stage 2: Growth (Month 4-6)
├── Solution: Shared MongoDB Atlas M0 (continue)
├── Team: 5-10 developers
├── Cost: $0/month
├── Data: 500-1,000 activities
└── Monitor: Storage approaching 512MB limit

Stage 3: Scale (Month 7+)
├── Solution: Upgrade to Atlas M10 OR migrate to Git LFS
├── Team: 10+ developers
├── Cost: M10 = $57/month OR Git LFS = $5/month
├── Data: 1,000+ activities
└── Decision: Based on production timeline

Stage 4: Production (Launch)
├── Solution: Separate Production Atlas M10
├── Team: Production workload
├── Cost: $57/month (budgeted)
├── Data: User-generated activities
└── Dev: Continue using separate dev cluster
```

### Migration Option 1: Atlas M0 → Atlas M10

**When**: Storage exceeds 400MB (80% of M0 limit)

**Process**:
```bash
# 1. In Atlas UI: Upgrade cluster
#    M0 Sandbox → M10 Basic ($57/month)
#    Zero downtime, automatic migration

# 2. Update connection strings (same URI works)
# 3. Notify team (no action required)
# 4. Monitor costs and usage
```

**Pros**:
- Zero downtime
- No code changes
- Automatic migration
- Better performance

**Cons**:
- $57/month cost
- May be overkill for development

### Migration Option 2: Atlas → Git LFS

**When**: Team wants local-first development OR offline work critical

**Process**:
```bash
# 1. Export from Atlas
mongodump --uri="mongodb+srv://..." \
  --archive=actionatlas-dev.agz --gzip

# 2. Setup Git LFS
git lfs install
git lfs track "*.agz"

# 3. Commit data file
git add .gitattributes actionatlas-dev.agz
git commit -m "Add development data via Git LFS"
git push

# 4. Update README: New developers run `git lfs pull`
```

**Pros**:
- Version control for data
- Offline development
- Git-integrated workflow

**Cons**:
- $5/month for Git LFS
- Each developer generates embeddings ($2 each)
- Lose shared data benefits

### Migration Option 3: Atlas → AWS S3

**When**: Production-scale needs OR multi-environment complexity

**Process**:
```bash
# 1. Create S3 bucket
aws s3 mb s3://action-atlas-data --region us-east-1

# 2. Export and upload
mongodump --uri="mongodb+srv://..." --archive | gzip | \
  aws s3 cp - s3://action-atlas-data/actionatlas-dev.agz

# 3. Update scripts to download from S3
# 4. Document IAM access setup
```

**Pros**:
- Scales infinitely
- Fine-grained access control
- Versioning built-in
- Low cost ($0.10/month)

**Cons**:
- AWS account complexity
- IAM setup required
- More moving parts
- Lose shared database benefits

---

## Summary

### Key Decisions

1. **✅ Use Shared MongoDB Atlas M0** for development
   - Rationale: Zero cost, perfect alignment with production architecture, minimal setup friction

2. **✅ One-Time Embedding Generation** ($2 total)
   - Rationale: Saves $2 per developer, ensures consistency

3. **✅ Transform thegoodsearch Schema** to Action Atlas
   - Rationale: Clean architecture, optimize for vector search, remove legacy cruft

4. **✅ Exclude Binary Files from Git**
   - Rationale: Best practice, prevents repository bloat

5. **✅ Provide Local MongoDB Option** as fallback
   - Rationale: Flexibility for offline work, schema testing

### Next Steps

**For Maintainers**:
1. Create MongoDB Atlas M0 cluster
2. Transform thegoodsearch data
3. Generate embeddings ($2 cost)
4. Upload to Atlas and configure indexes
5. Share connection string with team

**For Developers**:
1. Get `MONGODB_URI` from team
2. Add to `.env.local`
3. Run `pnpm dev`
4. Start coding!

**For Future**:
1. Monitor Atlas storage usage
2. Plan migration when reaching 400MB
3. Consider Git LFS or S3 for scale
4. Separate production database (week 9)

---

**Document Version**: 1.0
**Last Updated**: 2026-01-07
**Status**: Approved and Recommended
**Review Date**: After Milestone 2 completion
