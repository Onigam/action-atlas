#!/bin/bash
set -e

echo "========================================"
echo "Loading Action Atlas Development Data"
echo "========================================"

DATA_FILE="/data/seed-dataset.agz"
GITHUB_RELEASE_TAG="v1.0-data"
GITHUB_REPO="YOUR_ORG/action-atlas"

# Check if data file exists locally
if [ ! -f "$DATA_FILE" ]; then
    echo "Data file not found locally. Downloading from GitHub Releases..."

    # Try with gh CLI first
    if command -v gh &> /dev/null; then
        echo "Using GitHub CLI..."
        gh release download "$GITHUB_RELEASE_TAG" \
            --repo "$GITHUB_REPO" \
            --pattern "seed-dataset.agz" \
            --dir /data
    else
        # Fallback to curl
        echo "Using curl (gh CLI not available)..."
        DOWNLOAD_URL="https://github.com/$GITHUB_REPO/releases/download/$GITHUB_RELEASE_TAG/seed-dataset.agz"
        curl -L -o /data/seed-dataset.agz "$DOWNLOAD_URL"
        DATA_FILE="/data/seed-dataset.agz"
    fi
fi

echo "Data file: $DATA_FILE"
echo "File size: $(du -h $DATA_FILE | cut -f1)"

# Restore to MongoDB
echo "Restoring data to MongoDB..."
mongorestore \
    --host mongodb:27017 \
    --gzip \
    --archive="$DATA_FILE" \
    --drop

# Verify data loaded
ACTIVITY_COUNT=$(mongosh --host mongodb:27017 --quiet --eval '
    db.getSiblingDB("actionatlas").activities.countDocuments()
')

ORGANIZATION_COUNT=$(mongosh --host mongodb:27017 --quiet --eval '
    db.getSiblingDB("actionatlas").organizations.countDocuments()
')

echo ""
echo "✅ Data loaded successfully!"
echo "   - Activities: $ACTIVITY_COUNT"
echo "   - Organizations: $ORGANIZATION_COUNT"
echo ""
