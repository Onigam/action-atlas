# Database Package API Reference

## Installation

```typescript
import {
  connectToDatabase,
  activities,
  findActivities,
  createActivity
} from '@action-atlas/database';
```

## Connection Management

### connectToDatabase()

Connect to MongoDB. Call this once at application startup.

```typescript
import { connectToDatabase } from '@action-atlas/database';

const db = await connectToDatabase();
```

**Environment Variables Required:**
- `MONGODB_URI` - MongoDB connection string

**Returns:** `Promise<Db>` - MongoDB database instance

### disconnectFromDatabase()

Gracefully disconnect from MongoDB.

```typescript
import { disconnectFromDatabase } from '@action-atlas/database';

await disconnectFromDatabase();
```

### getDatabase()

Get the current database instance (must call `connectToDatabase()` first).

```typescript
import { getDatabase } from '@action-atlas/database';

const db = getDatabase(); // throws if not connected
```

### healthCheck()

Check database connection status.

```typescript
import { healthCheck } from '@action-atlas/database';

const health = await healthCheck();
// { connected: true } or { connected: false, error: "..." }
```

## Collections

### activities()

Get typed activities collection.

```typescript
import { activities } from '@action-atlas/database';

const collection = activities();
const allActivities = await collection.find({}).toArray();
```

### organizations()

Get typed organizations collection.

```typescript
import { organizations } from '@action-atlas/database';

const collection = organizations();
const allOrgs = await collection.find({}).toArray();
```

## Activity Operations

### findActivities()

Find activities with filtering, pagination, and sorting.

```typescript
import { findActivities } from '@action-atlas/database';

// Find all active activities
const activities = await findActivities({
  filter: { isActive: true },
  limit: 20,
  skip: 0,
  sort: { createdAt: -1 }
});

// Find by category
const eduActivities = await findActivities({
  filter: { category: 'education', isActive: true },
  limit: 10
});
```

**Options:**
- `filter?: Filter<ActivityDocument>` - MongoDB filter
- `limit?: number` - Max results (default: 20)
- `skip?: number` - Skip N results (default: 0)
- `sort?: Record<string, 1 | -1>` - Sort order (default: `{ createdAt: -1 }`)

### findActivityById()

Find a single activity by ID (supports both ObjectId and activityId).

```typescript
import { findActivityById } from '@action-atlas/database';

const activity = await findActivityById('507f1f77bcf86cd799439011');
// or
const activity = await findActivityById('clxyz123...');
```

### findActivitiesByOrganization()

Find all activities for an organization.

```typescript
import { findActivitiesByOrganization } from '@action-atlas/database';

const orgActivities = await findActivitiesByOrganization('org_123', {
  limit: 20,
  skip: 0
});
```

### findActivitiesByCategory()

Find activities by category (single or array).

```typescript
import { findActivitiesByCategory } from '@action-atlas/database';

// Single category
const activities = await findActivitiesByCategory('education');

// Multiple categories
const activities = await findActivitiesByCategory(['education', 'technology']);
```

### countActivities()

Count activities matching a filter.

```typescript
import { countActivities } from '@action-atlas/database';

const total = await countActivities({ isActive: true });
const byCategory = await countActivities({ category: 'health', isActive: true });
```

### createActivity()

Create a new activity.

```typescript
import { createActivity } from '@action-atlas/database';

const activity = await createActivity({
  title: 'Teach Kids Coding',
  description: 'Help children learn programming...',
  organizationId: 'org_123',
  category: 'education',
  skills: [{ name: 'Programming', level: 'beginner' }],
  location: {
    address: { city: 'San Francisco', country: 'USA' },
    coordinates: { type: 'Point', coordinates: [-122.4194, 37.7749] }
  },
  timeCommitment: {
    hoursPerWeek: 5,
    isFlexible: true,
    isOneTime: false,
    isRecurring: true
  },
  contact: {
    name: 'Jane Doe',
    role: 'Volunteer Coordinator',
    email: 'jane@example.org'
  },
  isActive: true,
  searchableText: 'Teach kids coding programming education...'
});
```

**Returns:** `Promise<ActivityDocument>` with `_id` and generated `activityId`

### updateActivity()

Update an activity by ID.

```typescript
import { updateActivity } from '@action-atlas/database';

const updated = await updateActivity('activity_123', {
  title: 'Updated Title',
  isActive: false
});
```

**Returns:** `Promise<ActivityDocument | null>` - Updated document or null if not found

### updateActivityEmbedding()

Update activity's vector embedding.

```typescript
import { updateActivityEmbedding } from '@action-atlas/database';

const embedding = [0.123, -0.456, ...]; // 1536 dimensions
const updated = await updateActivityEmbedding('activity_123', embedding);
```

**Note:** Automatically sets `embeddingModel` to 'text-embedding-3-small' and updates `embeddingUpdatedAt`

### deleteActivity()

Delete an activity (soft or hard delete).

```typescript
import { deleteActivity } from '@action-atlas/database';

// Soft delete (sets isActive = false)
await deleteActivity('activity_123');

// Hard delete (removes from database)
await deleteActivity('activity_123', true);
```

### findActivitiesWithoutEmbeddings()

Find activities that need embeddings generated.

```typescript
import { findActivitiesWithoutEmbeddings } from '@action-atlas/database';

const activities = await findActivitiesWithoutEmbeddings(100);
// Returns up to 100 activities without embeddings
```

### findActivitiesWithOutdatedEmbeddings()

Find activities with outdated embeddings (updated after embedding).

```typescript
import { findActivitiesWithOutdatedEmbeddings } from '@action-atlas/database';

const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const activities = await findActivitiesWithOutdatedEmbeddings(thirtyDaysAgo, 100);
```

### bulkUpdateActivities()

Update multiple activities in a single operation.

```typescript
import { bulkUpdateActivities } from '@action-atlas/database';

const updates = [
  { id: 'activity_1', data: { isActive: true } },
  { id: 'activity_2', data: { title: 'Updated Title' } }
];

const modifiedCount = await bulkUpdateActivities(updates);
```

## Organization Operations

### findOrganizations()

Find organizations with filtering and pagination.

```typescript
import { findOrganizations } from '@action-atlas/database';

const orgs = await findOrganizations({
  filter: { status: 'verified' },
  limit: 20,
  sort: { name: 1 }
});
```

### findOrganizationById()

Find a single organization by ID.

```typescript
import { findOrganizationById } from '@action-atlas/database';

const org = await findOrganizationById('org_123');
```

### findOrganizationsByStatus()

Find organizations by verification status.

```typescript
import { findOrganizationsByStatus } from '@action-atlas/database';

// Single status
const verified = await findOrganizationsByStatus('verified');

// Multiple statuses
const active = await findOrganizationsByStatus(['verified', 'pending']);
```

### createOrganization()

Create a new organization.

```typescript
import { createOrganization } from '@action-atlas/database';

const org = await createOrganization({
  name: 'Tech for Good',
  description: 'Teaching technology skills...',
  location: {
    address: { city: 'San Francisco', country: 'USA' },
    coordinates: { type: 'Point', coordinates: [-122.4194, 37.7749] }
  },
  email: 'contact@techforgood.org',
  status: 'pending'
});
```

### updateOrganization()

Update an organization.

```typescript
import { updateOrganization } from '@action-atlas/database';

const updated = await updateOrganization('org_123', {
  description: 'Updated mission...',
  website: 'https://example.org'
});
```

### updateOrganizationStatus()

Update organization verification status.

```typescript
import { updateOrganizationStatus } from '@action-atlas/database';

await updateOrganizationStatus('org_123', 'verified');
// Status: 'pending' | 'verified' | 'rejected' | 'suspended'
```

### deleteOrganization()

Delete an organization (hard delete).

```typescript
import { deleteOrganization } from '@action-atlas/database';

const deleted = await deleteOrganization('org_123');
// Returns: boolean
```

### searchOrganizations()

Search organizations by name or description.

```typescript
import { searchOrganizations } from '@action-atlas/database';

const results = await searchOrganizations('education', { limit: 10 });
```

## Indexes

### createIndexes()

Create all MongoDB indexes.

```typescript
import { createIndexes, getDatabase } from '@action-atlas/database';

const db = await connectToDatabase();
await createIndexes(db);
```

**Note:** Vector search index must be created manually in MongoDB Atlas UI.

### Index Definitions

The following indexes are created:

**Activities:**
- Compound: `{ category: 1, isActive: 1, 'location.coordinates': '2dsphere' }`
- Text: `{ title: 'text', description: 'text', searchableText: 'text' }`
- Organization: `{ organizationId: 1, isActive: 1 }`
- Date: `{ createdAt: -1 }`

**Organizations:**
- Status: `{ status: 1 }`
- Text: `{ name: 'text', description: 'text' }`

**Vector Search (Atlas only):**
```json
{
  "name": "activity_vector_search",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      { "type": "vector", "path": "embedding", "numDimensions": 1536, "similarity": "cosine" },
      { "type": "filter", "path": "category" },
      { "type": "filter", "path": "isActive" }
    ]
  }
}
```

## Error Handling

All operations throw errors that should be caught:

```typescript
import { findActivityById } from '@action-atlas/database';

try {
  const activity = await findActivityById('invalid_id');
  if (!activity) {
    console.log('Activity not found');
  }
} catch (error) {
  console.error('Database error:', error);
}
```

## TypeScript Types

All operations use strict TypeScript types from `@action-atlas/types`:

```typescript
import type {
  Activity,
  ActivityDocument,
  Organization,
  OrganizationDocument
} from '@action-atlas/types';
```

**Key Differences:**
- `Activity` - Domain type (without `_id`)
- `ActivityDocument` - MongoDB document (with `_id: ObjectId`)

## Performance Tips

1. **Use bulk operations** for multiple updates
2. **Leverage indexes** by filtering on indexed fields
3. **Use projection** to select only needed fields
4. **Implement pagination** with limit/skip
5. **Monitor connection pool** usage
6. **Cache frequently accessed data** at application level

## Example: Complete CRUD Flow

```typescript
import {
  connectToDatabase,
  createActivity,
  findActivities,
  updateActivity,
  deleteActivity
} from '@action-atlas/database';

// 1. Connect
await connectToDatabase();

// 2. Create
const activity = await createActivity({
  title: 'Beach Cleanup',
  // ... other fields
});

// 3. Read
const activities = await findActivities({
  filter: { category: 'environment' },
  limit: 10
});

// 4. Update
await updateActivity(activity.activityId, {
  title: 'Updated: Beach Cleanup Event'
});

// 5. Delete (soft)
await deleteActivity(activity.activityId);
```

## Related Documentation

- [AI Package API](./ai-package.md) - Vector search and embeddings
- [Type Definitions](../packages/types/README.md) - Shared types
- [Architecture](../architecture.md) - System design
