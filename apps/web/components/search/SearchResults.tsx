'use client';

import type { SearchResult } from '@action-atlas/types';

import { ActivityCard } from '@/components/activities/ActivityCard';

export interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
  error?: Error | null;
  total?: number;
  query?: string;
  executionTimeMs?: number;
}

export function SearchResults({
  results,
  isLoading = false,
  error = null,
  total = 0,
  query = '',
  executionTimeMs,
}: SearchResultsProps) {
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-6xl">⚠️</div>
        <h2 className="mb-2 text-2xl font-semibold text-error-500">
          Something went wrong
        </h2>
        <p className="text-muted-foreground">
          {error.message || 'Failed to load search results. Please try again.'}
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (results.length === 0 && query) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 text-6xl">🔍</div>
        <h2 className="mb-2 text-2xl font-semibold">No results found</h2>
        <p className="text-muted-foreground">
          Try adjusting your search or filters to find what you&apos;re looking
          for.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results header */}
      {query && (
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              Search results for &quot;{query}&quot;
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Found {total} {total === 1 ? 'activity' : 'activities'}
              {executionTimeMs && (
                <span className="ml-2">({executionTimeMs}ms)</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Results grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {results.map((activity) => (
          <ActivityCard
            key={activity.activityId}
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
    </div>
  );
}
