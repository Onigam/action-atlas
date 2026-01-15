'use client';

import { useQueryState, parseAsString } from 'nuqs';
import * as React from 'react';
import { Suspense } from 'react';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { FilterPanel, type SearchFilters } from '@/components/search/FilterPanel';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { useInfiniteSearch } from '@/lib/hooks';

function SearchContent() {
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''));
  const [filters, setFilters] = React.useState<SearchFilters>({});

  // Use infinite search hook for pagination
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteSearch({
    query,
    ...(filters.categories?.[0] && { category: filters.categories[0] }),
    enabled: query.length >= 3,
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
            onChange={setFilters}
            onClear={() => setFilters({})}
            className="hidden lg:block lg:sticky lg:top-8 lg:h-fit"
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
