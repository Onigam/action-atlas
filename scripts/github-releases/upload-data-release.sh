#!/bin/bash
set -e

# Configuration
REPO="YOUR_ORG/action-atlas"  # UPDATE THIS with your GitHub org/user
FILE_NAME="thegoodsearch.agz"
DEFAULT_VERSION="1.0.0"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Action Atlas - Data File Uploader${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo -e "${RED}✗ GitHub CLI (gh) is not installed${NC}"
  echo ""
  echo "Install instructions:"
  echo "  macOS:   brew install gh"
  echo "  Linux:   See https://github.com/cli/cli#installation"
  echo "  Windows: See https://github.com/cli/cli#installation"
  exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
  echo -e "${YELLOW}Not authenticated with GitHub${NC}"
  echo "Running: gh auth login"
  echo ""
  gh auth login
fi

# Check if file exists
if [ ! -f "$FILE_NAME" ]; then
  echo -e "${RED}✗ File not found: $FILE_NAME${NC}"
  echo "Please run this script from the repository root where $FILE_NAME is located."
  exit 1
fi

# Get file info
FILE_SIZE=$(du -h "$FILE_NAME" | cut -f1)
if command -v md5 &> /dev/null; then
  FILE_MD5=$(md5 -q "$FILE_NAME")
elif command -v md5sum &> /dev/null; then
  FILE_MD5=$(md5sum "$FILE_NAME" | cut -d' ' -f1)
else
  FILE_MD5="(md5 not available)"
fi

echo "File Details:"
echo "  Name: $FILE_NAME"
echo "  Size: $FILE_SIZE"
echo "  MD5:  $FILE_MD5"
echo ""

# Get version from user
echo -e "${YELLOW}Enter version number (e.g., 1.0.0, 2.1.0):${NC}"
read -p "Version [$DEFAULT_VERSION]: " VERSION
VERSION=${VERSION:-$DEFAULT_VERSION}

RELEASE_TAG="data-v${VERSION}"

# Confirm details
echo ""
echo "Release Details:"
echo "  Tag:        $RELEASE_TAG"
echo "  Title:      Data file v${VERSION}"
echo "  Repository: $REPO"
echo "  File:       $FILE_NAME ($FILE_SIZE)"
echo ""

read -p "Proceed with upload? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Upload cancelled."
  exit 0
fi

echo ""
echo -e "${BLUE}Creating GitHub Release...${NC}"

# Get release notes
echo -e "${YELLOW}Enter release notes (press Ctrl+D when done):${NC}"
NOTES=$(cat)

if [ -z "$NOTES" ]; then
  NOTES="Data file for Action Atlas development and testing.

File Details:
- Size: $FILE_SIZE
- MD5: $FILE_MD5

To download:
\`\`\`bash
pnpm data:download
\`\`\`

Or manually:
\`\`\`bash
gh release download $RELEASE_TAG --repo $REPO --pattern $FILE_NAME
\`\`\`"
fi

# Create release
if gh release create "$RELEASE_TAG" \
  "$FILE_NAME" \
  --repo "$REPO" \
  --title "Data file v${VERSION}" \
  --notes "$NOTES"; then

  echo ""
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}✓ Successfully created release!${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo "Release URL:"
  gh release view "$RELEASE_TAG" --repo "$REPO" --web 2>/dev/null || true
  echo ""
  echo "Next Steps:"
  echo "  1. Update RELEASE_TAG in scripts/download-data.sh to: $RELEASE_TAG"
  echo "  2. Commit and push the script update"
  echo "  3. Notify team: 'New data file available - run pnpm data:update'"
  echo ""
  echo "Download command for team:"
  echo "  pnpm data:update"
  echo ""

else
  echo -e "${RED}✗ Failed to create release${NC}"
  exit 1
fi
