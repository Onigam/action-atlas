'use client';

import { useQueryState, parseAsString, parseAsArrayOf } from 'nuqs';

/**
 * Custom hook for managing search filters in URL state
 * Uses nuqs for URL synchronization - filters persist across page refreshes
 */
export function useFilters() {
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''));
  const [category, setCategory] = useQueryState(
    'category',
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [location, setLocation] = useQueryState(
    'location',
    parseAsString.withDefault('')
  );
  const [radius, setRadius] = useQueryState('radius', parseAsString.withDefault(''));

  const clearFilters = () => {
    void setCategory([]);
    void setLocation('');
    void setRadius('');
  };

  const activeFilterCount =
    category.length +
    (location ? 1 : 0) +
    (radius ? 1 : 0);

  return {
    query,
    setQuery,
    category,
    setCategory,
    location,
    setLocation,
    radius,
    setRadius,
    clearFilters,
    activeFilterCount,
  };
}
