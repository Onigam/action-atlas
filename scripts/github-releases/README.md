# GitHub Releases Scripts (Alternative Approach)

> Scripts for distributing data files via GitHub Releases.

## Overview

These scripts support an **alternative approach**: File distribution via GitHub Releases.

**Note**: The **recommended approach** is Shared MongoDB Atlas (see [docs/development-setup](../../docs/development-setup/)).

Use this approach if:
- You prefer file-based distribution
- Need offline-first development
- Don't want cloud dependencies

**See**: [Alternative Solutions](../../docs/development-setup/alternatives.md#github-releases)

---

## Scripts

### download-data.sh

Downloads data file from GitHub Releases.

**Usage**:
```bash
# Download latest release
bash scripts/github-releases/download-data.sh

# Downloads to: ./data/seed-dataset.agz
```

**Features**:
- Automatic fallback: gh CLI → curl
- Progress reporting
- Checksum verification
- Error handling

---

### upload-data-release.sh

Uploads new data version to GitHub Releases (maintainers only).

**Usage**:
```bash
# Interactive wizard
bash scripts/github-releases/upload-data-release.sh

# Prompts for:
# - Release tag (e.g., v1.0-data)
# - Release title
# - Release notes
```

**Prerequisites**:
- `gh` CLI installed and authenticated
- Write access to repository

---

### verify-data-checksum.sh

Verifies data file integrity using MD5 checksum.

**Usage**:
```bash
# Verify downloaded file
bash scripts/github-releases/verify-data-checksum.sh

# Checks: data/seed-dataset.agz
# Against: Expected checksum in script
```

---

### setup-dev-environment.sh

Complete development environment setup.

**Usage**:
```bash
# Run full setup
bash scripts/github-releases/setup-dev-environment.sh

# Steps:
# 1. Check prerequisites
# 2. Download data file
# 3. Verify checksum
# 4. Extract to MongoDB
# 5. Configure environment
```

---

## Workflow

**One-Time Setup (Maintainer)**:

```bash
# Upload data file to GitHub Release
bash scripts/github-releases/upload-data-release.sh

# Follow prompts to create release
```

**Developer Setup (10 minutes)**:

```bash
# 1. Clone repository
git clone https://github.com/YOUR_ORG/action-atlas.git
cd action-atlas

# 2. Download data
bash scripts/github-releases/download-data.sh

# 3. Start local MongoDB
docker run -d -p 27017:27017 --name mongo mongo:latest

# 4. Restore data
mongorestore --gzip --archive=data/seed-dataset.agz \
  --uri="mongodb://localhost:27017/actionatlas"

# 5. Generate embeddings (costs $1-2)
export OPENAI_API_KEY=sk-...
pnpm data:generate-embeddings

# 6. Start development
pnpm dev
```

---

## Cost Comparison

| Approach | Setup Time | Cost per Developer | Consistency |
|----------|-----------|-------------------|-------------|
| **GitHub Releases** | 10 min | $1-2 (embeddings) | Poor |
| **MongoDB Atlas** (recommended) | 5 min | $0 | Perfect |

**Trade-off**: GitHub Releases is free but each developer pays $1-2 for embeddings and has inconsistent results.

---

## Related Documentation

- [Alternative Solutions Guide](../../docs/development-setup/alternatives.md)
- [Development Setup](../../docs/development-setup/README.md)
- [Data Management Strategy](../../docs/development-setup/data-management.md)

---

**Last Updated**: 2026-01-07
