import { z } from 'zod';

import { Geolocation } from './location';
import { embeddable } from '../utils/embeddable';

// Category is a dynamic string - no enum restriction
// Categories are driven by the data (e.g., "Children", "Education", "Health", etc.)
export type ActivityCategory = string;

/**
 * Activity status enum
 * Currently only PUBLISHED activities are retained in the database
 */
export const ActivityStatus = z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']);
export type ActivityStatus = z.infer<typeof ActivityStatus>;

/**
 * Activity type enum
 * Defines the kind of volunteering activity
 */
export const ActivityType = z.enum(['SKILLBASED', 'VOLUNTEERING', 'COLLECTION']);
export type ActivityType = z.infer<typeof ActivityType>;

/**
 * Time commitment structure
 * Describes the schedule flexibility and recurrence of an activity
 */
export const TimeCommitment = z.object({
  hoursPerWeek: z.number().positive().optional(),
  isFlexible: z.boolean(),
  isOneTime: z.boolean(),
  isRecurring: z.boolean(),
  schedule: z.string().optional(),
});

export type TimeCommitment = z.infer<typeof TimeCommitment>;

/**
 * Contact information for the activity
 */
export const Contact = z.object({
  name: z.string(),
  role: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
});

export type Contact = z.infer<typeof Contact>;

/**
 * Activity schema - aligned with actual MongoDB document structure
 *
 * Embeddable fields (used for vector search embeddings):
 * - title: Activity name/title
 * - description: Full activity description
 * - category: Array of cause categories
 * - skills: Array of required skills (strings)
 * - geolocations[].formattedAddress[].formattedAddress: Location text for semantic search
 */
export const Activity = z.object({
  // Core identifiers
  activityId: z.string(),
  organizationId: z.string(),

  // Content fields - embeddable for vector search
  title: embeddable(z.string()),
  description: embeddable(z.string()), // Can be Draft.js JSON or plain text
  category: embeddable(z.array(z.string())),
  skills: embeddable(z.array(z.string())), // Simple string array, not Skill objects

  // Location - array of geolocations with embedded formattedAddress
  geolocations: z.array(Geolocation),

  // Activity metadata
  status: ActivityStatus.default('PUBLISHED'),
  type: ActivityType,
  language: z.string(),
  remote: z.boolean(),
  charged: z.boolean(),

  // Time and scheduling
  timeCommitment: TimeCommitment,

  // Contact information
  contact: Contact,

  // Activity state
  isActive: z.boolean(),

  // Optional fields (sparse in DB)
  coverImageUrl: z.string().url().optional(),
  workLanguages: z.string().optional(),
  complementaryInformation: z.string().optional(),
  criteria: z.string().optional(),
  minParticipants: z.number().nullable().optional(),
  maxParticipants: z.number().nullable().optional(),
  duration: z.string().optional(),
  happening: z.string().optional(),
  estimatedTime: z.string().optional(),
  typeOfGood: z.string().optional(),

  // Embedding fields
  embedding: z.array(z.number()).optional(),
  embeddingModel: z.literal('text-embedding-3-small').optional(),
  embeddingUpdatedAt: z.date().optional(),

  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Activity = z.infer<typeof Activity>;

/**
 * Activity document as stored in MongoDB
 * Includes the MongoDB _id field
 */
export const ActivityDocument = Activity.extend({
  _id: z.custom<unknown>(), // MongoDB ObjectId
});

export type ActivityDocument = z.infer<typeof ActivityDocument>;
