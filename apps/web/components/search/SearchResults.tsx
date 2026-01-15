'use client';

import type { SearchResult } from '@action-atlas/types';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { ActivityCard } from '@/components/activities/ActivityCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
  error?: Error | null;
  total?: number;
  query?: string;
  executionTimeMs?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

export function SearchResults({
  results,
  isLoading = false,
  error = null,
  total = 0,
  query = '',
  executionTimeMs,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
}: SearchResultsProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection observer for auto-loading more results
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && fetchNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
          <div className="mb-4 text-7xl">⚠️</div>
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
            Oops! Something Broke
          </h2>
          <p className="text-base font-medium text-gray-700">
            {error.message || 'Failed to load search results. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200 shadow-sm" />
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl bg-gray-100 shadow-sm"
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (results.length === 0 && query) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 shadow-sm">
          <div className="mb-6 text-8xl">🔍</div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">
            No Results Found
          </h2>
          <p className="text-lg font-medium text-gray-600">
            Try adjusting your search or filters to find what you&apos;re looking for.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="text-sm">
              Try broader terms
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Check filters
            </Badge>
            <Badge variant="primary" className="text-sm">
              Explore categories
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results header */}
      {query && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Search results for &quot;{query}&quot;
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="primary" className="text-xs">
                  {total} {total === 1 ? 'activity' : 'activities'}
                </Badge>
                {executionTimeMs && (
                  <Badge variant="secondary" className="text-xs">
                    {executionTimeMs}ms
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {results.map((activity) => (
          <ActivityCard
            key={activity.activityId || (activity as any)._id}
            activity={activity}
            {...(activity.relevanceScore !== undefined && {
              relevanceScore: activity.relevanceScore,
            })}
            {...(activity.distance !== undefined && {
              distance: activity.distance,
            })}
          />
        ))}
      </div>

      {/* Load More Trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="mt-8 flex justify-center">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-6 py-4 shadow-sm">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
              <span className="font-medium text-gray-700">
                Loading more results...
              </span>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={fetchNextPage}
              className="w-full sm:w-auto"
            >
              Load More Results
            </Button>
          )}
        </div>
      )}

      {/* End of results message */}
      {!hasNextPage && results.length > 0 && (
        <div className="mt-8 text-center">
          <div className="inline-block rounded-lg border border-gray-200 bg-gray-50 px-6 py-3 shadow-sm">
            <span className="text-sm font-medium text-gray-600">
              You&apos;ve reached the end of the results
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
