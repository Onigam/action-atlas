import { z } from 'zod';

import { Activity } from '../domain/activity';

export const SearchQuery = z.object({
  query: z.string().min(1).max(500),
  category: z.array(z.string()).optional(),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      radius: z.number().positive().max(500000).optional(), // in meters, max 500km
    })
    .optional(),
  limit: z.number().positive().max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Type inference from Zod makes limit/offset optional even with default()
// Override the type to make them required since they always have values after parsing
export type SearchQuery = z.infer<typeof SearchQuery> & {
  limit: number;
  offset: number;
};

export const SearchResult = Activity.extend({
  relevanceScore: z.number().min(0).max(1).optional(),
  distance: z.number().optional(), // in meters
  // Seed data compatibility fields
  cuid: z.string().optional(),
  coverImageUrl: z.string().optional(),
  charity: z.string().optional(),
  _id: z.string().optional(),
});

export type SearchResult = z.infer<typeof SearchResult>;

export const SearchResponse = z.object({
  results: z.array(SearchResult),
  total: z.number(),
  executionTimeMs: z.number(),
  metadata: z.object({
    cached: z.boolean(),
    vectorSearchMs: z.number().optional(),
    embeddingMs: z.number().optional(),
    postProcessingMs: z.number().optional(),
    locationAnalysisMs: z.number().optional(),
    geocodingMs: z.number().optional(),
    geoNearMs: z.number().optional(),
    detectedLocation: z.object({
      formattedAddress: z.string(),
      coordinates: z.tuple([z.number(), z.number()]),
    }).optional(),
  }),
});

export type SearchResponse = z.infer<typeof SearchResponse>;
