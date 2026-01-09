# Quick Start Guide - Action Atlas API

Get started with the Action Atlas API in 5 minutes.

## Prerequisites

- Node.js 20+
- pnpm 8+
- MongoDB running (via Docker Compose or Atlas)
- OpenAI API key

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/actionatlas
OPENAI_API_KEY=sk-proj-your-key-here
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start MongoDB (if using Docker)

```bash
docker-compose up -d
```

Wait ~30 seconds for initialization.

### 4. Seed Database (Optional)

```bash
pnpm seed
pnpm generate-embeddings
pnpm create-indexes
```

### 5. Start Development Server

```bash
pnpm dev --filter=web
```

API available at: `http://localhost:3000`

## Test the API

### Using the Test Script

```bash
cd apps/web
./test-api.sh
```

### Manual Testing

**Search for activities:**

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "teach programming", "limit": 10}'
```

**List activities:**

```bash
curl "http://localhost:3000/api/activities?page=1&pageSize=5"
```

**Create activity:**

```bash
curl -X POST http://localhost:3000/api/activities \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Teach Programming to Kids",
    "description": "Help children learn coding through fun projects and games. Perfect for beginners!",
    "organizationId": "test-org-123",
    "category": "education",
    "skills": [{"name": "JavaScript", "level": "beginner"}],
    "location": {
      "address": {"city": "San Francisco", "country": "USA"},
      "coordinates": {"type": "Point", "coordinates": [-122.4194, 37.7749]}
    },
    "timeCommitment": {
      "hoursPerWeek": 3,
      "isFlexible": false,
      "isOneTime": false,
      "isRecurring": true
    },
    "contact": {
      "name": "Jane Smith",
      "role": "Coordinator",
      "email": "jane@example.com"
    }
  }'
```

## API Endpoints

### Search

- `POST /api/search` - Semantic search for activities

### Activities

- `GET /api/activities` - List activities
- `POST /api/activities` - Create activity
- `GET /api/activities/:id` - Get single activity
- `PATCH /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity (soft)

### Organizations

- `GET /api/organizations/:id` - Get organization
- `PATCH /api/organizations/:id` - Update organization

## Documentation

Full API documentation: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Start MongoDB:

```bash
docker-compose up -d
```

### OpenAI API Error

```
Error: Invalid API key
```

**Solution**: Check your `OPENAI_API_KEY` in `.env.local`

### Type Check Errors

```bash
pnpm type-check --filter=web
```

### Build Errors

```bash
pnpm build --filter=web
```

## Next Steps

1. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint reference
2. Review [PHASE_4_API_IMPLEMENTATION_SUMMARY.md](../../PHASE_4_API_IMPLEMENTATION_SUMMARY.md) for implementation details
3. Start frontend development (Phase 5)

## Support

- Check logs: `docker-compose logs mongodb`
- Check database: `pnpm run check-db`
- Reset database: `pnpm run reset-db` (⚠️ destroys all data)

## Tips

1. Use `jq` for pretty JSON output: `curl ... | jq '.'`
2. Check execution time in response metadata
3. Monitor MongoDB slow queries
4. Watch OpenAI API usage to avoid rate limits
5. Use semantic search for better results than keyword matching

Happy coding! 🚀
