import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';

import {
  type Embedding,
  Activity,
  Organization,
  getEmbeddableFields,
  extractEmbeddableValues,
  extractGeolocationsEmbeddableValues,
} from '@action-atlas/types';

const EMBEDDING_MODEL = 'text-embedding-3-small';

/**
 * Validate OpenAI API key is set
 */
function validateApiKey(): void {
  const apiKey = process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is not set. Please set it to use embedding generation.'
    );
  }
}

export interface EmbeddingResult {
  embedding: Embedding;
  tokensUsed: number;
}

export interface BatchEmbeddingResult {
  embeddings: Embedding[];
  totalTokensUsed: number;
}

export async function generateEmbedding(
  text: string
): Promise<EmbeddingResult> {
  validateApiKey();

  const normalizedText = normalizeText(text);

  const result = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: normalizedText,
  });

  return {
    embedding: result.embedding as Embedding,
    tokensUsed: result.usage?.tokens ?? 0,
  };
}

export async function generateEmbeddings(
  texts: string[]
): Promise<BatchEmbeddingResult> {
  validateApiKey();

  const normalizedTexts = texts.map(normalizeText);

  const result = await embedMany({
    model: openai.embedding(EMBEDDING_MODEL),
    values: normalizedTexts,
  });

  return {
    embeddings: result.embeddings as Embedding[],
    totalTokensUsed: result.usage?.tokens ?? 0,
  };
}

export function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Geolocation structure from MongoDB
 */
interface GeolocationInput {
  formattedAddress?: Array<{
    formattedAddress: string;
    language: string;
  }>;
}

/**
 * Prepares an activity for embedding using schema-defined embeddable fields.
 * Uses the Activity schema to automatically detect which fields should be embedded.
 *
 * Embeddable fields extracted:
 * - title: Activity title
 * - description: Full description text
 * - category: Array of cause categories (joined with comma)
 * - skills: Array of skill strings (joined with comma)
 * - geolocations: Formatted addresses (extracted from nested structure)
 *
 * Also includes organization info if provided (for contextual relevance).
 *
 * @param activity - The activity object to prepare for embedding
 * @returns A concatenated string of all embeddable field values
 */
export function prepareActivityForEmbedding(activity: {
  title: string;
  description: string;
  organization?: { name?: string; mission?: string };
  skills?: string[];
  category?: string[];
  geolocations?: GeolocationInput[];
  language?: string;
}): string {
  // Extract embeddable fields from the Activity schema
  const embeddableValues = extractEmbeddableValues(
    Activity,
    activity as Record<string, unknown>
  );

  // Add organization context (not part of Activity schema but useful for search)
  if (activity.organization?.name) {
    embeddableValues.push(activity.organization.name);
  }
  if (activity.organization?.mission) {
    embeddableValues.push(activity.organization.mission);
  }

  // Add geolocations context (formatted addresses for location-based semantic search)
  // Use activity's language as preferred, fallback to 'en'
  const preferredLanguage = activity.language || 'en';
  const locationValues = extractGeolocationsEmbeddableValues(
    activity.geolocations,
    preferredLanguage
  );
  embeddableValues.push(...locationValues);

  return embeddableValues.filter(Boolean).join('. ');
}

/**
 * Prepares an organization for embedding using schema-defined embeddable fields.
 * Uses the Organization schema to automatically detect which fields should be embedded.
 *
 * @param organization - The organization object to prepare for embedding
 * @returns A concatenated string of all embeddable field values
 */
export function prepareOrganizationForEmbedding(organization: {
  name: string;
  description: string;
  mission?: string;
  geolocations?: GeolocationInput[];
}): string {
  // Extract embeddable fields from the Organization schema
  const embeddableValues = extractEmbeddableValues(
    Organization,
    organization as Record<string, unknown>
  );

  // Add geolocations context (formatted addresses for location-based semantic search)
  const locationValues = extractGeolocationsEmbeddableValues(
    organization.geolocations,
    'en'
  );
  embeddableValues.push(...locationValues);

  return embeddableValues.filter(Boolean).join('. ');
}

/**
 * Gets the list of embeddable field names from the Activity schema.
 * Useful for documentation or debugging.
 *
 * @returns Array of field names marked as embeddable in the Activity schema
 */
export function getActivityEmbeddableFields(): string[] {
  return getEmbeddableFields(Activity);
}

/**
 * Gets the list of embeddable field names from the Organization schema.
 * Useful for documentation or debugging.
 *
 * @returns Array of field names marked as embeddable in the Organization schema
 */
export function getOrganizationEmbeddableFields(): string[] {
  return getEmbeddableFields(Organization);
}
