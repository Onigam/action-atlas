# Contributing to Action Atlas

Thank you for your interest in contributing to Action Atlas! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## Code of Conduct

This project is designed to be collaborative and welcoming. We expect all contributors to:
- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## Getting Started

### Prerequisites

- **Node.js 20+** (LTS recommended)
- **pnpm 8+** (required, not npm or yarn)
- **MongoDB** (local or MongoDB Atlas account)
- **OpenAI API key** (for embedding generation)
- **Git** (with SSH keys configured)

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone git@github.com:YOUR_USERNAME/action-atlas.git
   cd action-atlas
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream git@github.com:ORIGINAL_OWNER/action-atlas.git
   ```

4. **Install dependencies**
   ```bash
   pnpm install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

6. **Verify setup**
   ```bash
   pnpm build        # Should complete without errors
   pnpm type-check   # Should pass with 0 errors
   pnpm lint         # Should pass or have only minor warnings
   ```

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

**Branch Naming Conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

**Development Commands:**
```bash
# Start development server
pnpm dev

# Run type checking
pnpm type-check

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Build for production
pnpm build
```

### 3. Test Your Changes

**Manual Testing:**
1. Start the development server: `pnpm dev`
2. Test your changes in the browser at http://localhost:3000
3. Verify responsive design (mobile, tablet, desktop)
4. Test error states and edge cases

**Automated Testing (when implemented):**
```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# Watch mode
pnpm test:watch
```

### 4. Commit Your Changes

See [Commit Message Conventions](#commit-message-conventions) below.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Open a Pull Request

See [Pull Request Process](#pull-request-process) below.

## Code Style Guidelines

### TypeScript

- **Use strict TypeScript** - All strict flags are enabled
- **No `any` types** - Use proper types or `unknown` with type guards
- **Branded types** - Use for IDs and domain-specific types
- **Prefer interfaces** over types for object shapes
- **Use type inference** where obvious
- **Document public APIs** with JSDoc comments

**Example:**
```typescript
// Good
interface Activity {
  activityId: ActivityId;
  title: string;
  description: string;
}

// Avoid
type Activity = {
  activityId: any; // ❌ NO!
  title: string;
  description: string;
};
```

### React Components

- **Use functional components** with hooks
- **Prefer Server Components** (Next.js App Router)
- **Mark Client Components** explicitly with `'use client'`
- **Keep components small** (<200 lines)
- **Extract logic** into custom hooks
- **Use semantic HTML** for accessibility

**Example:**
```typescript
// Server Component (default)
export default async function ActivityPage({ params }: Props) {
  const activity = await getActivity(params.id);
  return <ActivityDetail activity={activity} />;
}

// Client Component (interactive)
'use client';

export function SearchBar() {
  const [query, setQuery] = useState('');
  // ...
}
```

### Import Organization

**Order:**
1. React imports
2. Next.js imports
3. Third-party libraries
4. Workspace packages (`@action-atlas/*`)
5. Local imports (relative paths)
6. Type imports (last)

**Example:**
```typescript
import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { SearchQuery } from '@action-atlas/types';
import { SearchBar } from '@/components/search/SearchBar';
import type { Activity } from '@action-atlas/types';
```

### File Naming

- **Components:** PascalCase (`ActivityCard.tsx`)
- **Utilities:** camelCase (`api-client.ts`)
- **Constants:** UPPER_SNAKE_CASE file, named export
- **Types:** PascalCase files, PascalCase exports

## Commit Message Conventions

We follow the Conventional Commits specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system changes
- `ci` - CI/CD changes
- `chore` - Maintenance tasks

### Examples

```bash
# Feature
feat(search): add category filtering to semantic search

# Bug fix
fix(api): handle null embedding values in vector search

# Documentation
docs(readme): update setup instructions for MongoDB Atlas

# Refactoring
refactor(database): simplify connection pooling logic
```

## Pull Request Process

### Before Opening a PR

1. **Ensure code quality passes:**
   ```bash
   pnpm type-check  # Must pass
   pnpm lint        # Must pass or auto-fix
   pnpm build       # Must succeed
   ```

2. **Update documentation:**
   - Update README if adding features
   - Add/update JSDoc comments
   - Update API documentation if changing APIs

3. **Test your changes:**
   - Manual testing completed
   - All automated tests passing (when implemented)

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Bullet point list of changes

## Testing
- [ ] Tested locally
- [ ] Manual testing completed
- [ ] Automated tests added/updated (when applicable)

## Screenshots
[If applicable, add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] TypeScript compiles without errors
- [ ] Linting passes
- [ ] Documentation updated
- [ ] No console.logs or debug code
```

### PR Review Process

1. **Automated checks** must pass:
   - Type checking
   - Linting
   - Build
   - Tests (when implemented)

2. **Code review** by maintainer(s)

3. **Requested changes** must be addressed

4. **Approval** required before merge

5. **Merge** by maintainer (squash and merge preferred)

## Testing Requirements

### Current State (MVP)
Testing is deferred to post-MVP phase. Focus on:
- Manual testing
- Type safety
- Lint compliance
- Build success

### Future Requirements
Once testing is implemented:
- **Unit tests** for utilities and pure functions
- **Integration tests** for API routes and database operations
- **E2E tests** for critical user flows
- **Minimum 75% coverage** for new code

## Documentation

### When to Update Documentation

- **README.md** - Adding features, changing setup
- **API_DOCUMENTATION.md** - API endpoint changes
- **CLAUDE.md** - Development patterns, AI guidance
- **Architecture docs** - System design changes
- **ADRs** - Major technical decisions

### Documentation Standards

- **Clear and concise** writing
- **Code examples** for complex topics
- **Keep it current** - update with code changes
- **Link related docs** for context

## Questions?

- **GitHub Issues** - For bug reports and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Documentation** - Check [docs/](./docs) directory

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

**Thank you for contributing to Action Atlas!**
