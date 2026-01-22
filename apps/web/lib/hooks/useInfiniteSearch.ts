'use client';

import type { SearchResponse } from '@action-atlas/types';
import { useInfiniteQuery } from '@tanstack/react-query';

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

  // Check if we have filters that should trigger a search
  const hasFilters = Boolean((filters.category && filters.category.length > 0) || filters.location);

  // Search is enabled if: (query >= 3 chars) OR (we have filters applied)
  const shouldSearch = enabled && (debouncedQuery.length >= 3 || hasFilters);

  // Use a generic search term when only filters are applied (API requires min 1 char)
  const searchQuery = debouncedQuery.length >= 1 ? debouncedQuery : 'volunteering';

  return useInfiniteQuery<SearchResponse>({
    queryKey: ['search-infinite', debouncedQuery, filters, limit],
    queryFn: ({ pageParam = 0 }) =>
      searchActivities(searchQuery, {
        ...filters,
        limit,
        offset: pageParam as number,
      }),
    enabled: shouldSearch,
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
