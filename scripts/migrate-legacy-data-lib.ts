/**
 * Shared migration transformation logic
 * Used by both migrate-legacy-data.ts and seed-database.ts
 */

import { ObjectId } from 'mongodb';

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
  timeCommitment?: unknown;
  contact?: unknown;
  category?: string;
  isActive?: boolean;
  searchableText?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

export interface TransformResult {
  updates: Record<string, unknown>;
  fieldsToUnset: string[];
  errors: string[];
}

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

  // Transform skills string → array
  if (typeof doc.skills === 'string') {
    const skillsArray = doc.skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((name) => ({ name }));

    if (skillsArray.length > 0) {
      updates.skills = skillsArray;
    } else {
      // Set empty array if no valid skills found
      updates.skills = [];
    }
  } else if (!doc.skills || (Array.isArray(doc.skills) && doc.skills.length === 0)) {
    // Ensure skills is always an array
    updates.skills = [];
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

  // Set default category
  if (!doc.category) {
    updates.category = 'other';
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

  return { updates, fieldsToUnset, errors };
}
