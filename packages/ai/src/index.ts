// Embedding generation
export * from './embedding';

// Vector search
export * from './vector-search-service';

// Location-aware search (combines vector search with geolocation)
export * from './location-aware-search';

// Location analysis
export * from './location-analyzer';

// Geocoding
export * from './geocoding';

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
