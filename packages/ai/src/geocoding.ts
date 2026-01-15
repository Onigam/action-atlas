import { z } from 'zod';

/**
 * Geocoding result schema
 */
export const GeocodingResult = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  formattedAddress: z.string(),
  placeId: z.string().optional(),
});

export type GeocodingResult = z.infer<typeof GeocodingResult>;

/**
 * Google Maps Geocoding API response types
 */
interface GoogleGeocodingResponse {
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
  }>;
  status: string;
  error_message?: string;
}

/**
 * Geocoding service options
 */
export interface GeocodingOptions {
  formattedAddress: string;
  language?: string;
}

/**
 * Validate Google Maps API key is set
 */
function validateApiKey(): string {
  const apiKey = process.env['GOOGLE_MAPS_API_KEY'];
  if (!apiKey) {
    throw new Error(
      'GOOGLE_MAPS_API_KEY environment variable is not set. Please set it to use geocoding services.'
    );
  }
  return apiKey;
}

/**
 * Geocode an address to coordinates using Google Maps Geocoding API
 *
 * @param options - The geocoding options (address and optional language)
 * @returns Array of geocoding results (usually returns 1 result for most addresses)
 * @throws Error if API key is not set or if geocoding fails
 */
export async function geocode(
  options: GeocodingOptions
): Promise<GeocodingResult[]> {
  const apiKey = validateApiKey();
  const { formattedAddress, language = 'en' } = options;

  // Input validation
  if (!formattedAddress || formattedAddress.trim().length === 0) {
    throw new Error('formattedAddress cannot be empty');
  }
  if (formattedAddress.length > 500) {
    throw new Error('formattedAddress exceeds maximum length of 500 characters');
  }
  if (!language || language.length !== 2) {
    throw new Error('language must be a valid 2-letter ISO language code');
  }

  const params = new URLSearchParams({
    address: formattedAddress,
    language,
    key: apiKey,
  });

  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Geocoding request failed with status ${response.status}: ${response.statusText}`
    );
  }

  const data = (await response.json()) as GoogleGeocodingResponse;

  if (data.status !== 'OK') {
    if (data.status === 'ZERO_RESULTS') {
      return []; // No results found, return empty array
    }
    throw new Error(
      `Geocoding failed with status ${data.status}: ${data.error_message || 'Unknown error'}`
    );
  }

  return data.results.map((result) => ({
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
    placeId: result.place_id,
  }));
}

/**
 * Geocode an address and return the first result
 *
 * @param options - The geocoding options
 * @returns The first geocoding result or null if no results
 */
export async function geocodeFirst(
  options: GeocodingOptions
): Promise<GeocodingResult | null> {
  const results = await geocode(options);
  return results.length > 0 ? results[0]! : null;
}

/**
 * Check if geocoding is available (API key is configured)
 */
export function isGeocodingAvailable(): boolean {
  return !!process.env['GOOGLE_MAPS_API_KEY'];
}
