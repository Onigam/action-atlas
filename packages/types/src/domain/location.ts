import { z } from 'zod';

export const Address = z.object({
  street: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string(),
});

export type Address = z.infer<typeof Address>;

export const GeoJSONPoint = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
});

export type GeoJSONPoint = z.infer<typeof GeoJSONPoint>;

export const Location = z.object({
  address: Address,
  coordinates: GeoJSONPoint,
  timezone: z.string().optional(),
});

export type Location = z.infer<typeof Location>;
