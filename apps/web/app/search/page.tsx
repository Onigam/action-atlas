'use client';

import { useQueryState, parseAsString } from 'nuqs';
import * as React from 'react';
import { Suspense } from 'react';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { FilterPanel, type SearchFilters } from '@/components/search/FilterPanel';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { useSearch } from '@/lib/hooks';

function SearchContent() {
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''));
  const [filters, setFilters] = React.useState<SearchFilters>({});

  // Use the search hook with debouncing and real API
  const { data, isLoading, error } = useSearch({
    query,
    ...(filters.categories?.[0] && { category: filters.categories[0] }),
    enabled: query.length >= 3,
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="border-b bg-muted/30 py-8">
        <div className="container-custom">
          <SearchBar
            value={query}
            onChange={(value) => void setQuery(value)}
            placeholder="Search for volunteering activities..."
            autoFocus={!query}
          />
        </div>
      </div>

      {/* Search Content */}
      <div className="container-custom py-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filters Sidebar */}
          <FilterPanel
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters({})}
            className="hidden lg:block lg:sticky lg:top-8 lg:h-fit"
          />

          {/* Results */}
          <div>
            <SearchResults
              results={data?.results || []}
              total={data?.total || 0}
              query={query}
              isLoading={isLoading}
              error={error}
              {...(data?.executionTimeMs !== undefined && {
                executionTimeMs: data.executionTimeMs,
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
