import { openai } from '@ai-sdk/openai';
import { embed, embedMany } from 'ai';

import type { Embedding } from '@action-atlas/types';

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

export function prepareActivityForEmbedding(activity: {
  title: string;
  description: string;
  organization?: { name?: string; mission?: string };
  skills?: Array<{ name: string }>;
  category?: string;
  location?: { address?: { city?: string; country?: string } };
}): string {
  const parts = [
    activity.title,
    activity.description,
    activity.organization?.name,
    activity.organization?.mission,
    activity.skills?.map((s) => s.name).join(', '),
    activity.category,
    activity.location?.address?.city,
    activity.location?.address?.country,
  ].filter(Boolean);

  return parts.join('. ');
}
