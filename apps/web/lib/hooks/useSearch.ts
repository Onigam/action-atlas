'use client';

import { useQuery } from '@tanstack/react-query';
import type { SearchResponse } from '@action-atlas/types';

import { searchActivities, type SearchFilters } from '@/lib/api-client';

import { useDebounce } from './useDebounce';

export interface UseSearchOptions extends SearchFilters {
  query: string;
  enabled?: boolean;
}

/**
 * Custom hook for semantic search with debouncing
 * Automatically debounces queries and manages search state
 */
export function useSearch({ query, enabled = true, ...filters }: UseSearchOptions) {
  // Debounce query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 300);

  return useQuery<SearchResponse>({
    queryKey: ['search', debouncedQuery, filters],
    queryFn: () => searchActivities(debouncedQuery, filters),
    enabled: enabled && debouncedQuery.length >= 3, // Only search if query is 3+ chars
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
