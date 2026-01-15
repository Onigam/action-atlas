'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import type { SearchResponse } from '@action-atlas/types';

import { searchActivities, type SearchFilters } from '@/lib/api-client';

import { useDebounce } from './useDebounce';

export interface UseInfiniteSearchOptions extends SearchFilters {
  query: string;
  enabled?: boolean;
  limit?: number;
}

/**
 * Custom hook for infinite semantic search with debouncing
 * Automatically debounces queries and manages infinite scroll state
 */
export function useInfiniteSearch({
  query,
  enabled = true,
  limit = 20,
  ...filters
}: UseInfiniteSearchOptions) {
  // Debounce query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 300);

  return useInfiniteQuery<SearchResponse>({
    queryKey: ['search-infinite', debouncedQuery, filters, limit],
    queryFn: ({ pageParam = 0 }) =>
      searchActivities(debouncedQuery, {
        ...filters,
        limit,
        offset: pageParam as number,
      }),
    enabled: enabled && debouncedQuery.length >= 3, // Only search if query is 3+ chars
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (sum, page) => sum + page.results.length,
        0
      );
      // Return next offset if there are more results
      return loadedCount < lastPage.total ? loadedCount : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
