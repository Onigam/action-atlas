import { z } from 'zod';

import type { Location } from './location';
import { embeddable } from '../utils/embeddable';

export const ActivityCategory = z.enum([
  'education',
  'environment',
  'health',
  'social-services',
  'arts-culture',
  'animal-welfare',
  'community-development',
  'youth',
  'seniors',
  'technology',
  'other',
]);

export type ActivityCategory = z.infer<typeof ActivityCategory>;

export const SkillLevel = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

export type SkillLevel = z.infer<typeof SkillLevel>;

export const Skill = z.object({
  name: z.string(),
  level: SkillLevel.optional(),
});

export type Skill = z.infer<typeof Skill>;

export const TimeCommitment = z.object({
  hoursPerWeek: z.number().positive().optional(),
  isFlexible: z.boolean(),
  isOneTime: z.boolean(),
  isRecurring: z.boolean(),
  schedule: z.string().optional(),
});

export type TimeCommitment = z.infer<typeof TimeCommitment>;

export const Contact = z.object({
  name: z.string(),
  role: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  surname: z.string().optional(),
});

export type Contact = z.infer<typeof Contact>;

export const Activity = z.object({
  activityId: z.string(),
  title: embeddable(z.string()),
  description: embeddable(z.string()),
  organizationId: z.string(),
  category: embeddable(ActivityCategory),
  skills: embeddable(z.array(Skill)),
  location: z.custom<Location>(),
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
});

export type Activity = z.infer<typeof Activity>;

export const ActivityDocument = Activity.extend({
  _id: z.custom<unknown>(), // MongoDB ObjectId
});

export type ActivityDocument = z.infer<typeof ActivityDocument>;
