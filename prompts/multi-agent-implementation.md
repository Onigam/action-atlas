# Action Atlas - Multi-Agent Implementation Project

## Mission Statement

Implement the Action Atlas AI-powered semantic search engine for volunteering activities as a fully functional local development environment, following the comprehensive architecture and milestone documentation. Deliver a production-ready codebase via pull request.

## Project Context

**Repository**: action-atlas (already initialized with git)
**Current State**: Complete documentation and architecture, zero source code
**Goal**: Build entire monorepo with working local development environment
**Execution**: Multi-agent parallel implementation with sequential phase dependencies
**Deliverable**: Pull request with complete implementation, updated milestones tracking

## What Exists

- ✅ Complete documentation suite (`/docs/`)
  - Product vision, tech stack, architecture, milestones, ADRs
  - UI/UX design research and specifications
- ✅ Docker infrastructure (`docker-compose.yml`)
  - MongoDB 8.2 with vector search (mongot)
  - Replica set configuration
  - Data seeding scripts
- ✅ Real seed data (`/data/seed-dataset.agz` - 26MB)
- ✅ Specialized AI agent definitions (`/.claude/agents/`)

## What Needs to Be Built

**EVERYTHING** - The entire codebase from scratch:
- Monorepo infrastructure (Turborepo + pnpm workspaces)
- Shared packages (types, database, ai, config)
- Next.js 15 web application
- API routes and services
- UI components (search, activity cards, filters, map view)
- Database layer and MongoDB client
- AI services (OpenAI embeddings, vector search)
- Tests (unit, integration, E2E)
- Development scripts

## Scope: Local Development Environment ONLY

**In Scope** (Implement Now):
- ✅ Monorepo setup with Turborepo and pnpm
- ✅ TypeScript configuration (strict mode)
- ✅ Shared types package
- ✅ Database package (MongoDB client, schemas, operations)
- ✅ AI package (embeddings, vector search)
- ✅ Next.js 15 application with App Router
- ✅ Search functionality (semantic search + location)
- ✅ Activity detail pages
- ✅ Organization profiles
- ✅ UI components (SearchBar, ActivityCard, MapView, FilterPanel)
- ✅ API routes (/api/search, /api/activities, /api/organizations)
- ✅ Local development setup (Docker MongoDB + Redis)
- ✅ Environment variable configuration (.env.example, .env.local)
- ✅ Development scripts (seed data, create indexes, generate embeddings)
- ✅ Basic tests for critical paths
- ✅ README updates with setup instructions

**Out of Scope** (Mark as TODO for Future):
- ❌ Vercel deployment configuration
- ❌ Production MongoDB Atlas setup
- ❌ CI/CD workflows (GitHub Actions)
- ❌ Production environment variables
- ❌ Monitoring and logging (Sentry)
- ❌ Performance optimization for production
- ❌ Admin dashboard (complex UI, defer to Phase 2)
- ❌ User authentication (not in MVP scope)

## Required Documentation References

All agents MUST read and follow these documents:

1. **Architecture** (`/docs/architecture.md`)
   - System architecture diagrams
   - Data flow for semantic search (11 steps)
   - MongoDB schemas
   - API endpoint specifications
   - Monorepo structure

2. **Technology Stack** (`/docs/tech-stack.md`)
   - Frontend: Next.js 15 + React 19 + TypeScript 5.7
   - Backend: Hono + Next.js API Routes
   - Database: MongoDB Atlas with Vector Search
   - AI: Vercel AI SDK v4 (NOT Langchain)
   - Embeddings: OpenAI text-embedding-3-small

3. **Implementation Milestones** (`/docs/milestones.md`)
   - 9-week detailed implementation plan
   - Task breakdown with time estimates
   - Code examples for each milestone
   - Success criteria

4. **ADRs** (`/docs/adr/`)
   - ADR-001: MongoDB Atlas Vector Search (not separate vector DB)
   - ADR-002: Vercel AI SDK over Langchain (lightweight, type-safe)

5. **Design System** (`/docs/design-*.md`)
   - UI/UX best practices
   - Component specifications
   - Visual identity (colors, typography, spacing)

## Team Structure & Roles

### 1. Multi-Agent Coordinator (Primary Orchestrator)
**Agent**: `multi-agent-coordinator`
**Responsibilities**:
- Oversee entire project execution
- Launch and coordinate all specialized agents
- Manage agent communication and handoffs
- Resolve conflicts and blockers
- Ensure milestone progress
- Final integration and quality assurance

### 2. Project Manager
**Agent**: `project-manager`
**Responsibilities**:
- Break down milestones into granular tasks
- Assign tasks to specialized implementation agents
- Track progress against milestones
- Update milestone documentation with completion status
- Identify dependencies and critical path
- Report status to coordinator
- Mark remaining work with TODO flags

### 3. Context Manager
**Agent**: `context-manager`
**Responsibilities**:
- Maintain shared state across all agents
- Store completed implementations for reference
- Track file changes and modifications
- Provide context to agents on request
- Ensure consistency across implementations
- Document decisions and rationale

### 4. Technical Supervisor (Architect Reviewer)
**Agent**: `architect-reviewer`
**Responsibilities**:
- Review all implementations for architecture compliance
- Ensure adherence to ADRs and design patterns
- Validate TypeScript type safety
- Check code quality and best practices
- Approve major technical decisions
- Ensure consistency with documentation

### 5. Specialized Implementation Agents

**TypeScript Pro** (`typescript-pro`)
- Set up monorepo structure (Turborepo + pnpm)
- Configure TypeScript (strict mode, project references)
- Create shared types package
- Ensure type safety across all packages

**Backend Developer** (`backend-developer`)
- Implement database package (MongoDB client, schemas)
- Create AI package (embeddings, vector search)
- Build API routes (search, activities, organizations)
- Implement service layer
- Write backend tests

**Frontend Developer** (`frontend-developer`)
- Set up Next.js 15 application
- Implement App Router structure
- Build UI components (SearchBar, ActivityCard, etc.)
- Create page layouts (search, activity detail, org profile)
- Integrate API calls
- Write frontend tests

**DevOps Engineer** (`devops-engineer`)
- Verify Docker setup is working
- Create development scripts (seed, indexes, embeddings)
- Set up local Redis (optional for MVP)
- Document local development setup
- Create .env.example template

**UI Designer** (`ui-designer`)
- Implement design system with Tailwind CSS
- Create shadcn/ui component configurations
- Build reusable UI components
- Ensure accessibility (WCAG 2.1 AA)
- Implement responsive layouts

## Execution Strategy

### Phase 1: Foundation
**Owner**: TypeScript Pro + DevOps Engineer
**Dependencies**: None (can start immediately)

1. Initialize monorepo
   ```bash
   npx create-turbo@latest action-atlas
   cd action-atlas
   ```

2. Configure pnpm workspaces
   ```yaml
   # pnpm-workspace.yaml
   packages:
     - "apps/*"
     - "packages/*"
   ```

3. Set up TypeScript configs (base, nextjs, node, library)

4. Create packages structure:
   - `packages/types/` - Shared TypeScript types
   - `packages/database/` - MongoDB client and schemas
   - `packages/ai/` - AI services
   - `packages/config/` - Shared configs

5. Verify Docker environment
   ```bash
   docker-compose up -d
   # Verify MongoDB + mongot are running
   ```

6. Create root package.json with scripts:
   ```json
   {
     "scripts": {
       "dev": "turbo run dev",
       "build": "turbo run build",
       "test": "turbo run test",
       "type-check": "turbo run type-check",
       "lint": "turbo run lint"
     }
   }
   ```

**Deliverables**:
- Monorepo structure initialized
- TypeScript compilation works
- Docker environment verified
- Ready for implementation

### Phase 2: Shared Packages
**Owner**: TypeScript Pro + Backend Developer
**Dependencies**: Phase 1 complete (monorepo structure ready)

1. **packages/types/** - Implement domain types
   - `src/domain/activity.ts` - Activity interface, branded ActivityId
   - `src/domain/organization.ts` - Organization interface
   - `src/domain/location.ts` - Location, Coordinates, Address
   - `src/vector/embeddings.ts` - Embedding types, validation
   - `src/api/search.ts` - SearchQuery, SearchResponse
   - Export all from `src/index.ts`

2. **packages/database/** - MongoDB layer
   - `src/client.ts` - MongoDB client with connection pooling
   - `src/schemas/activity.ts` - ActivityDocument interface
   - `src/schemas/organization.ts` - OrganizationDocument
   - `src/collections.ts` - Collection accessors
   - `src/validation/` - Zod schemas
   - `src/operations/` - CRUD operations

3. **packages/ai/** - AI services
   - `src/embedding-service.ts` - OpenAI embeddings with Vercel AI SDK
   - `src/vector-search.ts` - MongoDB vector search queries
   - `src/cache.ts` - Embedding caching logic
   - Install: `ai`, `@ai-sdk/openai`

**Deliverables**:
- All shared packages built and tested
- Type checking passes
- Packages can be imported by apps

### Phase 3: Next.js Application Foundation
**Owner**: Frontend Developer + UI Designer
**Dependencies**: Phase 1 complete (can run in parallel with Phase 2)

1. Create Next.js 15 app
   ```bash
   cd apps
   npx create-next-app@latest web --typescript --tailwind --app
   ```

2. Configure Next.js
   - Enable App Router
   - Set up path aliases (@/ prefix)
   - Configure tailwind.config.js with design tokens
   - Install shadcn/ui: `npx shadcn@latest init`

3. Create app structure:
   ```
   apps/web/
   ├── app/
   │   ├── layout.tsx (root layout)
   │   ├── page.tsx (home/search page)
   │   ├── search/
   │   │   └── page.tsx
   │   ├── activities/
   │   │   └── [id]/
   │   │       └── page.tsx
   │   ├── organizations/
   │   │   └── [id]/
   │   │       └── page.tsx
   │   └── api/
   │       ├── search/
   │       │   └── route.ts
   │       ├── activities/
   │       │   ├── route.ts
   │       │   └── [id]/
   │       │       └── route.ts
   │       └── organizations/
   │           └── [id]/
   │               └── route.ts
   ├── components/
   │   ├── search/
   │   │   ├── SearchBar.tsx
   │   │   ├── SearchResults.tsx
   │   │   └── FilterPanel.tsx
   │   ├── activities/
   │   │   ├── ActivityCard.tsx
   │   │   ├── ActivityDetail.tsx
   │   │   └── MapView.tsx
   │   └── ui/ (shadcn components)
   └── lib/
       ├── api-client.ts
       └── utils.ts
   ```

4. Implement base layout with navigation

**Deliverables**:
- Next.js app running on localhost:3000
- Basic routing structure
- Tailwind CSS configured with design tokens

### Phase 4: Search Functionality
**Owner**: Backend Developer + Frontend Developer
**Dependencies**: Phases 2 & 3 complete (needs packages and Next.js app)

1. **Backend** - Implement /api/search
   - Accept query, location filters, pagination
   - Generate query embedding using OpenAI
   - Perform vector search on MongoDB
   - Apply geospatial filtering
   - Hybrid scoring (70% semantic + 30% location)
   - Return paginated results
   - Cache results in Redis (if available)

2. **Frontend** - Build search UI
   - SearchBar component with autocomplete
   - Real-time search with debouncing
   - FilterPanel (category, skills, time commitment)
   - SearchResults list view
   - Loading states and error handling
   - Pagination

3. **Integration**
   - Connect frontend to backend API
   - Handle search queries end-to-end
   - Display results with relevance scores

**Deliverables**:
- Working semantic search from UI to database
- Sub-200ms search latency (local)
- Results display with activity cards

### Phase 5: Activity & Organization Pages
**Owner**: Frontend Developer + Backend Developer
**Dependencies**: Phase 4 complete (can partially overlap with Phase 4)

1. **Backend** - Activity & Organization APIs
   - GET /api/activities/:id - Fetch single activity
   - GET /api/organizations/:id - Fetch organization
   - POST /api/activities - Create activity (defer to admin dashboard)

2. **Frontend** - Detail pages
   - Activity detail page with full information
   - Organization profile page
   - MapView component showing location
   - Contact information display
   - Related activities section

**Deliverables**:
- Activity detail pages fully functional
- Organization profile pages
- Navigation between search and details

### Phase 6: Data & Development Scripts
**Owner**: DevOps Engineer + Backend Developer
**Dependencies**: Phase 2 complete (needs database package)

1. **Data seeding script**
   ```bash
   # scripts/seed-database.ts
   - Load data from /data/seed-dataset.agz
   - Or use mongorestore
   - Verify data loaded correctly
   ```

2. **Embedding generation script**
   ```bash
   # scripts/generate-embeddings.ts
   - Fetch all activities without embeddings
   - Generate embeddings in batches (100 at a time)
   - Update activities with embeddings
   - Show progress bar
   ```

3. **Index creation script**
   ```bash
   # scripts/create-indexes.ts
   - Create vector search index
   - Create geospatial index
   - Create text indexes
   - Verify indexes created
   ```

4. **Package.json scripts**
   ```json
   {
     "scripts": {
       "seed": "tsx scripts/seed-database.ts",
       "generate-embeddings": "tsx scripts/generate-embeddings.ts",
       "create-indexes": "tsx scripts/create-indexes.ts",
       "setup": "pnpm seed && pnpm generate-embeddings && pnpm create-indexes"
     }
   }
   ```

**Deliverables**:
- Database seeded with real data
- Embeddings generated for all activities
- Indexes created for vector search
- Scripts documented in README

### Phase 7: Testing & Documentation
**Owner**: All Implementation Agents + Technical Supervisor
**Dependencies**: Phases 4, 5, 6 complete (all features implemented)

1. **Unit tests**
   - Test shared packages (types, database, ai)
   - Test utility functions
   - Test API route handlers

2. **Integration tests**
   - Test search flow end-to-end
   - Test activity CRUD operations
   - Test embedding generation

3. **E2E tests** (Basic)
   - Test search from UI
   - Test navigation to activity detail
   - Test error states

4. **Documentation updates**
   - Update README with setup instructions
   - Document environment variables
   - Create CONTRIBUTING.md
   - Update milestones with completion status

**Deliverables**:
- >75% test coverage on critical paths
- All tests passing
- Documentation complete and accurate

### Phase 8: Integration & PR
**Owner**: Multi-Agent Coordinator + Technical Supervisor
**Dependencies**: Phase 7 complete (all tests passing)

1. **Code review**
   - Architect reviews all implementations
   - Ensure consistency with ADRs
   - Verify type safety
   - Check error handling

2. **Integration testing**
   - Full end-to-end testing
   - Performance verification (<200ms search)
   - Cross-browser testing
   - Mobile responsiveness

3. **Milestone updates**
   - Mark completed sections in milestones.md
   - Add TODO flags for deferred work
   - Update progress tracking

4. **Pull request**
   - Create feature branch
   - Comprehensive PR description
   - Link to documentation
   - List what's implemented vs TODO

**Deliverables**:
- Feature branch with complete implementation
- Pull request ready for review
- Updated milestone documentation

## Quality Standards

### Type Safety
- ✅ TypeScript strict mode enabled
- ✅ No `any` types (use `unknown` with guards)
- ✅ Branded types for IDs (ActivityId, OrganizationId)
- ✅ Discriminated unions for result types
- ✅ Type guards with 100% coverage

### Code Quality
- ✅ ESLint configured and passing
- ✅ Prettier for consistent formatting
- ✅ Clear, descriptive variable names
- ✅ Functions <50 lines
- ✅ DRY principle (no code duplication)
- ✅ Comments for complex logic only

### Performance
- ✅ Search latency <200ms (p95, local)
- ✅ First Contentful Paint <1.5s
- ✅ Lighthouse score >90
- ✅ Bundle size optimized
- ✅ Code splitting implemented

### Testing
- ✅ >75% test coverage on critical paths
- ✅ All API routes tested
- ✅ Search flow integration tested
- ✅ Error cases handled

### Accessibility
- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation works
- ✅ Screen reader support
- ✅ Color contrast ratios met
- ✅ Focus management

## Agent Communication Protocol

### Status Updates
Each agent must provide regular updates:
```markdown
**Agent**: [agent-name]
**Task**: [current task]
**Status**: [in_progress | completed | blocked]
**Progress**: [percentage]
**Blockers**: [list any blockers]
**Next**: [next task]
```

### Handoffs
When an agent completes work that another agent depends on:
```markdown
**From**: [agent-name]
**To**: [agent-name]
**Completed**: [what was delivered]
**Files**: [list of files created/modified]
**Notes**: [any important context]
```

### Questions/Blockers
When an agent encounters a blocker:
```markdown
**Agent**: [agent-name]
**Blocker**: [description]
**Impact**: [what's blocked]
**Needs**: [what's needed to unblock]
**Urgency**: [low | medium | high]
```

## Milestone Tracking Updates

The Project Manager must update `/docs/milestones.md` with:

1. **Mark completed sections**:
   ```markdown
   - [x] Task completed ✅
   ```

2. **Add TODO flags for deferred work**:
   ```markdown
   - [ ] TODO: Deploy to Vercel (deferred - local dev only)
   - [ ] TODO: Set up GitHub Actions CI/CD (deferred)
   - [ ] TODO: Configure production MongoDB Atlas (deferred)
   - [ ] TODO: Implement admin dashboard (Phase 2)
   ```

3. **Update milestone headers**:
   ```markdown
   ## Milestone 1: Foundation & Infrastructure Setup ✅ COMPLETED
   ## Milestone 2: Database Layer & Core Services ✅ COMPLETED
   ## Milestone 7: Optimization & Polish ⏸️ DEFERRED (Cloud deployment)
   ```

## Environment Variables Template

Create `.env.example`:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/actionatlas

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Redis (Optional for MVP)
REDIS_URL=redis://localhost:6379

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000

# Development
NODE_ENV=development
```

## Success Criteria

### Functional Requirements
- ✅ User can search for activities with natural language
- ✅ Search returns semantically relevant results
- ✅ Location-based filtering works
- ✅ Activity detail pages display full information
- ✅ Organization profiles accessible
- ✅ UI is responsive (mobile + desktop)
- ✅ Keyboard navigation works

### Technical Requirements
- ✅ Monorepo builds without errors
- ✅ TypeScript compiles with strict mode, no errors
- ✅ All tests pass (unit + integration)
- ✅ Docker environment works (MongoDB + mongot)
- ✅ Data seeding scripts work
- ✅ Embedding generation works
- ✅ Vector search returns results

### Documentation Requirements
- ✅ README has clear setup instructions
- ✅ All environment variables documented
- ✅ Milestones updated with completion status
- ✅ TODO flags added for deferred work
- ✅ Code has JSDoc comments where needed

## Deferred Work (Mark as TODO)

The following items should be marked with TODO flags in milestones.md:

### Cloud Deployment (Future Iteration)
- TODO: Vercel project setup and configuration
- TODO: Production MongoDB Atlas cluster
- TODO: Environment variables in Vercel
- TODO: Domain configuration
- TODO: SSL/TLS certificates

### CI/CD (Future Iteration)
- TODO: GitHub Actions workflows
- TODO: Automated testing in CI
- TODO: Build and deploy automation
- TODO: Preview deployments for PRs

### Monitoring & Observability (Future Iteration)
- TODO: Sentry error tracking integration
- TODO: Vercel Analytics setup
- TODO: Performance monitoring
- TODO: Logging infrastructure

### Admin Dashboard (Phase 2)
- TODO: Admin authentication
- TODO: Activity approval interface
- TODO: Organization verification
- TODO: Activity management (CRUD)
- TODO: Analytics dashboard

### Advanced Features (Phase 2+)
- TODO: User accounts and saved searches
- TODO: Email notifications
- TODO: Activity recommendations
- TODO: Advanced filters (skills, time commitment)
- TODO: Social sharing

## Final Deliverable

**Feature Branch**: `feat/mvp-local-development`
**Pull Request Title**: "feat: Implement Action Atlas MVP (Local Development Environment)"
**PR Description**: Should include:
- Summary of implementation
- What's included (features, packages, tests)
- What's deferred (cloud deployment, CI/CD, admin dashboard)
- Setup instructions
- Testing instructions
- Screenshots of working application
- Link to updated milestones documentation

## Execution Command

Multi-Agent Coordinator, you are now authorized to:
1. Launch all specialized agents as needed
2. Distribute work according to this plan
3. Coordinate execution across all phases
4. Ensure quality standards are met
5. Deliver final pull request

**BEGIN IMPLEMENTATION**
