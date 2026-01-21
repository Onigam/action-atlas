import { z } from 'zod';

import { embeddable } from '../utils/embeddable';

/**
 * Formatted address with language support
 * Used within geolocations for multi-language address display
 */
export const FormattedAddress = z.object({
  _id: z.string().optional(),
  formattedAddress: embeddable(z.string()),
  language: z.string(),
});

export type FormattedAddress = z.infer<typeof FormattedAddress>;

/**
 * GeoJSON Point structure for coordinates
 * Standard format: [longitude, latitude]
 */
export const GeoJSONPoint = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
});

export type GeoJSONPoint = z.infer<typeof GeoJSONPoint>;

/**
 * Geolocation entry - matches the actual MongoDB structure
 * Activities can have multiple geolocations
 */
export const Geolocation = z.object({
  _id: z.string().optional(),
  googlePlaceId: z.string().optional(),
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
  formattedAddress: z.array(FormattedAddress),
});

export type Geolocation = z.infer<typeof Geolocation>;

/**
 * @deprecated Use Geolocation instead - this was the old expected format
 * Kept for reference during migration
 */
export const Address = z.object({
  street: z.string().optional(),
  city: z.string(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string(),
});

export type Address = z.infer<typeof Address>;

/**
 * @deprecated Use Geolocation[] instead - this was the old expected format
 * Kept for reference during migration
 */
export const Location = z.object({
  address: Address,
  coordinates: GeoJSONPoint,
  timezone: z.string().optional(),
});

export type Location = z.infer<typeof Location>;
