# Monorepo Setup Complete

This document describes the complete monorepo foundation for Action Atlas.

## Overview

The monorepo is built with:
- **Turborepo**: Task orchestration and caching
- **pnpm workspaces**: Package management and linking
- **TypeScript 5.7**: Type-safe development with strict mode
- **ESLint + Prettier**: Code quality and formatting

## Structure

```
action-atlas/
├── apps/
│   └── web/                          # Next.js 15 frontend
│       ├── app/                      # App Router pages
│       ├── components/               # React components (empty)
│       ├── lib/                      # Utilities (empty)
│       ├── next.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── types/                        # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── domain/              # Domain models (Activity, Organization, Location)
│   │   │   ├── api/                 # API request/response types
│   │   │   └── vector/              # Embedding types
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── database/                     # MongoDB client and schemas
│   │   ├── src/
│   │   │   ├── client.ts            # MongoDB connection
│   │   │   ├── schemas/             # Collection helpers
│   │   │   └── scripts/             # Seeding and indexing
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── ai/                           # AI services
│   │   ├── src/
│   │   │   ├── embedding.ts         # Vercel AI SDK wrappers
│   │   │   ├── vector-search.ts     # Vector operations
│   │   │   ├── cache.ts             # Embedding cache
│   │   │   └── scripts/             # Utilities
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── config/                       # Shared configs
│       ├── eslint.js
│       ├── tsconfig.json
│       └── package.json
│
├── turbo.json                        # Turborepo config
├── pnpm-workspace.yaml               # pnpm workspaces
├── tsconfig.json                     # Root TypeScript config
├── tsconfig.base.json                # Base TypeScript settings
├── tsconfig.library.json             # For packages
├── tsconfig.node.json                # For Node.js scripts
├── tsconfig.nextjs.json              # For Next.js apps
├── .eslintrc.json                    # ESLint config
├── .prettierrc.json                  # Prettier config
├── .editorconfig                     # Editor settings
└── package.json                      # Root workspace
```

## TypeScript Configuration

### Strict Mode Enabled

All packages use TypeScript strict mode with additional safety flags:

- `strict: true` - All strict checks
- `noUncheckedIndexedAccess: true` - Array access safety
- `exactOptionalPropertyTypes: true` - Stricter optional handling
- `noImplicitReturns: true` - Explicit returns
- `noFallthroughCasesInSwitch: true` - Switch statement safety
- `noUnusedLocals: true` - Detect unused variables
- `noUnusedParameters: true` - Detect unused parameters
- `noPropertyAccessFromIndexSignature: true` - Index signature safety

### TypeScript Configurations

- **tsconfig.base.json**: Base configuration shared by all packages
- **tsconfig.library.json**: For shared packages (types, database, ai)
- **tsconfig.node.json**: For Node.js scripts and backend code
- **tsconfig.nextjs.json**: For Next.js applications with React types

### Project References

The monorepo uses TypeScript project references for faster builds:

```json
{
  "references": [
    { "path": "../../packages/types" },
    { "path": "../../packages/database" },
    { "path": "../../packages/ai" }
  ]
}
```

## Package Dependencies

### Workspace Dependencies

Packages reference each other using workspace protocol:

```json
{
  "dependencies": {
    "@action-atlas/types": "workspace:*",
    "@action-atlas/database": "workspace:*",
    "@action-atlas/ai": "workspace:*"
  }
}
```

### Dependency Graph

```
web (Next.js app)
├── @action-atlas/types
├── @action-atlas/database
│   └── @action-atlas/types
└── @action-atlas/ai
    └── @action-atlas/types
```

## Available Scripts

### Root Scripts

```bash
# Development
pnpm dev                    # Start all apps in development mode
pnpm build                  # Build all packages and apps
pnpm type-check            # Type-check all packages

# Code Quality
pnpm lint                   # Lint all packages
pnpm lint:fix              # Auto-fix lint issues
pnpm format                # Format code with Prettier
pnpm format:check          # Check formatting

# Testing
pnpm test                  # Run all tests
pnpm test:unit             # Run unit tests
pnpm test:integration      # Run integration tests
pnpm test:e2e              # Run end-to-end tests
pnpm test:watch            # Run tests in watch mode

# Database
pnpm seed                  # Seed database with sample data
pnpm generate-embeddings   # Generate embeddings for activities
pnpm create-indexes        # Create MongoDB indexes

# Maintenance
pnpm clean                 # Clean all build artifacts
```

### Turborepo Pipelines

Turborepo orchestrates tasks with dependency-aware execution:

- **build**: Builds packages in dependency order with caching
- **dev**: Runs development servers (persistent, no cache)
- **test**: Runs tests after building dependencies
- **type-check**: Type-checks all packages
- **lint**: Lints code after building

### Caching

Turborepo caches task outputs for faster subsequent runs:
- Build outputs: `.next/`, `dist/`
- Type-check results
- Test coverage

## Code Quality

### ESLint Configuration

Strict ESLint rules enforce:
- No `any` types
- Consistent type imports
- Import ordering
- No unused variables
- No floating promises
- Proper async/await usage

### Prettier Configuration

Automatic code formatting with:
- Single quotes
- 2-space indentation
- Semicolons
- Trailing commas (ES5)
- Tailwind CSS class sorting

## Key Features

### 1. Full Type Safety

- 100% TypeScript coverage
- Strict mode enabled everywhere
- Zod schemas for runtime validation
- Shared types across frontend and backend

### 2. Fast Builds

- Turborepo caching (local and remote)
- Incremental TypeScript compilation
- Project references for faster type checking
- Parallel task execution

### 3. Developer Experience

- Hot module reloading (Next.js with Turbopack)
- Watch mode for type checking
- Instant linting feedback
- Auto-formatting on save

### 4. Monorepo Benefits

- Share code easily between packages
- Single dependency version across workspace
- Atomic commits across multiple packages
- Coordinated releases

## Verification

All systems verified and working:

```bash
✓ pnpm install              # Dependencies installed successfully
✓ pnpm type-check          # No TypeScript errors
✓ pnpm build               # All packages build successfully
✓ pnpm lint                # No linting errors
```

## Next Steps

The monorepo foundation is complete. Ready for:

1. **Phase 2**: Implement MongoDB client and schemas
2. **Phase 3**: Implement AI services (embeddings, vector search)
3. **Phase 4**: Implement Next.js API routes
4. **Phase 5**: Implement frontend components

## Package Details

### @action-atlas/types

**Purpose**: Shared TypeScript types and Zod schemas

**Exports**:
- Domain types: `Activity`, `Organization`, `Location`
- API types: `SearchQuery`, `SearchResponse`, `ActivityResponse`
- Vector types: `Embedding`, `EmbeddingRequest`, `EmbeddingResponse`

**Dependencies**: `zod`

### @action-atlas/database

**Purpose**: MongoDB client and database operations

**Exports**:
- `connectToDatabase()`: Connect to MongoDB
- `disconnectFromDatabase()`: Disconnect from MongoDB
- `getDatabase()`: Get database instance
- Collection helpers: `getActivitiesCollection()`, `getOrganizationsCollection()`
- Index definitions for MongoDB

**Dependencies**: `mongodb`, `@action-atlas/types`

**Scripts**:
- `pnpm seed`: Seed database (TODO: implement)
- `pnpm create-indexes`: Create MongoDB indexes

### @action-atlas/ai

**Purpose**: AI services for embeddings and vector search

**Exports**:
- `generateEmbedding()`: Generate single embedding
- `generateEmbeddings()`: Batch embedding generation
- `prepareActivityForEmbedding()`: Prepare activity text
- `calculateCosineSimilarity()`: Cosine similarity calculation
- `InMemoryEmbeddingCache`: Simple embedding cache

**Dependencies**: `ai`, `@ai-sdk/openai`, `@action-atlas/types`

**Scripts**:
- `pnpm generate-embeddings`: Generate embeddings (TODO: implement)

### web (Next.js app)

**Purpose**: Frontend application

**Features**:
- Next.js 15 with App Router
- React 19
- Turbopack for fast development
- Typed routes enabled
- Server Components by default

**Dependencies**:
- `next`, `react`, `react-dom`
- `@action-atlas/types`, `@action-atlas/database`, `@action-atlas/ai`

## Environment Variables

Required environment variables:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/actionatlas

# OpenAI API
OPENAI_API_KEY=sk-proj-...

# Redis (optional for MVP)
REDIS_URL=redis://localhost:6379

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

## Troubleshooting

### pnpm version mismatch

If you see pnpm version warnings, update `packageManager` in root `package.json`:

```json
{
  "packageManager": "pnpm@9.0.5"
}
```

### TypeScript errors in IDE

Run `pnpm type-check` to build all packages first. IDEs may not recognize workspace packages until they're built.

### Build cache issues

Clear Turborepo cache:

```bash
rm -rf .turbo
pnpm build
```

Clear all caches:

```bash
pnpm clean
pnpm install
pnpm build
```

---

**Setup completed**: 2026-01-09
**TypeScript Pro Agent**: Phase 1 Complete ✓
