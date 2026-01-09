// Embedding generation
export * from './embedding';

// Vector search
export * from './vector-search-service';

// Caching
export * from './cache';

// Utilities
export {
  cosineSimilarity,
  normalizeVector,
  validateEmbedding,
  isZeroVector,
  euclideanDistance,
  dotProduct,
  vectorMagnitude,
  combineScores,
  calculateProximityScore,
} from './utils';
