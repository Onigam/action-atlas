import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

/**
 * Schema for location extraction result
 */
export const LocationExtractionResult = z.object({
  formattedAddress: z
    .string()
    .nullable()
    .describe('The formatted address in the format "Address (if any), City, State, Country"'),
  language: z
    .string()
    .nullable()
    .describe('The ISO 639-1 alpha-2 language code for the location'),
}).strict();

export type LocationExtractionResult = z.infer<typeof LocationExtractionResult>;

/**
 * System prompt for location extraction
 */
const LOCATION_SYSTEM_PROMPT = `You are an expert at detecting if a user query is related to a location.
If the user is asking for recommendations near a specific location, you should return the formatted location and related language alpha-2 ISO 639-1 in the output.
This formatted address should be in the format of "Address (if any), City, State, Country", it will be used then to do a geocoding request.
Otherwise, return null for both fields.

Examples:
- "volunteer opportunities in Paris" -> formattedAddress: "Paris, France", language: "fr"
- "help elderly in New York City" -> formattedAddress: "New York, NY, USA", language: "en"
- "environmental activities near me" -> formattedAddress: null, language: null (no specific location)
- "tutoring in downtown Seattle" -> formattedAddress: "Seattle, WA, USA", language: "en"
- "animal shelter London" -> formattedAddress: "London, UK", language: "en"
- "I want to help" -> formattedAddress: null, language: null (no location)`;

/**
 * Analyzes a user query to extract location information
 *
 * Uses an LLM to detect if the query contains a location reference
 * and extracts it in a format suitable for geocoding.
 *
 * @param query - The user's search query
 * @returns LocationExtractionResult with formattedAddress and language if detected
 */
export async function analyzeLocationQuery(
  query: string
): Promise<LocationExtractionResult> {
  try {
    const result = await generateObject({
      model: openai('gpt-4o-mini', { structuredOutputs: true }),
      schema: LocationExtractionResult,
      system: LOCATION_SYSTEM_PROMPT,
      prompt: query,
      temperature: 0,
    });

    return result.object;
  } catch (error) {
    // Log error but don't fail the search - just return no location
    console.error('[Location Analyzer] Error extracting location:', error);
    return {
      formattedAddress: null,
      language: null,
    };
  }
}

/**
 * Check if a location extraction result contains valid location data
 */
export function hasValidLocation(result: LocationExtractionResult): boolean {
  return !!(result.formattedAddress && result.language);
}
