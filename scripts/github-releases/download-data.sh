#!/bin/bash
set -e

# Configuration
REPO="YOUR_ORG/action-atlas"  # UPDATE THIS with your GitHub org/user
RELEASE_TAG="data-v1.0.0"
FILE_NAME="thegoodsearch.agz"
DATA_DIR="$(cd "$(dirname "$0")/.." && pwd)/data"
OUTPUT_PATH="$DATA_DIR/$FILE_NAME"
EXPECTED_SIZE_MB=26  # Expected file size for validation

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Action Atlas - Data File Downloader${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if file already exists
if [ -f "$OUTPUT_PATH" ]; then
  CURRENT_SIZE=$(du -m "$OUTPUT_PATH" | cut -f1)
  echo -e "${GREEN}✓ Data file already exists${NC}"
  echo "  Location: $OUTPUT_PATH"
  echo "  Size: ${CURRENT_SIZE}MB"
  echo ""
  echo "If you need to re-download, run: pnpm data:clean && pnpm data:download"
  exit 0
fi

echo -e "${YELLOW}Downloading data file from GitHub Releases...${NC}"
echo "  Repository: $REPO"
echo "  Release: $RELEASE_TAG"
echo "  File: $FILE_NAME"
echo ""

# Create data directory if it doesn't exist
mkdir -p "$DATA_DIR"

# Method 1: Try GitHub CLI first (best for private repos)
if command -v gh &> /dev/null; then
  echo -e "${BLUE}Using GitHub CLI...${NC}"

  if gh release download "$RELEASE_TAG" \
    --repo "$REPO" \
    --pattern "$FILE_NAME" \
    --dir "$DATA_DIR" 2>/dev/null; then

    echo -e "${GREEN}✓ Download successful via GitHub CLI${NC}"
  else
    echo -e "${YELLOW}GitHub CLI failed, trying alternative method...${NC}"
    METHOD_1_FAILED=1
  fi
else
  echo -e "${YELLOW}GitHub CLI not found (install: brew install gh)${NC}"
  echo "Trying alternative download method..."
  echo ""
  METHOD_1_FAILED=1
fi

# Method 2: Fallback to curl (works for public repos)
if [ -n "$METHOD_1_FAILED" ]; then
  DOWNLOAD_URL="https://github.com/$REPO/releases/download/$RELEASE_TAG/$FILE_NAME"

  echo -e "${BLUE}Using curl...${NC}"
  echo "URL: $DOWNLOAD_URL"
  echo ""

  # Check if GITHUB_TOKEN is available (for private repos)
  if [ -n "$GITHUB_TOKEN" ]; then
    echo "Using GITHUB_TOKEN for authentication..."
    curl -L -H "Authorization: token $GITHUB_TOKEN" \
      -o "$OUTPUT_PATH" \
      --progress-bar \
      "$DOWNLOAD_URL"
  else
    # Public repository - no authentication needed
    curl -L -o "$OUTPUT_PATH" \
      --progress-bar \
      "$DOWNLOAD_URL"
  fi

  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Download failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check if the repository is private (needs authentication)"
    echo "  2. For private repos: gh auth login"
    echo "  3. Verify the release exists: gh release view $RELEASE_TAG --repo $REPO"
    echo "  4. Check your internet connection"
    exit 1
  fi
fi

echo ""

# Verify download
if [ ! -f "$OUTPUT_PATH" ]; then
  echo -e "${RED}✗ File not found after download${NC}"
  exit 1
fi

# Check file size
ACTUAL_SIZE_MB=$(du -m "$OUTPUT_PATH" | cut -f1)
ACTUAL_SIZE_HR=$(du -h "$OUTPUT_PATH" | cut -f1)

if [ "$ACTUAL_SIZE_MB" -lt 1 ]; then
  echo -e "${RED}✗ Downloaded file is too small (${ACTUAL_SIZE_HR})${NC}"
  echo "This might indicate a download error or redirect to error page."
  rm "$OUTPUT_PATH"
  exit 1
fi

# Compute checksum for verification
echo -e "${BLUE}Computing checksum...${NC}"
if command -v md5 &> /dev/null; then
  CHECKSUM=$(md5 -q "$OUTPUT_PATH")
elif command -v md5sum &> /dev/null; then
  CHECKSUM=$(md5sum "$OUTPUT_PATH" | cut -d' ' -f1)
else
  CHECKSUM="(md5 not available)"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Successfully downloaded data file!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Details:"
echo "  Location: $OUTPUT_PATH"
echo "  Size: ${ACTUAL_SIZE_HR}"
echo "  MD5: $CHECKSUM"
echo ""

# Optional: Add to .gitignore if not already there
GITIGNORE_PATH="$(cd "$(dirname "$0")/.." && pwd)/.gitignore"
if [ -f "$GITIGNORE_PATH" ]; then
  if ! grep -q "data/\*\.agz" "$GITIGNORE_PATH" 2>/dev/null && \
     ! grep -q "\*\.agz" "$GITIGNORE_PATH" 2>/dev/null; then
    echo "# Data files" >> "$GITIGNORE_PATH"
    echo "data/*.agz" >> "$GITIGNORE_PATH"
    echo "Added data files to .gitignore"
  fi
fi

echo -e "${GREEN}Ready to use!${NC}"
