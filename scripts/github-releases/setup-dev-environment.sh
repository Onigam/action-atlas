#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Action Atlas - Development Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# 1. Check Node.js version
echo -e "${BLUE}[1/7] Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found${NC}"
  echo "Install Node.js 20+ from: https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo -e "${RED}✗ Node.js 20+ required (found: v$NODE_VERSION)${NC}"
  echo "Update Node.js from: https://nodejs.org/"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo ""

# 2. Check/Install pnpm
echo -e "${BLUE}[2/7] Checking pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
  echo -e "${YELLOW}pnpm not found, installing...${NC}"
  npm install -g pnpm
  echo -e "${GREEN}✓ pnpm installed${NC}"
else
  echo -e "${GREEN}✓ pnpm $(pnpm --version)${NC}"
fi
echo ""

# 3. Check GitHub CLI (optional but recommended)
echo -e "${BLUE}[3/7] Checking GitHub CLI...${NC}"
if ! command -v gh &> /dev/null; then
  echo -e "${YELLOW}⚠ GitHub CLI not found (optional)${NC}"
  echo "Install with: brew install gh (macOS) or see https://cli.github.com/"
  echo "Required for: private repositories, uploading data files"
else
  echo -e "${GREEN}✓ GitHub CLI installed${NC}"
  if gh auth status &> /dev/null; then
    echo -e "${GREEN}✓ Authenticated with GitHub${NC}"
  else
    echo -e "${YELLOW}⚠ Not authenticated (run: gh auth login)${NC}"
  fi
fi
echo ""

# 4. Install dependencies
echo -e "${BLUE}[4/7] Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# 5. Check data file
echo -e "${BLUE}[5/7] Checking data file...${NC}"
if [ -f "data/seed-dataset.agz" ]; then
  FILE_SIZE=$(du -h data/seed-dataset.agz | cut -f1)
  echo -e "${GREEN}✓ Data file exists ($FILE_SIZE)${NC}"

  # Verify checksum if script is configured
  if bash scripts/verify-data-checksum.sh 2>/dev/null; then
    echo -e "${GREEN}✓ Checksum verified${NC}"
  else
    echo -e "${YELLOW}⚠ Checksum verification not configured or failed${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Data file not found${NC}"
  echo "This is normal if postinstall hook failed."
  echo "Running manual download..."
  bash scripts/download-data.sh
fi
echo ""

# 6. Setup environment variables
echo -e "${BLUE}[6/7] Setting up environment variables...${NC}"
if [ ! -f ".env.local" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✓ Created .env.local from template${NC}"
    echo -e "${YELLOW}⚠ ACTION REQUIRED: Edit .env.local with your credentials${NC}"
    echo ""
    echo "Required variables:"
    echo "  - MONGODB_URI (MongoDB Atlas connection string)"
    echo "  - OPENAI_API_KEY (OpenAI API key)"
    echo ""
    echo "Optional variables:"
    echo "  - UPSTASH_REDIS_REST_URL"
    echo "  - UPSTASH_REDIS_REST_TOKEN"
  else
    echo -e "${YELLOW}⚠ .env.example not found${NC}"
    echo "Create .env.local manually with required environment variables"
  fi
else
  echo -e "${GREEN}✓ .env.local already exists${NC}"
fi
echo ""

# 7. Verify setup
echo -e "${BLUE}[7/7] Verifying setup...${NC}"

SETUP_OK=true

# Check node_modules
if [ ! -d "node_modules" ]; then
  echo -e "${RED}✗ node_modules not found${NC}"
  SETUP_OK=false
else
  echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Check data file
if [ -f "data/seed-dataset.agz" ]; then
  echo -e "${GREEN}✓ Data file present${NC}"
else
  echo -e "${RED}✗ Data file missing${NC}"
  SETUP_OK=false
fi

# Check environment
if [ -f ".env.local" ]; then
  echo -e "${GREEN}✓ Environment file exists${NC}"
else
  echo -e "${YELLOW}⚠ .env.local not found${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"

if [ "$SETUP_OK" = true ]; then
  echo -e "${GREEN}✓ Development environment ready!${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
  echo "Next steps:"
  echo ""
  echo "  1. Edit .env.local with your API keys:"
  echo "     - Get MongoDB URI: https://cloud.mongodb.com/"
  echo "     - Get OpenAI key: https://platform.openai.com/api-keys"
  echo ""
  echo "  2. Start development server:"
  echo "     pnpm dev"
  echo ""
  echo "  3. Open in browser:"
  echo "     http://localhost:3000"
  echo ""
  echo "Available commands:"
  echo "  pnpm dev              - Start development server"
  echo "  pnpm build            - Build for production"
  echo "  pnpm test             - Run tests"
  echo "  pnpm data:download    - Download data file"
  echo "  pnpm data:verify      - Verify data integrity"
  echo ""
  echo "Documentation:"
  echo "  README.md                          - Project overview"
  echo "  docs/data-file-setup-guide.md      - Data file management"
  echo "  docs/data-file-infrastructure.md   - Infrastructure details"
  echo ""
else
  echo -e "${RED}✗ Setup incomplete${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
  echo "Please resolve the issues above and try again."
  echo ""
  echo "For help:"
  echo "  - Check docs/data-file-setup-guide.md"
  echo "  - Run: pnpm data:download (to download data file)"
  echo "  - Run: gh auth login (for private repositories)"
  exit 1
fi
