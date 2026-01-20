/**
 * Shared migration transformation logic
 * Used by both migrate-legacy-data.ts and seed-database.ts
 */

import { ObjectId } from 'mongodb';

/**
 * Legacy fields to remove during cleanup.
 * These are fields that are either:
 * - Duplicates of other fields (name → title, creationDate → createdAt)
 * - Migration metadata no longer needed
 * - Always empty arrays or unused
 * - Internal flags not part of the schema
 */
export const LEGACY_FIELDS_TO_REMOVE = [
  'name',                        // Duplicate of title
  'location',                    // Legacy string format (superseded by geolocations → location object)
  '__v',                         // Mongoose version key
  '_descriptionConvertedAt',     // Migration metadata
  '_originalDraftJSDescription', // Migration backup data
  '_descriptionConversionNote',  // Migration error notes
  'activityWorkLanguages',       // Contains empty strings
  'owningOrganizations',         // Always empty
  'timeSlotsIds',                // Always empty
  'sustainableDevelopmentGoals', // Always empty
  'donationsTiers',              // Always empty
  'autoCreateOpportunities',     // Internal flag
  'autoCreatePost',              // Internal flag
  'sourceHash',                  // Import tracking
  'popularityScoreBias',         // Unused metric (always 0)
  'searchableText',              // Will be regenerated with new embeddable fields
  'creationDate',                // Duplicate of createdAt
  'updateAt',                    // Typo duplicate of updatedAt
] as const;

// Mapping from cause IDs to labels
const CAUSES_MAP: Record<string, string> = {
  "CAUSE1": "Animals",
  "CAUSE2": "Arts & Culture",
  "CAUSE3": "Responsible consumption",
  "CAUSE4": "Human rights",
  "CAUSE5": "Water",
  "CAUSE6": "Education",
  "CAUSE7": "Gender Equality",
  "CAUSE8": "Clean energy",
  "CAUSE9": "Environment",
  "CAUSE10": "Children",
  "CAUSE11": "Hunger",
  "CAUSE12": "Disability",
  "CAUSE13": "Innovation",
  "CAUSE14": "Social integration",
  "CAUSE15": "Poverty",
  "CAUSE16": "Refugees",
  "CAUSE17": "Professional reintegration",
  "CAUSE18": "Disaster relief",
  "CAUSE19": "Health",
  "CAUSE20": "Sustainable cities",
  "CAUSE21": "Sport"
};

// Mapping from skill IDs to labels
const SKILLS_MAP: Record<string, string> = {
  "SKILL1": "Accounting",
  "SKILL2": "Branding",
  "SKILL3": "Business Development",
  "SKILL4": "Carpentry",
  "SKILL5": "Coaching",
  "SKILL6": "Communication",
  "SKILL7": "Compliance",
  "SKILL8": "Customer Relationship Management",
  "SKILL9": "Data Analysis",
  "SKILL10": "Database Administration",
  "SKILL11": "Digital Marketing",
  "SKILL12": "DIY (Do-it-yourself)",
  "SKILL13": "Education",
  "SKILL14": "Electricity",
  "SKILL15": "Engineering",
  "SKILL16": "Entrepreneurship",
  "SKILL17": "Environment",
  "SKILL18": "Evaluation & Reporting",
  "SKILL19": "Event Organisation",
  "SKILL20": "Finance",
  "SKILL21": "Fundraising",
  "SKILL22": "Gardening",
  "SKILL23": "Graphic Design",
  "SKILL24": "Health Services",
  "SKILL25": "Housing",
  "SKILL26": "Human Resources",
  "SKILL27": "Translation",
  "SKILL28": "Leadership",
  "SKILL29": "Legal",
  "SKILL30": "Logistics",
  "SKILL31": "Management",
  "SKILL32": "Market study",
  "SKILL33": "Marketing",
  "SKILL34": "Masonry",
  "SKILL35": "Photography",
  "SKILL36": "Plumbing",
  "SKILL37": "Project Management",
  "SKILL38": "Public Relations",
  "SKILL39": "Public Speaking",
  "SKILL40": "Research",
  "SKILL41": "Social Media",
  "SKILL42": "Strategy Consulting",
  "SKILL43": "Video Editing",
  "SKILL44": "Web Design",
  "SKILL45": "Web Development",
  "SKILL46": "Writing"
};

export interface LegacyDocument {
  _id: ObjectId;
  cuid?: string;
  activityId?: string;
  name?: string;
  title?: string;
  charity?: string;
  organizationId?: string;
  description?: string;
  shortDescription?: string;
  geolocations?: Array<{
    formattedAddress?: Array<{ formattedAddress?: string }>;
    coordinates?: [number, number];
  }>;
  location?: unknown;
  skills?: string | Array<{ name: string; level?: string }>;
  skillsIds?: string[];
  timeCommitment?: unknown;
  contact?: unknown;
  category?: string | string[];
  causes?: string;
  causesIds?: string[];
  isActive?: boolean;
  searchableText?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

/**
 * Converts causes string and/or existing category to a category array.
 * Keeps the original values as-is without any mapping or normalization.
 */
function parseCausesToCategoryArray(causes?: string): string[] {
  const categories: Set<string> = new Set();

  // Parse causes string (comma-separated) - keep original values
  if (causes && typeof causes === 'string') {
    const causeList = causes.split(',').map(c => c.trim()).filter(c => c.length > 0);
    for (const cause of causeList) {
      categories.add(cause);
    }
  }

  return Array.from(categories);
}

/**
 * Converts causesIds array to category labels array using CAUSES_MAP.
 */
function parseCausesIdsToLabels(causesIds?: string[]): string[] {
  if (!causesIds || !Array.isArray(causesIds)) {
    return [];
  }

  return causesIds
    .map(id => CAUSES_MAP[id])
    .filter((label): label is string => label !== undefined);
}

/**
 * Converts skillsIds array to skill labels array using SKILLS_MAP.
 */
function parseSkillsIdsToLabels(skillsIds?: string[]): string[] {
  if (!skillsIds || !Array.isArray(skillsIds)) {
    return [];
  }

  return skillsIds
    .map(id => SKILLS_MAP[id])
    .filter((label): label is string => label !== undefined);
}

export interface TransformResult {
  updates: Record<string, unknown>;
  fieldsToUnset: string[];
  errors: string[];
}

/**
 * Transforms a legacy document to match the current Activity schema.
 *
 * IMPORTANT: When adding new transformation logic:
 * 1. Always check if the field has already been migrated before transforming
 *    (e.g., `if (doc.oldField && !doc.newField)`)
 * 2. Update the query in migrate-legacy-data.ts to find documents needing this transformation
 * 3. Add the old field to LEGACY_FIELDS_TO_REMOVE if it should be cleaned up
 *
 * This ensures idempotent migrations that won't re-process already migrated documents.
 */
export function transformDocument(doc: LegacyDocument, cleanup: boolean): TransformResult {
  const updates: Record<string, unknown> = {};
  const fieldsToUnset: string[] = [];
  const errors: string[] = [];

  // Map cuid → activityId
  if (doc.cuid && !doc.activityId) {
    updates.activityId = doc.cuid;
    if (cleanup) {
      fieldsToUnset.push('cuid');
    }
  }

  // Map name → title
  if (doc.name && !doc.title) {
    updates.title = doc.name;
    if (cleanup) {
      fieldsToUnset.push('name');
    }
  }

  // Map charity → organizationId
  if (doc.charity && !doc.organizationId) {
    updates.organizationId = doc.charity;
    if (cleanup) {
      fieldsToUnset.push('charity');
    }
  }

  // Use shortDescription if description is missing
  if (!doc.description && doc.shortDescription) {
    updates.description = doc.shortDescription;
    if (cleanup) {
      fieldsToUnset.push('shortDescription');
    }
  }

  // Transform geolocations → location
  if (doc.geolocations && !doc.location) {
    const firstGeo = doc.geolocations[0];
    if (firstGeo) {
      const formattedAddr =
        firstGeo.formattedAddress?.[0]?.formattedAddress || '';
      const parts = formattedAddr.split(',').map((p) => p.trim()).filter(Boolean);

      // Validate coordinates
      const coords = firstGeo.coordinates || [0, 0];
      const [lng, lat] = coords;

      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        errors.push('Invalid coordinates: not finite numbers');
      } else if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        errors.push(`Invalid coordinates: lng=${lng}, lat=${lat} out of range`);
      }

      updates.location = {
        address: {
          city: parts[0] || 'Unknown',
          country: parts[parts.length - 1] || 'Unknown',
        },
        coordinates: {
          type: 'Point',
          coordinates: coords,
        },
      };
    } else {
      // geolocations array is empty - set a default location
      errors.push('geolocations array is empty');
      updates.location = {
        address: {
          city: 'Unknown',
          country: 'Unknown',
        },
        coordinates: {
          type: 'Point',
          coordinates: [0, 0],
        },
      };
    }

    // Always cleanup geolocations when transforming
    if (cleanup) {
      fieldsToUnset.push('geolocations');
    }
  }

  // Transform skills: prioritize skillsIds if it exists, otherwise use skills string
  // Check if skills is already a valid string array (already migrated)
  const skillsAlreadyMigrated = Array.isArray(doc.skills) &&
    doc.skills.length > 0 &&
    typeof doc.skills[0] === 'string';

  if (doc.skillsIds && Array.isArray(doc.skillsIds) && doc.skillsIds.length > 0 && !skillsAlreadyMigrated) {
    // Convert skillsIds to labels array
    const skillLabels = parseSkillsIdsToLabels(doc.skillsIds);
    updates.skills = skillLabels;
  } else if (typeof doc.skills === 'string') {
    const skillsArray = doc.skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    updates.skills = skillsArray;
  } else if (!doc.skills || (Array.isArray(doc.skills) && doc.skills.length === 0)) {
    // Ensure skills is always an array
    updates.skills = [];
  }

  // Clean up skillsIds field if it exists
  if (cleanup && doc.skillsIds) {
    fieldsToUnset.push('skillsIds');
  }

  // Add missing timeCommitment
  if (!doc.timeCommitment) {
    updates.timeCommitment = {
      isFlexible: true,
      isOneTime: false,
      isRecurring: true,
    };
  }

  // Transform or add contact
  if (!doc.contact) {
    updates.contact = {
      name: 'Contact via organization',
      role: 'Coordinator',
      email: 'contact@organization.org',
    };
  } else {
    // Transform legacy contact format if needed
    const legacyContact = doc.contact as {
      name?: string;
      surname?: string;
      email?: string;
      phone?: string;
      role?: string;
    };

    // Check if contact needs transformation (has surname or missing role)
    if (legacyContact.surname || !legacyContact.role) {
      const fullName = legacyContact.surname
        ? `${legacyContact.name || ''} ${legacyContact.surname}`.trim()
        : (legacyContact.name || 'Contact via organization');

      updates.contact = {
        name: fullName,
        role: legacyContact.role || 'Coordinator',
        email: legacyContact.email || 'contact@organization.org',
        ...(legacyContact.phone && { phone: legacyContact.phone }),
      };
    }
  }

  // Convert causesIds or causes string to category array
  if (doc.causesIds && Array.isArray(doc.causesIds) && doc.causesIds.length > 0) {
    // Convert causesIds to labels array
    const categoryArray = parseCausesIdsToLabels(doc.causesIds);
    if (categoryArray.length > 0) {
      updates.category = categoryArray;
    }
  } else if (doc.causes) {
    const categoryArray = parseCausesToCategoryArray(doc.causes);
    if (categoryArray.length > 0) {
      updates.category = categoryArray;
    }
  }

  // Clean up old causesIds field
  if (cleanup && doc.causesIds) {
    fieldsToUnset.push('causesIds');
  }

  // Clean up old causes field
  if (cleanup && doc.causes) {
    fieldsToUnset.push('causes');
  }

  // Set default isActive
  if (doc.isActive === undefined) {
    updates.isActive = true;
  }

  // Set default searchableText
  if (!doc.searchableText) {
    const title = (updates.title as string) || doc.title || doc.name || '';
    const description = (updates.description as string) || doc.description || '';
    const searchableText = [title, description]
      .filter(Boolean)
      .join('. ')
      .trim();

    if (searchableText) {
      updates.searchableText = searchableText;
    } else {
      errors.push('Cannot generate searchableText: missing title and description');
    }
  }

  // Set timestamps
  if (!doc.createdAt) {
    updates.createdAt = new Date();
  }
  if (!doc.updatedAt) {
    updates.updatedAt = new Date();
  }

  // Add all legacy fields to unset list when cleanup is enabled
  // Only add fields that actually exist in the document to avoid unnecessary operations
  if (cleanup) {
    for (const field of LEGACY_FIELDS_TO_REMOVE) {
      if (doc[field] !== undefined && !fieldsToUnset.includes(field)) {
        fieldsToUnset.push(field);
      }
    }
  }

  return { updates, fieldsToUnset, errors };
}
