# Database vs Schema Analysis Report

**Date:** January 2026
**Sample Size:** 10,386 documents from `activities` collection
**Database:** MongoDB Atlas (`actionatlas`)

---

## Executive Summary

This analysis documents the alignment between the MongoDB data structure and the domain schemas defined in `packages/types/src/domain/`. The schema has been updated to match the actual database structure.

**Current State:**
- Schema is now aligned with database structure
- 4 embeddable fields for vector search (title, description, category, skills)
- Geolocations are processed for embedding with formatted addresses
- 3,208 activities have non-empty skills arrays

---

## 1. Activity Schema - Current Structure

The Activity schema (`packages/types/src/domain/activity.ts`) is now aligned with the database.

### Embeddable Fields (for Vector Search)

| Field | Type | Count in DB | Used in Embeddings |
|-------|------|-------------|-------------------|
| `title` | `string` | 10,386 | Yes |
| `description` | `string` | 10,386 | Yes (may contain Draft.js JSON) |
| `category` | `string[]` | 10,386 | Yes (joined with comma) |
| `skills` | `string[]` | 3,208 non-empty | Yes (joined with comma) |
| `geolocations[].formattedAddress` | nested | 10,386 | Yes (extracted via `extractGeolocationsEmbeddableValues`) |

### All Schema Fields

| Field | Type | Required | Count in DB | Notes |
|-------|------|:--------:|-------------|-------|
| `_id` | ObjectId | Yes | 10,386 | MongoDB document ID |
| `activityId` | `string` | Yes | 10,386 | Business ID |
| `organizationId` | `string` | Yes | 10,386 | Reference to organization |
| `title` | `string` | Yes | 10,386 | **Embeddable** |
| `description` | `string` | Yes | 10,386 | **Embeddable** |
| `category` | `string[]` | Yes | 10,386 | **Embeddable** |
| `skills` | `string[]` | Yes | 3,208 non-empty | **Embeddable** - simple string array |
| `geolocations` | `Geolocation[]` | Yes | 10,386 | Array of locations with coordinates and formatted addresses |
| `status` | enum | Yes | 10,386 | `PUBLISHED`, `DRAFT`, `ARCHIVED` |
| `type` | enum | Yes | 10,386 | `SKILLBASED`, `VOLUNTEERING`, `COLLECTION` |
| `language` | `string` | Yes | 10,386 | Content language (e.g., "en") |
| `remote` | `boolean` | Yes | 10,386 | Remote/on-site flag |
| `charged` | `boolean` | Yes | 10,386 | Whether activity is charged |
| `timeCommitment` | object | Yes | 10,386 | `{isFlexible, isOneTime, isRecurring}` |
| `contact` | object | Yes | 10,386 | `{name, role, email, phone?}` |
| `isActive` | `boolean` | Yes | 10,386 | Activity state |
| `coverImageUrl` | `string` | No | 10,386 | Cloudinary image URL |
| `workLanguages` | `string` | No | 3,327 | Work languages |
| `complementaryInformation` | `string` | No | 476 | Additional info |
| `criteria` | `string` | No | 2,017 | Requirements text |
| `minParticipants` | `number` | No | 7,732 | Minimum participants |
| `maxParticipants` | `number` | No | 7,732 | Maximum participants (0 = unlimited) |
| `duration` | `string` | No | 3,643 | e.g., "ALL_DAY" |
| `happening` | `string` | No | 4,690 | e.g., "REGULARLY" |
| `estimatedTime` | `string` | No | 369 | e.g., "LONG" |
| `typeOfGood` | `string` | No | 1,476 | For COLLECTION type |
| `embedding` | `number[]` | No | 10,386 | 1536-dim vector |
| `embeddingModel` | `string` | No | 10,386 | `text-embedding-3-small` |
| `embeddingUpdatedAt` | `Date` | No | 10,386 | Last embedding update |
| `createdAt` | `Date` | Yes | 10,386 | Creation timestamp |
| `updatedAt` | `Date` | Yes | 10,386 | Update timestamp |

---

## 2. Geolocation Structure

The `geolocations` field replaces the old `location` field. Each activity can have multiple geolocations.

### Geolocation Schema

```typescript
Geolocation = {
  _id?: string;                    // MongoDB subdocument ID
  googlePlaceId?: string;          // Google Places reference
  type: 'Point';                   // GeoJSON type
  coordinates: [number, number];   // [longitude, latitude]
  formattedAddress: [{
    _id?: string;
    formattedAddress: string;      // EMBEDDABLE - e.g., "Paris, France"
    language: string;              // e.g., "en"
  }];
}
```

### Sample Data

```json
{
  "geolocations": [
    {
      "_id": "605882e3b559a1001bc3e9e2",
      "googlePlaceId": "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
      "type": "Point",
      "coordinates": [2.3522219, 48.856614],
      "formattedAddress": [
        {
          "_id": "605882e3b559a1001bc3e9e3",
          "formattedAddress": "Paris, France",
          "language": "en"
        }
      ]
    }
  ]
}
```

---

## 3. Skills Field

**Important:** Skills are stored as a simple string array, not as objects with name/level.

### Database Structure

```json
{
  "skills": ["Project Management", "Digital Marketing", "Social Media"]
}
```

### Unique Skills (46 total)

Accounting, Branding, Business Development, Carpentry, Coaching, Communication, Compliance, Customer Relationship Management, DIY, Data Analysis, Database Administration, Digital Marketing, Education, Electricity, Engineering, Entrepreneurship, Environment, Evaluation & Reporting, Event Organisation, Finance, Fundraising, Gardening, Graphic Design, Health Services, Housing, Human Resources, Leadership, Legal, Logistics, Management, Marketing, Photography, Project Management, Social Media, Strategy Consulting, Video Editing, ...

---

## 4. Embedding Generation

### Embeddable Field Extraction

The `prepareActivityForEmbedding` function combines:

1. **From Activity schema** (via `extractEmbeddableValues`):
   - `title`: Activity title
   - `description`: Full description
   - `category`: Array joined with comma
   - `skills`: Array joined with comma

2. **From Geolocations** (via `extractGeolocationsEmbeddableValues`):
   - Formatted addresses from all geolocations
   - Prefers activity's language, falls back to "en"

3. **From Organization** (if provided):
   - `organization.name`
   - `organization.mission`

### Example Output

```
"Help us develop child sponsorship. Humanitarian sponsorship of children... Children, Education, Health. Project Management, Digital Marketing. Paris, France. Enfants du Soleil. Supporting children worldwide."
```

---

## 5. Vector Search Filter Fields

These fields can be used as **pre-filters** in MongoDB Atlas Vector Search:

| Filter Field | Type | Use Case | Cardinality |
|--------------|------|----------|-------------|
| `type` | enum | Filter by activity type | Low (3 values) |
| `remote` | boolean | Remote vs on-site | Binary |
| `language` | string | Content language | Low (~10 values) |
| `category` | string[] | Cause/domain filtering | Medium (~20 values) |
| `isActive` | boolean | Active activities only | Binary |
| `organizationId` | string | Organization-specific | High |
| `geolocations.coordinates` | GeoJSON | Geo-proximity filtering | Continuous |
| `timeCommitment.isFlexible` | boolean | Flexible schedule | Binary |
| `timeCommitment.isOneTime` | boolean | One-time vs ongoing | Binary |
| `timeCommitment.isRecurring` | boolean | Recurring commitments | Binary |

---

## 6. Removed Fields

The following legacy fields have been removed from the database:

| Field | Reason |
|-------|--------|
| `name` | Duplicate of `title` |
| `location` (string) | Superseded by `geolocations` |
| `creationDate` | Duplicate of `createdAt` |
| `updateAt` | Typo duplicate of `updatedAt` |
| `__v` | Mongoose internal |
| `_descriptionConvertedAt` | Migration metadata |
| `_originalDraftJSDescription` | Migration backup |
| `_descriptionConversionNote` | Migration notes |
| `activityWorkLanguages` | Empty arrays |
| `owningOrganizations` | Always empty |
| `timeSlotsIds` | Always empty |
| `sustainableDevelopmentGoals` | Always empty |
| `donationsTiers` | Always empty |
| `autoCreateOpportunities` | Internal flag |
| `autoCreatePost` | Internal flag |
| `sourceHash` | Import tracking |
| `popularityScoreBias` | Unused |
| `searchableText` | Replaced by embeddings |

---

## 7. Summary Statistics

| Metric | Value |
|--------|-------|
| Total activities | 10,386 |
| Activities with skills | 3,208 (31%) |
| Unique skill values | 46 |
| Unique categories | ~20 |
| Activity types | 3 (SKILLBASED, VOLUNTEERING, COLLECTION) |
| Embeddable fields | 4 (+ geolocations) |
| Embedding dimensions | 1,536 |
| Embedding model | text-embedding-3-small |

---

## 8. Schema Files Reference

- **Activity**: `packages/types/src/domain/activity.ts`
- **Location/Geolocation**: `packages/types/src/domain/location.ts`
- **Embeddable utils**: `packages/types/src/utils/embeddable.ts`
- **Embedding generation**: `packages/ai/src/embedding.ts`
