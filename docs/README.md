# Action Atlas Documentation

Welcome to the Action Atlas documentation! This directory contains comprehensive technical documentation for building and maintaining the Action Atlas platform.

---

## Documentation Structure

This documentation is organized into focused categories for easy navigation:

### Core Documentation (Root Level)
- **[Product Vision](./product-vision.md)** - Product goals, target users, and MVP scope
- **[Technology Stack](./tech-stack.md)** - Complete technology choices with rationale
- **[System Architecture](./architecture.md)** - System design, data flows, and infrastructure
- **[Implementation Milestones](./milestones.md)** - Step-by-step implementation plan (9 weeks to MVP)
- **[Architecture Review Report](./architecture-review-report.md)** - Post-implementation architecture review

### Categorized Documentation

#### [📋 Governance](./governance/)
Project management, contribution guidelines, and development standards:
- **[CLAUDE.md](./governance/CLAUDE.md)** - Instructions for AI agents working on the project
- **[CONTRIBUTING.md](./governance/CONTRIBUTING.md)** - Contribution guidelines and workflow
- **[MONOREPO_SETUP.md](./governance/MONOREPO_SETUP.md)** - Monorepo structure and package management
- **[DEFERRED_WORK.md](./governance/DEFERRED_WORK.md)** - Future enhancements and deferred features

#### [📊 Project Status](./project-status/)
Implementation progress reports and milestone tracking:
- Phase implementation summaries (Phase 2, 4, 5)
- Milestone 3 status reports and corrections
- Executive summaries and progress tracking

#### [🎨 Design System](./design-system/)
UI/UX design specifications, components, and brand guidelines:
- **[Design System](./design-system/design-system.md)** - Complete design system specification
- **[Color Palette](./design-system/color-palette.md)** - Comprehensive color system
- **[Component Examples](./design-system/component-examples.md)** - UI component implementations
- **[Design Implementation Guide](./design-system/design-implementation-guide.md)** - Developer guide
- Additional: Color summaries, design mood board, quick references (see root docs/)

#### [🔌 API Documentation](./api/)
API endpoints, package documentation, and integration guides:
- **[API Documentation](./api/api-documentation.md)** - REST API endpoints and usage
- **[Database Package](./api/database-package.md)** - MongoDB schema and operations
- **[AI Package](./api/ai-package.md)** - AI services and embeddings

#### [🛠️ Operations](./operations/)
DevOps, deployment, and operational procedures:
- **[Docker Operations](./operations/docker-operations.md)** - Container management and deployment
- **[DevOps Summary](./operations/devops-summary.md)** - Infrastructure and deployment overview

#### [⚙️ Development Setup](./development-setup/)
Local development environment configuration:
- **[README](./development-setup/README.md)** - Setup overview
- **[Docker Local Setup](./development-setup/docker-local-setup.md)** - Docker-based development
- **[Data Management](./development-setup/data-management.md)** - Database seeding and management
- **[Alternatives](./development-setup/alternatives.md)** - Alternative setup approaches

#### [📝 Architecture Decision Records](./adr/)
Key technology decisions with context and rationale:
- **[ADR-001](./adr/001-mongodb-atlas-vector-search.md)** - MongoDB Atlas Vector Search
- **[ADR-002](./adr/002-vercel-ai-sdk-over-langchain.md)** - Vercel AI SDK over Langchain

#### [💡 Prompts](./prompts/)
Prompt engineering and AI agent instructions:
- Multi-agent implementation strategies
- Prompt templates and examples

---

## Quick Links

- **[Product Vision](./product-vision.md)** - Product goals, target users, and MVP scope
- **[Technology Stack](./tech-stack.md)** - Complete technology choices with rationale
- **[System Architecture](./architecture.md)** - System design, data flows, and infrastructure
- **[Implementation Milestones](./milestones.md)** - Step-by-step implementation plan (9 weeks to MVP)
- **[Architecture Decisions (ADRs)](./adr/)** - Key technology decisions with context

---

## For AI Agents

If you're an AI agent tasked with implementing or maintaining Action Atlas, start here:

1. **Read [Product Vision](./product-vision.md)** to understand what we're building and why
2. **Review [Technology Stack](./tech-stack.md)** to understand technology choices
3. **Study [System Architecture](./architecture.md)** to understand how components connect
4. **Follow [Implementation Milestones](./milestones.md)** for step-by-step tasks

### Key Principles for AI Agents

- **Type Safety First**: All code is TypeScript with strict mode enabled
- **Simple Over Clever**: Prefer explicit, clear code over abstractions
- **End-to-End Types**: Types flow from database → API → frontend
- **Test Critical Paths**: 80%+ coverage on search, embeddings, and API
- **Document Decisions**: Update ADRs when making significant changes

---

## Documentation Overview

### Product Documentation

**[Product Vision](./product-vision.md)**
- Problem statement: Volunteers struggle to discover relevant activities
- Target users: Individual volunteers, event organizers, non-profits
- Value proposition: AI-powered semantic search for volunteering activities
- MVP scope: Search, activity details, basic admin approval
- Success metrics: Search latency, catalog size, user engagement

### Technical Documentation

**[Technology Stack](./tech-stack.md)**
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Hono API + Next.js API Routes
- **AI Framework**: Vercel AI SDK v4 (NOT Langchain)
- **Database**: MongoDB Atlas with Vector Search
- **Embeddings**: OpenAI text-embedding-3-small
- **Deployment**: Vercel + MongoDB Atlas
- **Monitoring**: Sentry + Vercel Analytics
- **Cost**: $6-12/month for MVP

**[System Architecture](./architecture.md)**
- System architecture diagram
- Data flow for semantic search (11-step process)
- MongoDB document schemas
- API endpoint specifications
- Monorepo structure (Turborepo)
- Security architecture
- Scaling considerations
- Disaster recovery plan

**[Implementation Milestones](./milestones.md)**

9-week implementation plan broken into milestones:
1. **Week 1**: Foundation & Infrastructure Setup
2. **Week 2**: Database Layer & Core Services
3. **Week 3**: AI Integration & Vector Search
4. **Week 4**: Next.js Frontend Foundation
5. **Week 5**: Activity Detail & Organization Pages
6. **Week 6**: Admin Dashboard & Activity Management
7. **Week 7**: Optimization & Polish
8. **Week 8**: Testing & Documentation
9. **Week 9+**: Production Launch

Each milestone includes:
- Estimated duration
- Specific tasks with time estimates
- Deliverables
- Success criteria
- Code examples

### Architecture Decision Records (ADRs)

**[ADR-001: MongoDB Atlas Vector Search](./adr/001-mongodb-atlas-vector-search.md)**
- **Decision**: Use MongoDB Atlas Vector Search over separate vector database
- **Rationale**: Single database, simpler architecture, better consistency
- **Alternatives**: ChromaDB, Qdrant, Pinecone, pgvector
- **Migration Path**: Can migrate to Qdrant if scaling requires it

**[ADR-002: Vercel AI SDK over Langchain](./adr/002-vercel-ai-sdk-over-langchain.md)**
- **Decision**: Use Vercel AI SDK v4 for all AI operations
- **Rationale**: Lightweight (20KB vs 50MB+), type-safe, AI-agent friendly
- **Alternatives**: Langchain (too bloated), LlamaIndex (overkill), Direct OpenAI SDK
- **Key Benefit**: Simple patterns that AI agents can understand

---

## Project Structure

```
action-atlas/
├── docs/                                # This directory
│   ├── README.md                        # This file
│   ├── product-vision.md                # Product goals and scope
│   ├── tech-stack.md                    # Technology decisions
│   ├── architecture.md                  # System architecture
│   ├── milestones.md                    # Implementation plan
│   ├── architecture-review-report.md    # Architecture review
│   │
│   ├── governance/                      # Project governance
│   │   ├── CLAUDE.md                    # AI agent instructions
│   │   ├── CONTRIBUTING.md              # Contribution guidelines
│   │   ├── MONOREPO_SETUP.md            # Monorepo configuration
│   │   └── DEFERRED_WORK.md             # Future enhancements
│   │
│   ├── project-status/                  # Implementation reports
│   │   ├── phase-*-implementation-summary.md
│   │   └── milestone-*-status.md
│   │
│   ├── design-system/                   # UI/UX specifications
│   │   ├── design-system.md             # Main design system
│   │   ├── color-palette.md             # Color specifications
│   │   ├── component-examples.md        # UI components
│   │   └── design-implementation-guide.md
│   │
│   ├── api/                             # API documentation
│   │   ├── api-documentation.md         # REST API endpoints
│   │   ├── database-package.md          # Database operations
│   │   └── ai-package.md                # AI services
│   │
│   ├── operations/                      # DevOps documentation
│   │   ├── docker-operations.md         # Container management
│   │   └── devops-summary.md            # Infrastructure overview
│   │
│   ├── development-setup/               # Local setup guides
│   │   ├── README.md                    # Setup overview
│   │   ├── docker-local-setup.md        # Docker development
│   │   └── data-management.md           # Database management
│   │
│   ├── adr/                             # Architecture Decision Records
│   │   ├── 001-mongodb-atlas-vector-search.md
│   │   └── 002-vercel-ai-sdk-over-langchain.md
│   │
│   └── prompts/                         # Prompt engineering
│       └── multi-agent-implementation.md
│
├── apps/
│   └── web/                             # Next.js 15 frontend
│       ├── app/                         # App Router
│       ├── components/                  # React components
│       └── lib/                         # Utilities
│
├── packages/
│   ├── types/                           # Shared TypeScript types
│   ├── database/                        # MongoDB schemas and client
│   ├── ai/                              # AI services (embeddings, vector search)
│   └── config/                          # Shared configurations
│
├── scripts/                             # Utility scripts
│   ├── seed.ts                          # Database seeding
│   └── generate-embeddings.ts           # Batch embedding generation
│
├── turbo.json                           # Turborepo configuration
└── package.json                         # Root workspace
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- MongoDB Atlas account (free M0 tier)
- OpenAI API key
- Vercel account (for deployment)

### Quick Start

```bash
# Clone repository
git clone https://github.com/YOUR_ORG/action-atlas.git
cd action-atlas

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Seed database
pnpm seed

# Generate embeddings
pnpm generate-embeddings

# Start development server
pnpm dev
```

### Development Workflow

1. **Create feature branch**: `git checkout -b feature/your-feature`
2. **Make changes**: Edit code, add tests
3. **Type check**: `pnpm type-check`
4. **Run tests**: `pnpm test`
5. **Lint**: `pnpm lint`
6. **Commit**: `git commit -m "feat: your feature"`
7. **Push**: `git push origin feature/your-feature`
8. **Create PR**: GitHub will automatically deploy preview

---

## Key Technologies & Decisions

### Why Next.js 15?
- Server Components for better performance
- App Router for modern routing
- Built-in optimizations (images, fonts, etc.)
- Seamless Vercel deployment
- **See**: [tech-stack.md](./tech-stack.md#frontend-stack)

### Why MongoDB Atlas Vector Search?
- Single database (activities + embeddings)
- No synchronization issues
- Lower operational complexity
- Free tier for MVP
- **See**: [ADR-001](./adr/001-mongodb-atlas-vector-search.md)

### Why Vercel AI SDK over Langchain?
- Lightweight (20KB vs 50MB+)
- Type-safe and AI-agent friendly
- Built-in rate limiting
- Simple, clear patterns
- **See**: [ADR-002](./adr/002-vercel-ai-sdk-over-langchain.md)

### Why Turborepo?
- Fast incremental builds with caching
- Simple configuration
- Excellent TypeScript support
- Shared types between frontend/backend
- **See**: [tech-stack.md](./tech-stack.md#monorepo-turborepo)

---

## Cost Breakdown

### MVP (0-1K users)
| Service | Cost |
|---------|------|
| Vercel (Free tier) | $0 |
| MongoDB Atlas (M0) | $0 |
| OpenAI API | $5-10 |
| GitHub Actions | $0 |
| **Total** | **$6-12/month** |

### Production (10K searches/day)
| Service | Cost |
|---------|------|
| Vercel (Pro) | $20 |
| MongoDB Atlas (M10) | $57 |
| OpenAI API | $30-50 |
| Sentry (Team) | $26 |
| **Total** | **$133-153/month** |

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Search Latency (p95) | <200ms | Vercel Analytics |
| Search Latency (cached) | <50ms | Redis metrics |
| Uptime | >99.9% | Better Stack |
| Error Rate | <1% | Sentry |
| Test Coverage | >75% | Vitest |
| Lighthouse Score | >90 | Lighthouse CI |

---

## Support & Contribution

### For Questions
- Check documentation in this directory first
- Review [Architecture](./architecture.md) for system design questions
- Review [Milestones](./milestones.md) for implementation questions
- Check [ADRs](./adr/) for technology decision context
- See [Development Setup](./development-setup/) for environment configuration
- Check [Project Status](./project-status/) for current progress

### For Contributions
1. Read [CONTRIBUTING.md](./governance/CONTRIBUTING.md) for contribution guidelines
2. Review [Monorepo Setup](./governance/MONOREPO_SETUP.md) for package structure
3. Follow the TypeScript patterns in existing code
4. Add tests for new functionality
5. Update documentation if changing architecture
6. Create ADR for significant technical decisions

### For AI Agents
- Start with [CLAUDE.md](./governance/CLAUDE.md) for AI-specific instructions
- Prioritize type safety and clarity
- Follow patterns in [Architecture](./architecture.md)
- Update [Milestones](./milestones.md) as you complete tasks
- Document significant decisions as new ADRs
- Check [Deferred Work](./governance/DEFERRED_WORK.md) before implementing new features

---

## Document Versions

| Document | Version | Last Updated | Status |
|----------|---------|--------------|--------|
| Product Vision | 2.0 | 2026-01-07 | Approved |
| Tech Stack | 1.0 | 2026-01-07 | Approved |
| Architecture | 1.0 | 2026-01-07 | Approved |
| Milestones | 1.0 | 2026-01-07 | Ready for Implementation |
| ADR-001 | 1.0 | 2026-01-07 | Accepted |
| ADR-002 | 1.0 | 2026-01-07 | Accepted |

---

## Next Steps

1. **Review project status**: Check [Project Status](./project-status/) for current progress
2. **Set up development environment**: Follow [Development Setup](./development-setup/)
3. **Understand the architecture**: Read [Architecture](./architecture.md) and [ADRs](./adr/)
4. **Check implementation milestones**: Review [Milestones](./milestones.md) for remaining tasks
5. **Review deferred work**: See [Deferred Work](./governance/DEFERRED_WORK.md) for future enhancements
6. **Contribute**: Follow [CONTRIBUTING.md](./governance/CONTRIBUTING.md) guidelines

## Finding Documentation

**New to the project?** Start here:
1. [Product Vision](./product-vision.md) - Understand what we're building
2. [Technology Stack](./tech-stack.md) - Learn about our tech choices
3. [Architecture](./architecture.md) - See how it all fits together
4. [Development Setup](./development-setup/) - Get your environment ready

**Looking for specific information?**
- Design & UI: [Design System](./design-system/)
- API details: [API Documentation](./api/)
- Deployment: [Operations](./operations/)
- Progress: [Project Status](./project-status/)
- Contributing: [Governance](./governance/)

---

**Last Updated**: 2026-01-13
**Maintained By**: Development Team + AI Agents
**License**: [To be determined]
