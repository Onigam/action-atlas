import type { Embedding } from '@action-atlas/types';

export interface CacheOptions {
  ttl?: number; // in seconds
}

export interface EmbeddingCache {
  get(key: string): Promise<Embedding | null>;
  set(key: string, embedding: Embedding, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class InMemoryEmbeddingCache implements EmbeddingCache {
  private cache: Map<
    string,
    { embedding: Embedding; expiresAt: number | null }
  > = new Map();

  async get(key: string): Promise<Embedding | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.embedding;
  }

  async set(
    key: string,
    embedding: Embedding,
    options?: CacheOptions
  ): Promise<void> {
    const expiresAt = options?.ttl
      ? Date.now() + options.ttl * 1000
      : null;

    this.cache.set(key, { embedding, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

export function createCacheKey(text: string): string {
  // Simple hash function for cache keys
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `embedding:${hash.toString(36)}`;
}
