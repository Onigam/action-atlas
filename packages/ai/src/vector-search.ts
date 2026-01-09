import type { Embedding } from '@action-atlas/types';

export interface VectorSearchOptions {
  queryVector: Embedding;
  limit?: number;
  numCandidates?: number;
  filter?: Record<string, unknown>;
}

export interface VectorSearchResult<T> {
  document: T;
  score: number;
}

export function calculateCosineSimilarity(
  vectorA: Embedding,
  vectorB: Embedding
): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    const a = vectorA[i];
    const b = vectorB[i];
    if (a === undefined || b === undefined) {
      throw new Error('Vector contains undefined values');
    }
    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}

export function combineScores(
  semanticScore: number,
  proximityScore: number,
  semanticWeight: number = 0.7
): number {
  const proximityWeight = 1 - semanticWeight;
  return semanticScore * semanticWeight + proximityScore * proximityWeight;
}
