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
 * Time commitment structure for embedding preparation
 */
interface TimeCommitmentInput {
  hoursPerWeek?: number;
  isFlexible: boolean;
  isOneTime: boolean;
  isRecurring: boolean;
  schedule?: string;
}

/**
 * Activity input for embedding preparation
 */
interface ActivityEmbeddingInput {
  title: string;
  description: string;
  organization?: { name?: string; description?: string; mission?: string };
  skills?: string[];
  category?: string[];
  geolocations?: GeolocationInput[];
  language?: string;
  remote?: boolean;
  minParticipants?: number | null;
  maxParticipants?: number | null;
  timeCommitment?: TimeCommitmentInput;
  complementaryInformation?: string;
}

/**
 * Builds a human-readable description of time commitment for embedding.
 */
function buildTimeCommitmentText(tc: TimeCommitmentInput): string | null {
  const parts: string[] = [];

  if (tc.isOneTime) parts.push('one-time event');
  if (tc.isRecurring) parts.push('recurring commitment');
  if (tc.isFlexible) parts.push('flexible schedule');
  if (tc.hoursPerWeek) parts.push(`${tc.hoursPerWeek} hours per week`);
  if (tc.schedule) parts.push(tc.schedule);

  return parts.length > 0 ? `Time commitment: ${parts.join(', ')}` : null;
}

/**
 * Builds a human-readable description of participant requirements for embedding.
 */
function buildParticipantsText(
  min?: number | null,
  max?: number | null
): string | null {
  if (!min && !max) return null;

  if (min && max) {
    return `Group size: ${min} to ${max} participants`;
  } else if (min) {
    return `Minimum ${min} participants required`;
  } else if (max) {
    return `Maximum ${max} participants`;
  }
  return null;
}

/**
 * Prepares an activity for embedding by constructing a semantically rich text
 * that captures all relevant information for vector search.
 *
 * Fields included in embedding text:
 * - title: Activity name/title
 * - description: Full activity description
 * - category: Array of cause categories (with "Categories:" prefix)
 * - skills: Array of required skills (with "Skills needed:" prefix)
 * - remote: Boolean converted to descriptive text about remote availability
 * - minParticipants/maxParticipants: Group size requirements
 * - timeCommitment: Schedule flexibility and commitment type
 * - complementaryInformation: Additional details
 * - geolocations: All formatted addresses (with "Locations:" prefix)
 * - organization: Name and mission for contextual relevance
 *
 * @param activity - The activity object to prepare for embedding
 * @returns A concatenated string optimized for semantic search
 */
export function prepareActivityForEmbedding(
  activity: ActivityEmbeddingInput
): string {
  const parts: string[] = [];

  // 1. Title (primary identifier)
  if (activity.title) {
    parts.push(activity.title);
  }

  // 2. Description (main content)
  if (activity.description) {
    parts.push(activity.description);
  }

  // 3. Categories (cause areas)
  if (activity.category?.length) {
    parts.push(`Categories: ${activity.category.join(', ')}`);
  }

  // 4. Skills (requirements)
  if (activity.skills?.length) {
    parts.push(`Skills needed: ${activity.skills.join(', ')}`);
  }

  // 5. Remote availability - convert boolean to descriptive text
  if (activity.remote === true) {
    parts.push('This activity can be done remotely');
  } else if (activity.remote === false) {
    parts.push('This activity requires in-person participation');
  }

  // 6. Participants context
  const participantsText = buildParticipantsText(
    activity.minParticipants,
    activity.maxParticipants
  );
  if (participantsText) {
    parts.push(participantsText);
  }

  // 7. Time commitment (textual description)
  if (activity.timeCommitment) {
    const timeText = buildTimeCommitmentText(activity.timeCommitment);
    if (timeText) {
      parts.push(timeText);
    }
  }

  // 8. Complementary information
  if (activity.complementaryInformation) {
    parts.push(activity.complementaryInformation);
  }

  // 9. Locations (all formatted addresses)
  const preferredLanguage = activity.language || 'en';
  const locationValues = extractGeolocationsEmbeddableValues(
    activity.geolocations,
    preferredLanguage
  );
  if (locationValues.length > 0) {
    parts.push(`Locations: ${locationValues.join('; ')}`);
  }

  // 10. Organization context
  if (activity.organization?.name) {
    parts.push(`Organization: ${activity.organization.name}`);
  }
  if (activity.organization?.description) {
    parts.push(`Organization description: ${activity.organization.description}`);
  }
  if (activity.organization?.mission) {
    parts.push(`Organization mission: ${activity.organization.mission}`);
  }

  return parts.filter(Boolean).join('. \n');
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
