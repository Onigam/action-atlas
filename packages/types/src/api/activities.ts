import { z } from 'zod';

import {
  Activity,
  Contact,
  Skill,
  TimeCommitment,
} from '../domain/activity';
import { Location } from '../domain/location';

export const CreateActivityRequest = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(50).max(5000),
  organizationId: z.string(),
  category: z.array(z.string()).min(1),
  skills: z.array(Skill),
  location: Location,
  timeCommitment: TimeCommitment,
  contact: Contact,
  website: z.string().url().optional(),
});

export type CreateActivityRequest = z.infer<typeof CreateActivityRequest>;

export const UpdateActivityRequest = CreateActivityRequest.partial().extend({
  isActive: z.boolean().optional(),
});

export type UpdateActivityRequest = z.infer<typeof UpdateActivityRequest>;

export const ActivityResponse = Activity;

export type ActivityResponse = z.infer<typeof ActivityResponse>;
