import { z } from 'zod';

import type { Location } from './location';
import { embeddable } from '../utils/embeddable';

export const OrganizationStatus = z.enum([
  'pending',
  'verified',
  'rejected',
  'suspended',
]);

export type OrganizationStatus = z.infer<typeof OrganizationStatus>;

export const Organization = z.object({
  organizationId: z.string(),
  name: embeddable(z.string()),
  description: embeddable(z.string()),
  mission: embeddable(z.string().optional()),
  location: z.custom<Location>(),
  website: z.string().url().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  logo: z.string().url().optional(),
  status: OrganizationStatus,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Organization = z.infer<typeof Organization>;

export const OrganizationDocument = Organization.extend({
  _id: z.custom<unknown>(), // MongoDB ObjectId
});

export type OrganizationDocument = z.infer<typeof OrganizationDocument>;
