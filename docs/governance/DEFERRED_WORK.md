# Deferred Work for Post-MVP

This document tracks features, improvements, and tasks that were intentionally deferred during MVP development. Items are prioritized and categorized for post-MVP implementation.

## Status Legend
- ❌ NOT IMPLEMENTED
- ⏸️ PARTIALLY IMPLEMENTED
- ⏳ IN PROGRESS
- ✅ COMPLETED

---

## High Priority (Next Sprint)

### 1. Embedding Generation ❌
**Status:** NOT IMPLEMENTED (by design)
**Reason:** Requires OpenAI credits ($2-5 for 11,938 activities)
**Estimated Effort:** 30 minutes

**Tasks:**
- [ ] Acquire OpenAI credits
- [ ] Run `pnpm generate-embeddings` script
- [ ] Verify embedding coverage reaches 100%
- [ ] Test semantic search functionality end-to-end

### 2. Vercel Deployment ❌
**Status:** NOT IMPLEMENTED
**Reason:** MVP focused on local development first
**Estimated Effort:** 2-4 hours

**Tasks:**
- [ ] Create Vercel project
- [ ] Link GitHub repository
- [ ] Configure build settings
  - Root directory: `apps/web`
  - Build command: `cd ../.. && pnpm turbo run build --filter=web`
  - Install command: `cd ../.. && pnpm install`
- [ ] Set environment variables:
  - `MONGODB_URI` (production Atlas connection)
  - `OPENAI_API_KEY`
  - `NEXT_PUBLIC_API_URL`
- [ ] Test preview deployment
- [ ] Configure custom domain
- [ ] Enable production deployment

### 3. CI/CD Pipeline ❌
**Status:** NOT IMPLEMENTED
**Reason:** Deferred to post-MVP
**Estimated Effort:** 1 day

**Tasks:**
- [ ] Create `.github/workflows/ci.yml`
- [ ] Implement CI steps:
  - Install dependencies with pnpm
  - Run `pnpm type-check`
  - Run `pnpm lint`
  - Run `pnpm build`
- [ ] Add test steps (once tests implemented):
  - Run `pnpm test:unit`
  - Run `pnpm test:integration`
  - Upload coverage reports
- [ ] Configure preview deployments for PRs
- [ ] Add status badges to README

### 4. MongoDB Atlas Production Setup ❌
**Status:** Development M0 cluster only
**Reason:** M0 sufficient for MVP testing
**Estimated Effort:** 1 hour

**Tasks:**
- [ ] Upgrade to M10 cluster ($57/month)
- [ ] Enable continuous backups
- [ ] Configure network access (restrict IPs)
- [ ] Set up database user roles
- [ ] Create read-only user for analytics
- [ ] Configure monitoring alerts
- [ ] Set up point-in-time recovery

---

## Medium Priority (Sprint 2-3)

### 5. Caching Layer ⏸️
**Status:** PARTIALLY IMPLEMENTED
**Reason:** In-memory cache only, Redis not integrated
**Estimated Effort:** 1 day

**Completed:**
- ✅ In-memory embedding cache (30-day TTL)
- ✅ Cache abstraction layer

**Remaining:**
- [ ] Set up Upstash Redis account
- [ ] Add Redis client to `packages/ai/src/cache.ts`
- [ ] Implement search result caching (5-min TTL)
- [ ] Add cache invalidation on activity updates
- [ ] Implement rate limiting with Upstash Rate Limit
- [ ] Add cache metrics to API responses

**Code Location:**
- `packages/ai/src/cache.ts` - Cache implementation
- `apps/web/app/api/search/route.ts:76` - TODO comment for Redis

### 6. Testing Suite ❌
**Status:** NOT IMPLEMENTED
**Reason:** Deferred to ensure faster MVP delivery
**Estimated Effort:** 1-2 weeks

**Unit Tests:**
- [ ] Vitest configuration
- [ ] Test utilities and helpers
- [ ] Test type guards and validators
- [ ] Test embedding utilities
- [ ] Test vector search pipeline builders
- [ ] Target: >75% coverage

**Integration Tests:**
- [ ] MongoDB Memory Server setup
- [ ] Test database operations
- [ ] Test API routes end-to-end
- [ ] Test embedding generation
- [ ] Test vector search queries

**E2E Tests:**
- [ ] Playwright configuration
- [ ] Test search flow
- [ ] Test activity detail pages
- [ ] Test organization pages
- [ ] Test responsive design
- [ ] Test error states

**Files to Create:**
- `vitest.config.ts`
- `vitest.config.unit.ts`
- `vitest.config.integration.ts`
- `playwright.config.ts`
- Test files: `*.test.ts`, `*.spec.ts`

### 7. Monitoring & Error Tracking ❌
**Status:** NOT IMPLEMENTED
**Reason:** Not critical for initial development
**Estimated Effort:** 1 day

**Tasks:**
- [ ] Set up Sentry account
- [ ] Install `@sentry/nextjs`
- [ ] Configure Sentry in `apps/web/`
  - `sentry.client.config.ts`
  - `sentry.server.config.ts`
  - `sentry.edge.config.ts`
- [ ] Add error boundaries
- [ ] Configure source maps upload
- [ ] Set up Vercel Analytics
- [ ] Create custom metrics collection
- [ ] Set up Better Stack for logs and uptime

### 8. Organization Management ⏸️
**Status:** PARTIALLY IMPLEMENTED
**Reason:** Schema exists, no seed data or admin UI
**Estimated Effort:** 3 days

**Completed:**
- ✅ Organization schema defined
- ✅ Organization page implemented
- ✅ API endpoint: GET /api/organizations/[id]

**Remaining:**
- [ ] Seed organization data
- [ ] Implement organization CRUD operations
- [ ] Add organization verification workflow
- [ ] Create organization admin dashboard
- [ ] Add organization activity management
- [ ] Implement organization search

---

## Low Priority (Backlog)

### 9. Admin Dashboard ❌
**Status:** NOT IMPLEMENTED
**Reason:** Manual moderation acceptable for MVP
**Estimated Effort:** 2 weeks

**Features:**
- [ ] Admin authentication
- [ ] Activity approval queue
- [ ] Activity moderation tools
- [ ] Organization verification
- [ ] User management (when auth added)
- [ ] Analytics dashboard
- [ ] Content moderation reports

**Route:** `/app/(admin)/dashboard/`

### 10. User Authentication ❌
**Status:** NOT IMPLEMENTED (MVP is public only)
**Reason:** Not required for public search MVP
**Estimated Effort:** 1 week

**Tasks:**
- [ ] Choose provider (Clerk recommended)
- [ ] Install authentication SDK
- [ ] Implement sign up/sign in flows
- [ ] Add protected routes
- [ ] Implement saved searches
- [ ] Add user preferences
- [ ] Add activity bookmarks

### 11. Advanced Filtering ⏸️
**Status:** PARTIALLY IMPLEMENTED
**Reason:** Basic category filter only
**Estimated Effort:** 1 week

**Completed:**
- ✅ Category filtering

**Remaining:**
- [ ] Skills filtering (multi-select)
- [ ] Time commitment filtering
- [ ] Flexible schedule toggle
- [ ] One-time vs recurring toggle
- [ ] Date range filtering
- [ ] Organization type filtering
- [ ] Save filter presets

### 12. Activity Recommendations ❌
**Status:** NOT IMPLEMENTED
**Reason:** Requires user data and ML pipeline
**Estimated Effort:** 2-3 weeks

**Features:**
- [ ] User preference learning
- [ ] Collaborative filtering
- [ ] Content-based recommendations
- [ ] "More like this" on activity pages
- [ ] Email digest of recommended activities

### 13. Email Notifications ❌
**Status:** NOT IMPLEMENTED
**Reason:** No user accounts yet
**Estimated Effort:** 1 week

**Features:**
- [ ] Email service integration (SendGrid/Resend)
- [ ] Welcome emails
- [ ] Activity recommendation digest
- [ ] New activities in saved searches
- [ ] Organization updates
- [ ] Email template system

### 14. Mobile Applications ❌
**Status:** NOT IMPLEMENTED
**Reason:** Post-launch feature
**Estimated Effort:** 8-12 weeks

**Platforms:**
- [ ] iOS (React Native or Swift)
- [ ] Android (React Native or Kotlin)
- [ ] Cross-platform considerations
- [ ] Push notifications
- [ ] Offline mode

### 15. Analytics Dashboard ❌
**Status:** NOT IMPLEMENTED
**Reason:** Not required for MVP
**Estimated Effort:** 2 weeks

**Metrics:**
- [ ] Search query analytics
- [ ] Activity view counts
- [ ] User behavior tracking
- [ ] Conversion funnel
- [ ] Geographic heatmap
- [ ] Popular categories
- [ ] API usage metrics

### 16. API for Third-Party Integrations ❌
**Status:** NOT IMPLEMENTED
**Reason:** No partners yet
**Estimated Effort:** 2-3 weeks

**Features:**
- [ ] Public API documentation
- [ ] API key management
- [ ] Rate limiting per API key
- [ ] Webhook support
- [ ] GraphQL endpoint (optional)
- [ ] SDK libraries (TypeScript, Python)

---

## Known Limitations

### Technical Debt

1. **ESLint Issues (59 errors)**
   - **Type:** Import ordering violations
   - **Impact:** Code style consistency
   - **Fix:** Run `pnpm lint:fix`
   - **Estimated Time:** 5 minutes

2. **Unsafe Type Usage (1 instance)**
   - **Location:** `apps/web/lib/api-client.ts:76`
   - **Type:** `@typescript-eslint/no-unsafe-assignment`
   - **Impact:** Minor type safety gap
   - **Fix:** Add proper type assertions
   - **Estimated Time:** 15 minutes

3. **Floating Promises (3 instances)**
   - **Location:** `apps/web/lib/hooks/useFilters.ts:22-24`
   - **Type:** `@typescript-eslint/no-floating-promises`
   - **Impact:** Potential unhandled promise rejections
   - **Fix:** Add `void` operator or `.catch()`
   - **Estimated Time:** 10 minutes

4. **Missing Alt Text (1 instance)**
   - **Location:** Organization page image
   - **Type:** `@next/next/no-img-element`
   - **Impact:** Accessibility and SEO
   - **Fix:** Replace with Next.js Image component
   - **Estimated Time:** 10 minutes

### Architecture Limitations

1. **No Embeddings Generated**
   - **Reason:** Costs $2-5 for 11,938 activities
   - **Impact:** Semantic search returns empty results
   - **Resolution:** Generate embeddings when ready to spend

2. **No Organizations Seeded**
   - **Reason:** Focus on activity search first
   - **Impact:** Organization pages return 404
   - **Resolution:** Add organization seed data

3. **MapView Component Placeholder**
   - **Location:** `apps/web/components/activities/MapView.tsx`
   - **Impact:** No visual map on activity pages
   - **Resolution:** Integrate Mapbox or Leaflet
   - **Estimated Time:** 1 day

4. **No Search Result Caching**
   - **Reason:** Redis integration deferred
   - **Impact:** Higher API latency on repeated searches
   - **Resolution:** Implement Redis caching
   - **Estimated Time:** 1 day

5. **Console.log Statements (238 instances)**
   - **Location:** Mostly in scripts and development tools
   - **Impact:** Minor noise in production logs
   - **Resolution:** Replace with proper logging library
   - **Estimated Time:** 2-3 hours

### Performance Limitations

1. **No Image Optimization**
   - Organization logos use `<img>` instead of `<Image>`
   - Impact: Slower LCP, higher bandwidth
   - Resolution: Migrate to Next.js Image component

2. **No CDN for Static Assets**
   - Not critical until deployment
   - Impact: Slower asset loading
   - Resolution: Vercel provides CDN automatically

3. **No Database Query Optimization**
   - Basic indexes only
   - Impact: May be slow at scale (>100K activities)
   - Resolution: Add compound indexes, analyze slow queries

### Security Limitations

1. **No Rate Limiting**
   - API endpoints unprotected
   - Impact: Potential abuse
   - Resolution: Implement Upstash Rate Limit

2. **No Input Sanitization**
   - Basic Zod validation only
   - Impact: Potential injection attacks
   - Resolution: Add comprehensive sanitization

3. **No CORS Configuration**
   - Default Next.js CORS
   - Impact: Open to all origins
   - Resolution: Configure allowed origins

4. **No API Authentication**
   - All endpoints public
   - Impact: Cannot track usage per user
   - Resolution: Implement API keys or OAuth

---

## Cost Implications

### Current MVP Costs
- **Vercel:** $0 (free tier)
- **MongoDB Atlas:** $0 (M0 sandbox)
- **OpenAI API:** $0 (no embeddings generated yet)
- **Total:** **$0/month**

### Post-MVP Costs (Estimated)
- **Vercel Pro:** $20/month
- **MongoDB Atlas M10:** $57/month
- **OpenAI API:** $5-10/month (with caching)
- **Sentry:** $0 (free tier, 5K errors/month)
- **Upstash Redis:** $0 (free tier, 10K commands/day)
- **Domain:** ~$1/month (annual)
- **Total:** **$83-88/month**

### Scale Costs (10K searches/day)
- **Vercel Pro:** $20/month
- **MongoDB Atlas M10:** $57/month
- **OpenAI API:** $30-50/month
- **Sentry Team:** $26/month
- **Upstash Redis:** $10/month (upgrade needed)
- **Total:** **$143-163/month**

---

## Migration & Upgrade Paths

### If MongoDB Atlas Vector Search is Insufficient
**Scenario:** >100K activities, search latency >500ms

**Migration to Qdrant:**
1. Set up Qdrant Cloud or self-hosted instance
2. Export embeddings from MongoDB
3. Import to Qdrant with metadata
4. Update `packages/ai/src/vector-search-service.ts`
5. Implement sync mechanism (on-write or batch)
6. Test performance improvements
7. Estimated downtime: 2-4 hours

### If Vercel Becomes Too Expensive
**Scenario:** >1M page views/month, Vercel bill >$200/month

**Migration to Railway/AWS:**
1. Containerize Next.js application
2. Set up PostgreSQL (if migrating from MongoDB)
3. Deploy containers to Railway/AWS/GCP
4. Configure load balancer and CDN
5. Update DNS records
6. Estimated effort: 2-3 weeks

---

## Tracking & Updates

**Last Updated:** 2026-01-09
**Next Review:** After MVP deployment to production
**Owner:** Development Team

**How to Update This Document:**
1. Mark items as completed (✅) when finished
2. Update effort estimates based on actual time
3. Add new deferred work items as discovered
4. Reprioritize based on user feedback and metrics
5. Link to GitHub issues for detailed tracking

---

**Note:** This document should be reviewed and updated after each sprint or major release.
