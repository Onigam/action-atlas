# Multi-Agent Orchestration Prompts

This directory contains prompts designed for coordinating multi-agent AI systems to implement and maintain the Action Atlas project.

## Contents

### [`multi-agent-implementation.md`](./multi-agent-implementation.md)
**Purpose**: Master orchestration prompt for implementing the complete Action Atlas MVP

**What it does**:
- Coordinates 9 specialized AI agents to build the entire codebase from scratch
- Implements local development environment (cloud deployment deferred)
- Follows all documentation, milestones, and ADRs
- Delivers production-ready code via pull request

**Team Structure**:
1. **Multi-Agent Coordinator** - Overall orchestration
2. **Project Manager** - Task distribution & tracking
3. **Context Manager** - State management
4. **Technical Supervisor** - Quality control
5. **TypeScript Pro** - Monorepo & type system
6. **Backend Developer** - Database, AI, API
7. **Frontend Developer** - Next.js app & UI
8. **DevOps Engineer** - Docker, scripts, environment
9. **UI Designer** - Design system & components

**Scope**:
- ✅ **In Scope**: Complete local dev environment with semantic search
- ❌ **Out of Scope**: Cloud deployment, CI/CD (marked as TODO)

**Deliverable**: Feature branch `feat/mvp-local-development` with complete implementation

---

## How to Use These Prompts

### Prerequisites

Before using the multi-agent implementation prompt:

1. ✅ All documentation is complete (`/docs/`)
2. ✅ Docker environment is set up (`docker-compose.yml`)
3. ✅ Seed data is available (`/data/seed-dataset.agz`)
4. ✅ AI agent definitions exist (`/.claude/agents/`)

### Usage Instructions

1. **Copy the prompt**: Open `multi-agent-implementation.md` and copy the entire content

2. **Start a new conversation**: Launch a new Claude Code session or conversation

3. **Paste the prompt**: Paste the prompt as the first message

4. **Monitor progress**: The multi-agent coordinator will:
   - Launch specialized agents
   - Provide status updates
   - Report blockers
   - Coordinate handoffs between agents

5. **Review deliverables**: After completion:
   - Review the feature branch
   - Check the pull request
   - Verify updated milestones documentation
   - Test the implementation locally

### Execution Phases

Agents will execute in 8 sequential phases with parallel work where possible:

1. **Foundation** - Monorepo structure and TypeScript setup
2. **Shared Packages** - types, database, ai packages
3. **Next.js Foundation** - App Router and base structure (parallel with Phase 2)
4. **Search Functionality** - Semantic search implementation
5. **Detail Pages** - Activity and organization pages
6. **Development Scripts** - Seed, embeddings, indexes (parallel with Phase 4-5)
7. **Testing & Documentation** - Comprehensive testing
8. **Integration & PR** - Final review and pull request

**Execution Mode**: Multi-agent parallel implementation with automatic dependency management

---

## Quality Standards

All implementations must meet:

- ✅ TypeScript strict mode (no `any` types)
- ✅ >75% test coverage on critical paths
- ✅ <200ms search latency (local)
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Lighthouse score >90

---

## Deferred Work

The following items are intentionally excluded from the initial implementation and marked as TODO:

- Cloud deployment (Vercel, MongoDB Atlas production)
- CI/CD workflows (GitHub Actions)
- Monitoring and logging (Sentry, Vercel Analytics)
- Admin dashboard (complex UI, Phase 2)
- User authentication (not in MVP scope)

These will be implemented in future iterations after the local MVP is complete and tested.

---

## Support

For questions or issues:
- Review the full documentation in `/docs/`
- Check architecture decisions in `/docs/adr/`
- Consult the milestone plan in `/docs/milestones.md`
- Review design specifications in `/docs/design-*.md`

---

**Last Updated**: 2026-01-08
