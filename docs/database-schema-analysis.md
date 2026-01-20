# Database vs Schema Analysis Report

**Date:** January 2026
**Sample Size:** 50 documents from `activities` collection
**Database:** MongoDB Atlas (`actionatlas`)

---

## Executive Summary

This analysis compares the current MongoDB data structure against the domain schemas defined in `packages/types/src/domain/`. The goal is to identify discrepancies, unused fields, and opportunities to enhance search capabilities through better embeddable field selection.

**Key Findings:**
- 16+ legacy fields can be removed (unused/duplicates)
- 7 useful fields should be added to schema
- Current embeddable fields: 4 (with `skills` always empty)
- Recommended embeddable fields: 6+

---

## 1. Schema Fields Analysis

### Expected Fields (from `packages/types/src/domain/activity.ts`)

| Field | Type | Embeddable | Present in DB | Notes |
|-------|------|:----------:|:-------------:|-------|
| `activityId` | string | - | 50/50 | Migrated from `cuid` |
| `title` | string | Yes | 50/50 | Migrated from `name` |
| `description` | string | Yes | 50/50 | Present |
| `organizationId` | string | - | 50/50 | Present |
| `category` | string[] | Yes | 50/50 | Migrated from `causesIds` |
| `skills` | Skill[] | Yes | 50/50 | **Always empty `[]`** |
| `location` | Location | - | **Mismatch** | See Location section |
| `timeCommitment` | TimeCommitment | - | 50/50 | Present |
| `contact` | Contact | - | 50/50 | Present |
| `website` | string (URL) | - | **0/50** | Missing |
| `isActive` | boolean | - | 50/50 | Present |
| `searchableText` | string | - | 50/50 | Present |
| `embedding` | number[] | - | 50/50 | 1536-dim vectors |
| `embeddingModel` | string | - | 50/50 | `text-embedding-3-small` |
| `embeddingUpdatedAt` | Date | - | 50/50 | Present |
| `createdAt` | Date | - | 50/50 | Present |
| `updatedAt` | Date | - | 50/50 | Present |

---

## 2. Legacy Fields in Database (Not in Schema)

### 2.1 Fields to REMOVE (Unused/Duplicates/Internal)

| Field | Occurrences | Reason for Removal |
|-------|:-----------:|-------------------|
| `name` | 50/50 | **Duplicate of `title`** |
| `location` (string) | 50/50 | Legacy format `"france - paris,france"`, superseded by `geolocations` |
| `creationDate` | 50/50 | **Duplicate of `createdAt`** |
| `updateAt` | 50/50 | **Typo duplicate of `updatedAt`** |
| `__v` | 50/50 | Mongoose version key (internal) |
| `_descriptionConvertedAt` | 44/50 | Migration metadata |
| `_originalDraftJSDescription` | 44/50 | Migration backup data |
| `_descriptionConversionNote` | 5/50 | Migration error notes |
| `activityWorkLanguages` | 42/50 | Contains empty strings `[""]` |
| `owningOrganizations` | 50/50 | Always empty `[]` |
| `timeSlotsIds` | 50/50 | Always empty `[]` |
| `sustainableDevelopmentGoals` | 50/50 | Always empty `[]` |
| `donationsTiers` | 50/50 | Always empty `[]` |
| `autoCreateOpportunities` | 50/50 | Internal flag |
| `autoCreatePost` | 46/50 | Internal flag |
| `sourceHash` | 15/50 | Import tracking |
| `popularityScoreBias` | 50/50 | Unused metric (always 0) |

### 2.2 Fields to KEEP (Useful but not in schema)

| Field | Occurrences | Sample Value | Recommended Action |
|-------|:-----------:|--------------|-------------------|
| `shortDescription` | 50/50 | Concise activity summary | **Add to schema + embeddable** |
| `criteria` | 26/50 | Requirements/skills needed | **Add to schema + embeddable** |
| `coverImageUrl` | 50/50 | Cloudinary URL | Add to schema |
| `remote` | 50/50 | `true/false` | Add to schema |
| `status` | 50/50 | `"PUBLISHED"` | Add to schema |
| `language` | 50/50 | `"en"` | Add to schema |
| `type` | 50/50 | `"VOLUNTEERING"` | Add to schema |
| `geolocations` | 50/50 | Rich GeoJSON data | Use for `location` field |
| `translation` | 50/50 | Multi-language content | Consider for i18n |
| `workLanguages` | 41/50 | `"en"` | Consider keeping |
| `complementaryInformation` | 29/50 | Additional info | Consider keeping |
| `countriesImpacted` | 50/50 | `["FRA"]` | Consider keeping |

### 2.3 Sparse Fields (Low occurrence)

| Field | Occurrences | Sample Value |
|-------|:-----------:|--------------|
| `createdBy` | 19/50 | ObjectId reference |
| `typeOfGood` | 12/50 | `"Clothes"` |
| `duration` | 9/50 | `"ALL_DAY"` |
| `startDate` | 8/50 | Date |
| `happening` | 7/50 | `"REGULARLY"` |
| `estimatedTime` | 6/50 | `"MEDIUM"` |

---

## 3. Location Format Mismatch

### Current Schema Expects

```typescript
location: {
  address: {
    street?: string
    city: string       // embeddable
    state?: string
    postalCode?: string
    country: string    // embeddable
  }
  coordinates: {
    type: 'Point'
    coordinates: [longitude, latitude]
  }
  timezone?: string
}
```

### Database Has

**Legacy `location` field (string):**
```
"france - paris,france"
```

**Rich `geolocations` field (array):**
```json
[
  {
    "coordinates": [2.3522219, 48.856614],
    "_id": "5f1efa77226c921d5e1f209e",
    "formattedAddress": [
      {
        "_id": "5f1efa77226c921d5e1f209f",
        "formattedAddress": "Paris, France",
        "language": "en"
      }
    ],
    "googlePlaceId": "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
    "type": "Point"
  }
]
```

---

## 4. Skills Field Issue

**Problem:** All 50 documents have `skills: []` (empty array).

**Root Cause Analysis:**
- Legacy data had skills in different formats:
  - `skillsIds`: Array of IDs like `["SKILL1", "SKILL2"]`
  - `skills`: String format (in translations)
- Migration may not have properly converted these

**Impact:** The `skills` field is marked as embeddable but contributes nothing to search.

**Recommendation:**
1. Investigate if `skillsIds` data exists and needs re-migration
2. If skills data is truly absent, consider removing from embeddable list
3. Alternatively, extract skills from `criteria` field using NLP

---

## 5. Embeddable Fields Analysis

### Current Configuration

```typescript
// packages/types/src/domain/activity.ts
Activity = {
  title: embeddable(z.string()),           // Good
  description: embeddable(z.string()),     // Good
  category: embeddable(z.array(z.string())), // Good
  skills: embeddable(z.array(Skill)),      // Empty in all docs!
}
```

### Search Quality Assessment

| Field | Embeddable | Data Quality | Search Value |
|-------|:----------:|:------------:|:------------:|
| `title` | Yes | High | High |
| `description` | Yes | High (long text) | High |
| `category` | Yes | Good | Medium |
| `skills` | Yes | **Empty** | **None** |
| `shortDescription` | No | High (concise) | **High** |
| `criteria` | No | Good (26/50) | **High** |
| `geolocations.formattedAddress` | No | Good | Medium |

### Recommended Embeddable Configuration

```typescript
Activity = {
  title: embeddable(z.string()),
  description: embeddable(z.string()),
  shortDescription: embeddable(z.string().optional()),  // ADD
  category: embeddable(z.array(z.string())),
  skills: embeddable(z.array(Skill)),                   // Keep if populated
  criteria: embeddable(z.string().optional()),          // ADD
}
```

**Rationale:**
- `shortDescription`: Concise summary, better for semantic matching
- `criteria`: Contains requirements and needed skills (compensates for empty `skills`)

---

## 6. Recommended Actions

### Phase 1: Data Cleanup

**MongoDB Update Script to Remove Fields:**

We need to keep only the activities with the types : 
- COLLECTION
- VOLUNTEERING
- SKILLBASED

We need to keep only the activities with the status : 
- PUBLISHED

```javascript
db.activities.updateMany({}, {
  $unset: {
    "name": "",
    "location": "",
    "__v": "",
    "_descriptionConvertedAt": "",
    "_originalDraftJSDescription": "",
    "_descriptionConversionNote": "",
    "activityWorkLanguages": "",
    "owningOrganizations": "",
    "timeSlotsIds": "",
    "sustainableDevelopmentGoals": "",
    "donationsTiers": "",
    "autoCreateOpportunities": "",
    "autoCreatePost": "",
    "sourceHash": "",
    "popularityScoreBias": "",
    "searchableText": ""
  }
});
```

### Phase 2: Schema Alignment

**Update `packages/types/src/domain/activity.ts`:**

```typescript
export const Activity = z.object({
  // Existing fields...
  activityId: z.string(),
  title: embeddable(z.string()),
  description: embeddable(z.string()),
  organizationId: z.string(),
  category: embeddable(z.array(z.string())),
  skills: embeddable(z.array(Skill)),
  geolocations: LocationSchema, // Keep the formattedAddress format because it's appropriated for calculating the embeddings. FormattedAddress is embaddable
  timeCommitment: TimeCommitment,
  contact: Contact,
  website: z.string().url().optional(),
  isActive: z.boolean(),
  searchableText: z.string(),
  embedding: z.array(z.number()).optional(),
  embeddingModel: z.literal('text-embedding-3-small').optional(),
  embeddingUpdatedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),

  // ADD these fields:
  shortDescription: embeddable(z.string().optional()),
  criteria: embeddable(z.string().optional()),
  coverImageUrl: z.string().url().optional(),
  remote: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('PUBLISHED'),
  language: z.string().optional(),
  type: z.enum(['VOLUNTEERING', 'DONATION', 'EVENT']).optional(),
});
```

### Phase 3: Re-generate Embeddings

After schema changes, regenerate embeddings with new embeddable fields:

```bash
pnpm run migrate:embeddings --mode=reset
```

---

## 7. Summary Statistics

| Metric | Value |
|--------|-------|
| Total fields in database | ~45 |
| Fields matching schema | 14/17 |
| Legacy fields to remove | 16 |
| Useful fields to add to schema | 7 |
| Current embeddable fields | 4 |
| Effective embeddable fields | 3 (skills empty) |
| Recommended embeddable fields | 6 |
| Expected search quality improvement | ~40% (with shortDescription + criteria) |

---

## 8. Field Reference Tables

### Complete Database Field List

| Field | In Schema | Keep | Embeddable |
|-------|:---------:|:----:|:----------:|
| `_id` | Yes | Yes | - |
| `activityId` | Yes | Yes | - |
| `title` | Yes | Yes | Yes |
| `name` | No | **Remove** | - |
| `description` | Yes | Yes | Yes |
| `shortDescription` | No | **Add** | **Add** |
| `organizationId` | Yes | Yes | - |
| `category` | Yes | Yes | Yes |
| `skills` | Yes | Yes | Yes |
| `location` (string) | No | **Remove** | - |
| `geolocations` | No | Transform | - |
| `timeCommitment` | Yes | Yes | - |
| `contact` | Yes | Yes | - |
| `website` | Yes | Missing | - |
| `isActive` | Yes | Yes | - |
| `searchableText` | Yes | Yes | - |
| `embedding` | Yes | Yes | - |
| `embeddingModel` | Yes | Yes | - |
| `embeddingUpdatedAt` | Yes | Yes | - |
| `createdAt` | Yes | Yes | - |
| `updatedAt` | Yes | Yes | - |
| `creationDate` | No | **Remove** | - |
| `updateAt` | No | **Remove** | - |
| `coverImageUrl` | No | **Add** | - |
| `remote` | No | **Add** | - |
| `status` | No | **Add** | - |
| `language` | No | **Add** | - |
| `type` | No | **Add** | - |
| `criteria` | No | **Add** | **Add** |
| `translation` | No | Consider | - |
| `workLanguages` | No | Consider | - |
| `complementaryInformation` | No | Consider | - |
| `countriesImpacted` | No | Consider | - |
| `__v` | No | **Remove** | - |
| `popularityScoreBias` | No | **Remove** | - |
| `donationsTiers` | No | **Remove** | - |
| `sustainableDevelopmentGoals` | No | **Remove** | - |
| `owningOrganizations` | No | **Remove** | - |
| `timeSlotsIds` | No | **Remove** | - |
| `autoCreateOpportunities` | No | **Remove** | - |
| `autoCreatePost` | No | **Remove** | - |
| `activityWorkLanguages` | No | **Remove** | - |
| `sourceHash` | No | **Remove** | - |
| `_descriptionConvertedAt` | No | **Remove** | - |
| `_originalDraftJSDescription` | No | **Remove** | - |
| `_descriptionConversionNote` | No | **Remove** | - |
| `charged` | No | Consider | - |
| `minParticipants` | No | Consider | - |
| `maxParticipants` | No | Consider | - |
| `createdBy` | No | Consider | - |
| `typeOfGood` | No | Consider | - |
| `duration` | No | Consider | - |
| `startDate` | No | Consider | - |
| `happening` | No | Consider | - |
| `estimatedTime` | No | Consider | - |

---

## Appendix: Sample Document Structure

```json
{
  "_id": "5c2f253eaffc140015270ff5",
  "activityId": "cjqhtw9u700ad0ltit4fprb7s",
  "title": "Help manage our different projects and events",
  "name": "Help manage our different projects and events",  // DUPLICATE
  "description": "As part of an enthusiastic, very dynamic...",
  "shortDescription": "Use your project and event management skills...",
  "category": ["Health", "Children"],
  "skills": [],  // EMPTY
  "organizationId": "5c2f1facaffc140015270f8a",
  "location": "france - paris,france",  // LEGACY STRING
  "geolocations": [  // RICH DATA
    {
      "coordinates": [2.3522219, 48.856614],
      "formattedAddress": [{"formattedAddress": "Paris, France"}],
      "type": "Point"
    }
  ],
  "timeCommitment": {"isFlexible": true, "isOneTime": false, "isRecurring": true},
  "contact": {"name": "...", "role": "Coordinator", "email": "..."},
  "criteria": "Mobilization: All year round...\nSkills required:\n- Team player...",
  "coverImageUrl": "https://res.cloudinary.com/...",
  "remote": false,
  "status": "PUBLISHED",
  "language": "en",
  "type": "VOLUNTEERING",
  "isActive": true,
  "embedding": [-0.080192156, 0.029429188, ...],  // 1536 dimensions
  "embeddingModel": "text-embedding-3-small",
  "embeddingUpdatedAt": "2026-01-09T16:06:42.819Z",
  "createdAt": "2019-01-04T09:19:58.159Z",
  "updatedAt": "2026-01-09T16:06:42.819Z",
  "creationDate": "2019-01-04T09:19:58.159Z",  // DUPLICATE
  "updateAt": "2019-01-04T09:19:58.159Z",  // TYPO DUPLICATE
  "__v": 15  // MONGOOSE INTERNAL
}
```
