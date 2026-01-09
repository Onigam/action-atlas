import type { Embedding } from '@action-atlas/types';
import { EMBEDDING_DIMENSIONS } from '@action-atlas/types';

/**
 * Calculate cosine similarity between two vectors
 * Returns a value between -1 and 1, where 1 means identical, 0 means orthogonal, -1 means opposite
 */
export function cosineSimilarity(vectorA: Embedding, vectorB: Embedding): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error(
      `Vectors must have the same length. Got ${vectorA.length} and ${vectorB.length}`
    );
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    const a = vectorA[i];
    const b = vectorB[i];

    if (a === undefined || b === undefined) {
      throw new Error(`Vector contains undefined values at index ${i}`);
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

/**
 * Normalize a vector to unit length
 */
export function normalizeVector(vector: number[]): number[] {
  let magnitude = 0;

  for (const value of vector) {
    magnitude += value * value;
  }

  magnitude = Math.sqrt(magnitude);

  if (magnitude === 0) {
    return vector.map(() => 0);
  }

  return vector.map((value) => value / magnitude);
}

/**
 * Validate that an embedding has the correct dimensions and valid values
 */
export function validateEmbedding(
  embedding: number[]
): embedding is Embedding {
  if (!Array.isArray(embedding)) {
    return false;
  }

  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    return false;
  }

  for (const value of embedding) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if an embedding is a zero vector (all zeros)
 */
export function isZeroVector(embedding: number[]): boolean {
  return embedding.every((value) => value === 0);
}

/**
 * Calculate Euclidean distance between two vectors
 */
export function euclideanDistance(
  vectorA: number[],
  vectorB: number[]
): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error(
      `Vectors must have the same length. Got ${vectorA.length} and ${vectorB.length}`
    );
  }

  let sum = 0;

  for (let i = 0; i < vectorA.length; i++) {
    const a = vectorA[i];
    const b = vectorB[i];

    if (a === undefined || b === undefined) {
      throw new Error(`Vector contains undefined values at index ${i}`);
    }

    const diff = a - b;
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Calculate dot product of two vectors
 */
export function dotProduct(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error(
      `Vectors must have the same length. Got ${vectorA.length} and ${vectorB.length}`
    );
  }

  let result = 0;

  for (let i = 0; i < vectorA.length; i++) {
    const a = vectorA[i];
    const b = vectorB[i];

    if (a === undefined || b === undefined) {
      throw new Error(`Vector contains undefined values at index ${i}`);
    }

    result += a * b;
  }

  return result;
}

/**
 * Calculate the magnitude (L2 norm) of a vector
 */
export function vectorMagnitude(vector: number[]): number {
  let sum = 0;

  for (const value of vector) {
    sum += value * value;
  }

  return Math.sqrt(sum);
}

/**
 * Combine semantic and proximity scores with configurable weights
 */
export function combineScores(
  semanticScore: number,
  proximityScore: number,
  semanticWeight: number = 0.7
): number {
  if (semanticWeight < 0 || semanticWeight > 1) {
    throw new Error('Semantic weight must be between 0 and 1');
  }

  const proximityWeight = 1 - semanticWeight;
  return semanticScore * semanticWeight + proximityScore * proximityWeight;
}

/**
 * Calculate proximity score based on distance
 * Returns a value between 0 and 1, where 1 means very close, 0 means at or beyond max distance
 */
export function calculateProximityScore(
  distance: number,
  maxDistance: number
): number {
  if (distance < 0) {
    throw new Error('Distance cannot be negative');
  }

  if (maxDistance <= 0) {
    throw new Error('Max distance must be positive');
  }

  if (distance >= maxDistance) {
    return 0;
  }

  return 1 - distance / maxDistance;
}
