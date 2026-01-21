import { z } from 'zod';

import {
  Activity,
  Contact,
  TimeCommitment,
  ActivityType,
  ActivityStatus,
} from '../domain/activity';
import { Geolocation } from '../domain/location';

export const CreateActivityRequest = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(50).max(5000),
  organizationId: z.string(),
  category: z.array(z.string()).min(1),
  skills: z.array(z.string()), // Simple string array
  geolocations: z.array(Geolocation),
  timeCommitment: TimeCommitment,
  contact: Contact,
  type: ActivityType,
  language: z.string(),
  remote: z.boolean(),
  charged: z.boolean(),
  coverImageUrl: z.string().url().optional(),
  workLanguages: z.string().optional(),
  complementaryInformation: z.string().optional(),
  criteria: z.string().optional(),
});

export type CreateActivityRequest = z.infer<typeof CreateActivityRequest>;

export const UpdateActivityRequest = CreateActivityRequest.partial().extend({
  isActive: z.boolean().optional(),
  status: ActivityStatus.optional(),
});

export type UpdateActivityRequest = z.infer<typeof UpdateActivityRequest>;

export const ActivityResponse = Activity;

export type ActivityResponse = z.infer<typeof ActivityResponse>;
