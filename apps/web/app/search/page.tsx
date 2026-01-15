'use client';

import { useQueryState, parseAsString, parseAsInteger, parseAsArrayOf } from 'nuqs';
import * as React from 'react';
import { Suspense } from 'react';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { FilterPanel, type SearchFilters } from '@/components/search/FilterPanel';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { useInfiniteSearch, useGeolocation } from '@/lib/hooks';

function SearchContent() {
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''));
  // URL-synced filter parameters
  const [urlCategories, setUrlCategories] = useQueryState(
    'categories',
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [urlDistance, setUrlDistance] = useQueryState('distance', parseAsInteger);

  const geolocation = useGeolocation();

  // Build filters object from URL params
  const filters = React.useMemo<SearchFilters>(() => {
    const f: SearchFilters = {};
    if (urlCategories.length > 0) {
      f.categories = urlCategories;
    }
    if (urlDistance !== null) {
      f.distance = urlDistance;
    }
    return f;
  }, [urlCategories, urlDistance]);

  // Request location when user selects a distance filter (not "Any distance")
  React.useEffect(() => {
    if (
      filters.distance &&
      filters.distance > 0 &&
      !geolocation.hasLocation &&
      !geolocation.isLoading &&
      !geolocation.error
    ) {
      geolocation.requestLocation();
    }
  }, [filters.distance, geolocation]);

  // Build location object for search when we have both distance filter and coordinates
  const locationFilter = React.useMemo(() => {
    if (
      filters.distance &&
      filters.distance > 0 &&
      geolocation.latitude !== null &&
      geolocation.longitude !== null
    ) {
      return {
        lat: geolocation.latitude,
        lng: geolocation.longitude,
        maxDistance: filters.distance * 1000, // Convert km to meters
      };
    }
    return undefined;
  }, [filters.distance, geolocation.latitude, geolocation.longitude]);

  // Handle filter changes - update URL params immediately
  const handleFilterChange = React.useCallback(
    (newFilters: SearchFilters) => {
      void setUrlCategories(newFilters.categories?.length ? newFilters.categories : []);
      void setUrlDistance(newFilters.distance ?? null);
    },
    [setUrlCategories, setUrlDistance]
  );

  // Handle clearing filters
  const handleClearFilters = React.useCallback(() => {
    void setUrlCategories([]);
    void setUrlDistance(null);
    geolocation.clearLocation();
  }, [geolocation, setUrlCategories, setUrlDistance]);

  // Use infinite search hook for pagination
  // The hook will trigger search if: query >= 3 chars OR filters are applied
  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteSearch({
      query,
      ...(filters.categories?.[0] && { category: filters.categories[0] }),
      ...(locationFilter && { location: locationFilter }),
      limit: 20, // Load 20 results per page
    });

  // Flatten paginated results
  const allResults = React.useMemo(
    () => data?.pages.flatMap((page) => page.results) || [],
    [data]
  );

  // Get total and execution time from first page
  const total = data?.pages[0]?.total || 0;
  const executionTimeMs = data?.pages[0]?.executionTimeMs;

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      {/* Search Header - Rounded Hero Section */}
      <div className="border-b-4 border-black bg-gradient-to-r from-primary-500 via-secondary-400 to-accent-500 py-12 shadow-brutal-lg">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl space-y-4">
            <h1 className="text-center text-4xl font-black uppercase tracking-tight text-black md:text-5xl">
              Find Your Impact
            </h1>
            <p className="text-center text-lg font-bold text-black/80">
              Discover volunteering opportunities that match your passion
            </p>
            <SearchBar
              value={query}
              onChange={(value) => void setQuery(value)}
              placeholder="Search for volunteering activities..."
              autoFocus={!query}
            />
          </div>
        </div>
      </div>

      {/* Search Content */}
      <div className="container-custom py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
          {/* Filters Sidebar */}
          <FilterPanel
            filters={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
            className="hidden lg:block lg:sticky lg:top-8 lg:h-fit"
            geolocationStatus={{
              isLoading: geolocation.isLoading,
              hasLocation: geolocation.hasLocation,
              error: geolocation.error,
            }}
          />

          {/* Results */}
          <div className="min-w-0">
            <SearchResults
              results={allResults}
              total={total}
              query={query}
              isLoading={isLoading}
              error={error}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage as () => Promise<unknown>}
              {...(executionTimeMs !== undefined && {
                executionTimeMs,
              })}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <SearchContent />
      </Suspense>
      <Footer />
    </>
  );
}
