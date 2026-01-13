# Action Atlas API Documentation

Complete API reference for Action Atlas search and activity management endpoints.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication

Currently, all endpoints are public (MVP phase). Authentication will be added in a future phase.

---

## Endpoints

### Search API

#### POST /api/search

Performs semantic vector search on activities using natural language queries.

**Request Body:**

```json
{
  "query": "string",              // Required: Search query (1-500 chars)
  "category": ["education"],      // Optional: Filter by categories
  "location": {                   // Optional: Geospatial filtering
    "latitude": 37.7749,
    "longitude": -122.4194,
    "radius": 50000              // Optional: Max distance in meters
  },
  "limit": 20,                   // Optional: Results per page (default 20, max 100)
  "offset": 0                    // Optional: Skip results (default 0)
}
```

**Response:**

```json
{
  "results": [
    {
      "activityId": "string",
      "title": "string",
      "description": "string",
      "category": "education",
      "relevanceScore": 0.92,
      "distance": 1234,          // Only if location filter applied
      // ... other activity fields
    }
  ],
  "total": 42,
  "executionTimeMs": 187,
  "metadata": {
    "cached": false,
    "embeddingMs": 120,
    "vectorSearchMs": 45,
    "postProcessingMs": 22
  }
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "teach kids programming",
    "category": ["education"],
    "limit": 10
  }'
```

---

### Activities API

#### GET /api/activities

List activities with pagination and filters.

**Query Parameters:**

- `page` (number, default: 1): Page number
- `pageSize` (number, default: 20, max: 100): Results per page
- `category` (string): Filter by category
- `organizationId` (string): Filter by organization
- `isActive` (boolean, default: true): Filter active/inactive activities

**Response:**

```json
{
  "results": [
    {
      "activityId": "string",
      "title": "string",
      // ... other activity fields
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

**Example:**

```bash
curl "http://localhost:3000/api/activities?page=1&pageSize=20&category=education"
```

---

#### POST /api/activities

Create a new activity (generates embedding automatically).

**Request Body:**

```json
{
  "title": "string",                    // Required: 5-200 chars
  "description": "string",              // Required: 50-5000 chars
  "organizationId": "string",           // Required
  "category": "education",              // Required: one of the predefined categories
  "skills": [                           // Required: array of skills
    {
      "name": "JavaScript",
      "level": "beginner"              // Optional: beginner|intermediate|advanced|expert
    }
  ],
  "location": {                         // Required
    "address": {
      "street": "123 Main St",         // Optional
      "city": "San Francisco",         // Required
      "state": "CA",                   // Optional
      "postalCode": "94102",          // Optional
      "country": "USA"                 // Required
    },
    "coordinates": {
      "type": "Point",
      "coordinates": [-122.4194, 37.7749]  // [longitude, latitude]
    },
    "timezone": "America/Los_Angeles"  // Optional
  },
  "timeCommitment": {                   // Required
    "hoursPerWeek": 3,                 // Optional
    "isFlexible": false,               // Required
    "isOneTime": false,                // Required
    "isRecurring": true,               // Required
    "schedule": "Saturdays 2-5pm"      // Optional
  },
  "contact": {                          // Required
    "name": "Jane Smith",              // Required
    "role": "Program Coordinator",     // Required
    "email": "jane@example.com",       // Required
    "phone": "555-1234"                // Optional
  },
  "website": "https://example.com"     // Optional
}
```

**Response:**

```json
{
  "data": {
    "activityId": "string",
    "title": "string",
    "embedding": [0.123, -0.456, ...], // 1536-dimensional vector
    "embeddingModel": "text-embedding-3-small",
    "createdAt": "2024-01-09T12:00:00Z",
    // ... other fields
  }
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/activities \
  -H "Content-Type: application/json" \
  -d @activity.json
```

---

#### GET /api/activities/:id

Get a single activity by ID.

**Path Parameters:**

- `id` (string): Activity ID (MongoDB ObjectId or business activityId)

**Response:**

```json
{
  "data": {
    "activityId": "string",
    "title": "string",
    // ... all activity fields
  }
}
```

**Example:**

```bash
curl "http://localhost:3000/api/activities/abc123"
```

---

#### PATCH /api/activities/:id

Update an activity. If content fields change, automatically regenerates embedding.

**Path Parameters:**

- `id` (string): Activity ID

**Request Body:** (all fields optional)

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "isActive": false,
  // ... any other activity fields
}
```

**Response:**

```json
{
  "data": {
    "activityId": "string",
    "title": "Updated Title",
    "embeddingUpdatedAt": "2024-01-09T12:30:00Z",
    // ... all activity fields
  }
}
```

**Example:**

```bash
curl -X PATCH http://localhost:3000/api/activities/abc123 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

---

#### DELETE /api/activities/:id

Soft delete an activity (sets `isActive` to false).

**Path Parameters:**

- `id` (string): Activity ID

**Response:**

```json
{
  "message": "Activity deleted successfully",
  "id": "abc123"
}
```

**Example:**

```bash
curl -X DELETE "http://localhost:3000/api/activities/abc123"
```

---

### Organizations API

#### GET /api/organizations/:id

Get organization details with their activities.

**Path Parameters:**

- `id` (string): Organization ID

**Query Parameters:**

- `includeActivities` (boolean, default: true): Include organization's activities
- `page` (number, default: 1): Page for activities pagination
- `pageSize` (number, default: 20, max: 100): Activities per page

**Response:**

```json
{
  "data": {
    "organization": {
      "organizationId": "string",
      "name": "string",
      "description": "string",
      "email": "contact@example.com",
      "status": "verified",
      // ... other organization fields
    },
    "activities": [
      // Array of activities if includeActivities=true
    ]
  }
}
```

**Example:**

```bash
curl "http://localhost:3000/api/organizations/org-123?includeActivities=true&page=1"
```

---

#### PATCH /api/organizations/:id

Update organization details.

**Path Parameters:**

- `id` (string): Organization ID

**Request Body:** (all fields optional)

```json
{
  "name": "Updated Organization Name",
  "description": "Updated description",
  "email": "newemail@example.com",
  "phone": "555-5678",
  "website": "https://newwebsite.com",
  "address": {
    "street": "456 Oak Ave",
    "city": "Oakland",
    "state": "CA",
    "postalCode": "94612",
    "country": "USA"
  },
  "status": "verified"
}
```

**Response:**

```json
{
  "data": {
    "organizationId": "string",
    "name": "Updated Organization Name",
    "updatedAt": "2024-01-09T12:45:00Z",
    // ... all organization fields
  }
}
```

**Example:**

```bash
curl -X PATCH http://localhost:3000/api/organizations/org-123 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

---

## Error Responses

All endpoints return structured error responses:

```json
{
  "error": "Validation Error",
  "message": "query must be at least 1 characters",
  "statusCode": 400,
  "details": [
    // Zod validation errors (if applicable)
  ]
}
```

### Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation error or invalid input
- `404 Not Found`: Resource not found
- `405 Method Not Allowed`: HTTP method not supported
- `500 Internal Server Error`: Server error

---

## Performance Targets

- Search latency (p95): <200ms (cache miss), <50ms (cache hit)
- Embedding generation: <150ms (OpenAI API call)
- Vector search: <50ms (MongoDB Atlas)
- CRUD operations: <100ms

---

## Categories

Valid activity categories:

- `education`
- `environment`
- `health`
- `social-services`
- `arts-culture`
- `animal-welfare`
- `community-development`
- `youth`
- `seniors`
- `technology`
- `other`

---

## Testing

Use the provided test script:

```bash
cd apps/web
./test-api.sh
```

Or test manually:

```bash
# Test search
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "teach programming"}'

# Test list activities
curl "http://localhost:3000/api/activities?page=1&pageSize=5"
```

---

## Notes

1. **Embeddings**: Creating/updating activities automatically generates vector embeddings for semantic search
2. **Soft Deletes**: DELETE operations set `isActive: false` rather than removing data
3. **Pagination**: All list endpoints support pagination with `page` and `pageSize` parameters
4. **Geospatial**: Location-based search uses GeoJSON format `[longitude, latitude]`
5. **Rate Limiting**: Not yet implemented (planned for future phase)
6. **Authentication**: Not yet implemented (planned for future phase)

---

**Last Updated**: 2024-01-09
**Version**: 1.0
