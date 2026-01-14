# Action Atlas

> AI-powered semantic search engine for discovering volunteering activities

**Action Atlas** helps volunteers discover meaningful volunteering opportunities through intelligent semantic search, connecting people with causes they care about based on intent, not just keywords.

[![License](https://img.shields.io/badge/license-TBD-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/atlas)

---

## 🎯 What is Action Atlas?

Action Atlas is a **semantic search platform** that understands natural language queries to find relevant volunteering activities. Instead of relying on exact keyword matches, it uses AI-powered vector embeddings to understand the *meaning* behind your search.

**Example searches:**
- "teach kids programming on weekends" → Finds coding mentorship opportunities
- "environmental cleanup near me" → Discovers local conservation projects
- "help seniors with technology" → Matches tech support volunteering

### Key Features

- 🔍 **Semantic Search**: AI-powered search that understands intent, not just keywords
- 📍 **Location-Aware**: Combines semantic relevance with geographic proximity
- ⚡ **Fast**: Sub-200ms search latency with intelligent caching
- 🎨 **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS
- 🔐 **Type-Safe**: End-to-end TypeScript with strict mode
- 💰 **Cost-Effective**: $6-12/month for MVP, scales predictably

---

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs) directory:

### Essential Reading

- **[Product Vision](./docs/product-vision.md)** - Goals, target users, MVP scope
- **[Technology Stack](./docs/tech-stack.md)** - Complete tech decisions with rationale
- **[System Architecture](./docs/architecture.md)** - Architecture diagrams and data flows
- **[Implementation Milestones](./docs/milestones.md)** - 9-week step-by-step plan

### Architecture Decision Records

- **[ADR-001: MongoDB Atlas Vector Search](./docs/adr/001-mongodb-atlas-vector-search.md)**
- **[ADR-002: Vercel AI SDK over Langchain](./docs/adr/002-vercel-ai-sdk-over-langchain.md)**

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router, React Server Components)
- **React 19** (New compiler, 15-20% faster rendering)
- **TypeScript 5.7** (Strict mode, full type safety)
- **Tailwind CSS** + **shadcn/ui** (Modern, accessible components)
- **TanStack Query** + **Zustand** (State management)

### Backend
- **Hono** (Edge-ready API framework, 5× faster than Express)
- **Next.js API Routes** (Serverless functions)
- **MongoDB Atlas** (Database with native vector search)
- **Vercel AI SDK v4** (Lightweight AI framework, NOT Langchain)
- **OpenAI** (text-embedding-3-small for embeddings)

### Infrastructure
- **Railway** (Hosting and automated CI/CD via GitHub Actions)
- **MongoDB Atlas** (M0 free tier → M10 $57/month)
- **Upstash Redis** (Caching and rate limiting)
- **GitHub Actions** (CI/CD, automated deployments to Railway)
- **Sentry** (Error tracking)

### Development
- **Turborepo** (Monorepo management)
- **pnpm** (Fast package manager)
- **Vitest** (Unit & integration testing)
- **Playwright** (E2E testing)

**See [docs/tech-stack.md](./docs/tech-stack.md) for detailed technology decisions.**

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** (LTS recommended)
- **pnpm 8+** ([Install pnpm](https://pnpm.io/installation))
- **MongoDB Atlas account** ([Free tier](https://www.mongodb.com/cloud/atlas/register))
- **OpenAI API key** ([Get API key](https://platform.openai.com/api-keys))
- **Railway account** (For production deployment, [Sign up](https://railway.app))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_ORG/action-atlas.git
cd action-atlas

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials:
# - MONGODB_URI (MongoDB Atlas connection string)
# - OPENAI_API_KEY (OpenAI API key)
# - UPSTASH_REDIS_REST_URL (Optional, for caching)
# - UPSTASH_REDIS_REST_TOKEN (Optional)
```

### Database Setup

```bash
# Seed the database with sample activities
pnpm seed

# Generate embeddings for activities (requires OPENAI_API_KEY)
pnpm generate-embeddings

# Create MongoDB indexes
pnpm create-indexes
```

### Development

```bash
# Start development server
pnpm dev

# Open http://localhost:3000
```

### Build & Deploy

```bash
# Build for production
pnpm build

# Run production build locally
pnpm start
```

**Automated Deployment to Railway:**
- Deployment happens automatically when pushing to the `main` branch
- GitHub Actions workflow handles: validation → build → test → deploy
- See `.github/RAILWAY_SETUP.md` for setup instructions
- Configure GitHub secrets before your first deployment

---

## 📁 Project Structure

```
action-atlas/
├── apps/
│   └── web/                    # Next.js 15 application
│       ├── app/                # App Router (pages, layouts, API routes)
│       ├── components/         # React components
│       ├── lib/                # Utilities, clients (MongoDB, Redis)
│       └── package.json
│
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── database/               # MongoDB schemas and client
│   ├── ai/                     # AI services (embeddings, vector search)
│   └── config/                 # Shared configs (TypeScript, ESLint, etc.)
│
├── docs/                       # Comprehensive documentation
│   ├── README.md               # Documentation hub
│   ├── product-vision.md       # Product goals and scope
│   ├── tech-stack.md           # Technology decisions
│   ├── architecture.md         # System architecture
│   ├── milestones.md           # Implementation plan
│   └── adr/                    # Architecture Decision Records
│
├── scripts/                    # Utility scripts
│   ├── seed.ts                 # Database seeding
│   ├── generate-embeddings.ts # Batch embedding generation
│   └── create-indexes.ts       # MongoDB index creation
│
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
│
├── turbo.json                  # Turborepo configuration
├── package.json                # Root workspace
├── pnpm-workspace.yaml         # pnpm workspaces
└── README.md                   # This file
```

---

## 💻 Development Commands

```bash
# Development
pnpm dev                    # Start all apps in development mode
pnpm dev --filter=web       # Start only the web app

# Build
pnpm build                  # Build all packages and apps
pnpm build --filter=web     # Build only the web app

# Testing
pnpm test                   # Run all tests
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests only
pnpm test:e2e               # End-to-end tests (Playwright)
pnpm test:watch             # Watch mode for tests

# Code Quality
pnpm type-check             # TypeScript type checking
pnpm lint                   # ESLint linting
pnpm lint:fix               # Auto-fix linting issues
pnpm format                 # Format code with Prettier

# Database
pnpm seed                   # Seed database with sample data
pnpm generate-embeddings    # Generate embeddings for activities
pnpm create-indexes         # Create MongoDB indexes

# Deployment (automated via GitHub Actions)
git push origin main        # Push to main triggers Railway deployment
# See .github/RAILWAY_SETUP.md for configuration
# See .github/workflows/deploy-railway.yml for workflow details
```

---

## 🏗️ Architecture Overview

### Semantic Search Flow

```
┌─────────────┐
│    User     │
│   "teach    │  1. User enters natural language query
│  kids code" │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│   Next.js Frontend   │  2. Submit search query
│   (React 19)         │
└──────┬───────────────┘
       │ POST /api/search
       ▼
┌──────────────────────┐
│   API Route          │  3. Generate query embedding
│   (Next.js/Hono)     │     (OpenAI text-embedding-3-small)
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   MongoDB Atlas      │  4. Vector similarity search
│   Vector Search      │     (Cosine similarity)
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   Results            │  5. Return ranked activities
│   (20 activities)    │     (Semantic + location scoring)
└──────────────────────┘
```

**Performance:**
- Query embedding generation: <150ms
- Vector search: <50ms
- Total search latency: **<200ms (p95)**
- Cached searches: **<50ms**

See [docs/architecture.md](./docs/architecture.md) for detailed architecture diagrams.

---

## 💰 Cost Breakdown

### MVP Phase (0-1,000 users)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Railway | Hobby Plan | $5 |
| MongoDB Atlas | M0 Sandbox | $0 |
| OpenAI API | Pay-as-you-go | $5-10 |
| GitHub Actions | Free (2,000 min/month) | $0 |
| Sentry | Free (5K errors) | $0 |
| **Total** | | **$10-15/month** |

### Production Scale (10K searches/day)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Railway | Pro Plan | $20 |
| MongoDB Atlas | M10 (10GB) | $57 |
| OpenAI API | Pay-as-you-go | $30-50 |
| Sentry | Team | $26 |
| **Total** | | **$133-153/month** |

**Cost optimization:**
- Aggressive embedding caching (30-day TTL)
- Search result caching (5-minute TTL)
- Use text-embedding-3-small (5× cheaper than ada-002)

---

## 🎯 Implementation Status

### Completed ✅
- Product vision and scope definition
- Technology stack research and selection
- System architecture design
- Database schema design
- Implementation milestones (9-week plan)
- Architecture Decision Records (ADRs)

### Current Phase 🚧
- **Milestone 1**: Foundation & Infrastructure Setup
  - Monorepo initialization with Turborepo
  - TypeScript configuration
  - Shared types package
  - MongoDB Atlas setup

### Next Steps 📋
1. Complete database layer and core services
2. Implement AI integration (embeddings + vector search)
3. Build Next.js frontend with search UI
4. Add activity detail and organization pages
5. Create admin dashboard for activity approval
6. Optimize performance and add caching
7. Write comprehensive tests
8. Deploy to production

See [docs/milestones.md](./docs/milestones.md) for the complete implementation plan.

---

## 🤝 Contributing

This project is designed to be **AI-agent friendly** and follows clear architectural patterns.

### For Human Contributors

1. Read the [Product Vision](./docs/product-vision.md)
2. Review the [System Architecture](./docs/architecture.md)
3. Check the [Implementation Milestones](./docs/milestones.md) for current tasks
4. Follow the TypeScript patterns and conventions
5. Write tests for new functionality
6. Update documentation for architectural changes

### For AI Agents

This codebase is optimized for AI agent development:

- **Type Safety**: End-to-end TypeScript with strict mode
- **Clear Patterns**: Explicit over clever, simple over complex
- **Comprehensive Docs**: Architecture, tech stack, and milestones documented
- **Code Examples**: Implementation examples throughout documentation
- **ADRs**: Technology decisions explained with context

**Start with**: [docs/README.md](./docs/README.md) for AI agent guidance.

---

## 📊 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Search Latency (p95) | <200ms | 🎯 Target |
| Search Latency (cached) | <50ms | 🎯 Target |
| Uptime | >99.9% | 🎯 Target |
| Error Rate | <1% | 🎯 Target |
| Test Coverage | >75% | 🎯 Target |
| Lighthouse Score | >90 | 🎯 Target |
| Core Web Vitals | All passing | 🎯 Target |

---

## 🔒 Security

- **Rate Limiting**: 20 requests/minute per IP (Upstash Rate Limit)
- **Input Validation**: Zod schemas on all API endpoints
- **Secrets Management**: GitHub Secrets (encrypted) + Railway Environment Variables
- **API Keys**: Never committed to repository
- **HTTPS**: Automatic SSL via Railway
- **Security Headers**: X-Frame-Options, CSP, etc.
- **Deployment Security**: Secret validation before deployment, production environment protection

---

## 📝 License

To be determined. This project is currently in active development.

---

## 🙏 Acknowledgments

- **Vercel** - For the excellent AI SDK
- **Railway** - For simplified deployment and hosting platform
- **MongoDB** - For Atlas Vector Search capabilities
- **OpenAI** - For powerful embedding models

---

## 📞 Contact

For questions, feedback, or collaboration:

- **GitHub Issues**: [Create an issue](https://github.com/YOUR_ORG/action-atlas/issues)
- **Documentation**: [docs/](./docs)
- **Email**: [To be added]

---

## 🗺️ Roadmap

### Phase 1: MVP (Weeks 1-9) 🚧
- [x] Product vision and architecture
- [ ] Core search functionality
- [ ] Activity detail pages
- [ ] Admin dashboard
- [ ] Production deployment

### Phase 2: Enhancement (Post-MVP)
- [ ] User accounts and saved searches
- [ ] Advanced filtering (skills, time commitment)
- [ ] Activity recommendations
- [ ] Email notifications

### Phase 3: Scale (Future)
- [ ] Mobile applications
- [ ] Analytics dashboard
- [ ] Organization self-service portal
- [ ] API for third-party integrations

See [docs/milestones.md](./docs/milestones.md) for detailed implementation plan.

---

**Built with ❤️ for volunteers and non-profit organizations**

*Last updated: 2026-01-07*
