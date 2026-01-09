import { z } from 'zod';

export const EmbeddingModel = z.literal('text-embedding-3-small');

export type EmbeddingModel = z.infer<typeof EmbeddingModel>;

export const EMBEDDING_DIMENSIONS = 1536;

export const Embedding = z.array(z.number()).length(EMBEDDING_DIMENSIONS);

export type Embedding = z.infer<typeof Embedding>;

export const EmbeddingRequest = z.object({
  text: z.string().min(1).max(8191), // OpenAI text-embedding-3-small token limit
  model: EmbeddingModel.default('text-embedding-3-small'),
});

export type EmbeddingRequest = z.infer<typeof EmbeddingRequest>;

export const EmbeddingResponse = z.object({
  embedding: Embedding,
  model: EmbeddingModel,
  tokensUsed: z.number(),
});

export type EmbeddingResponse = z.infer<typeof EmbeddingResponse>;

export const BatchEmbeddingRequest = z.object({
  texts: z.array(z.string().min(1).max(8191)),
  model: EmbeddingModel.default('text-embedding-3-small'),
});

export type BatchEmbeddingRequest = z.infer<typeof BatchEmbeddingRequest>;

export const BatchEmbeddingResponse = z.object({
  embeddings: z.array(Embedding),
  model: EmbeddingModel,
  totalTokensUsed: z.number(),
});

export type BatchEmbeddingResponse = z.infer<typeof BatchEmbeddingResponse>;
