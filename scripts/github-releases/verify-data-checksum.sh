#!/bin/bash
set -e

# Configuration
FILE_NAME="thegoodsearch.agz"
DATA_DIR="$(cd "$(dirname "$0")/.." && pwd)/data"
FILE_PATH="$DATA_DIR/$FILE_NAME"

# Expected checksum (UPDATE THIS after first upload)
# Get the checksum by running: md5 data/thegoodsearch.agz
EXPECTED_CHECKSUM=""  # TODO: Add checksum after first upload

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Verifying data file checksum...${NC}"
echo ""

# Check if file exists
if [ ! -f "$FILE_PATH" ]; then
  echo -e "${RED}✗ File not found: $FILE_PATH${NC}"
  echo "Run: pnpm data:download"
  exit 1
fi

# Compute checksum
echo "Computing checksum..."
if command -v md5 &> /dev/null; then
  ACTUAL_CHECKSUM=$(md5 -q "$FILE_PATH")
elif command -v md5sum &> /dev/null; then
  ACTUAL_CHECKSUM=$(md5sum "$FILE_PATH" | cut -d' ' -f1)
else
  echo -e "${RED}✗ Neither md5 nor md5sum command found${NC}"
  exit 1
fi

echo "Actual:   $ACTUAL_CHECKSUM"

# Compare if expected checksum is set
if [ -n "$EXPECTED_CHECKSUM" ]; then
  echo "Expected: $EXPECTED_CHECKSUM"
  echo ""

  if [ "$ACTUAL_CHECKSUM" = "$EXPECTED_CHECKSUM" ]; then
    echo -e "${GREEN}✓ Checksum matches - file is valid${NC}"
    exit 0
  else
    echo -e "${RED}✗ Checksum mismatch - file may be corrupted${NC}"
    echo ""
    echo "Actions:"
    echo "  1. Re-download: pnpm data:clean && pnpm data:download"
    echo "  2. If persists, contact team lead"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠ Expected checksum not set in script${NC}"
  echo ""
  echo "To enable checksum verification:"
  echo "  1. Copy the checksum above"
  echo "  2. Edit scripts/verify-data-checksum.sh"
  echo "  3. Set EXPECTED_CHECKSUM='$ACTUAL_CHECKSUM'"
  exit 0
fi
