'use client';

import type { SearchResult } from '@action-atlas/types';
import { Loader2, SearchX, RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { ActivityCard } from '@/components/activities/ActivityCard';
import { CATEGORY_PRESETS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
  error?: Error | null;
  total?: number;
  query?: string;
  executionTimeMs?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => Promise<unknown> | void;
  onRetry?: () => void;
  onCategoryClick?: (categories: string[]) => void;
}

// Skeleton card component matching ActivityCard layout
function SkeletonCard() {
  return (
    <div className="h-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      {/* Cover image skeleton */}
      <div className="h-48 w-full animate-pulse bg-zinc-200" />

      {/* Header */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-6 w-3/4 animate-pulse rounded bg-zinc-200" />
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-3">
        {/* Categories */}
        <div className="flex gap-1">
          <div className="h-6 w-16 animate-pulse rounded bg-zinc-200" />
          <div className="h-6 w-20 animate-pulse rounded bg-zinc-200" />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
        </div>

        {/* Time */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-pulse rounded bg-zinc-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
        </div>
      </div>
    </div>
  );
}

// Category chip for empty state suggestions
function CategoryChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-100 text-zinc-600 border border-zinc-200 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700 transition-all duration-200"
    >
      {label}
    </button>
  );
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
  onRetry,
  onCategoryClick,
}: SearchResultsProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection observer for auto-loading more results
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && fetchNextPage && typeof fetchNextPage === 'function') {
          void (fetchNextPage() as Promise<unknown>).catch((error) => {
            console.error('Error fetching next page:', error);
          });
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
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <SearchX className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mb-3 text-xl font-semibold text-zinc-900">
            Une erreur est survenue
          </h2>
          <p className="mb-6 text-zinc-500">
            {error.message || 'Impossible de charger les resultats. Veuillez reessayer.'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-lg border border-teal-500 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition-all duration-200 hover:bg-teal-100"
              aria-label="Reessayer la recherche"
            >
              <RefreshCw className="h-4 w-4" />
              Reessayer
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading state with skeleton cards
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Results header skeleton */}
        <div className="h-5 w-32 animate-pulse rounded bg-zinc-200" />

        {/* Skeleton grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (results.length === 0 && query) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="max-w-lg rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
            <SearchX className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="mb-3 text-xl font-semibold text-zinc-900">
            Aucun resultat trouve
          </h2>
          <p className="mb-6 text-zinc-500">
            Nous n&apos;avons pas trouve d&apos;activites correspondant a votre recherche.
          </p>

          {/* Suggestions */}
          <div className="mb-6 rounded-lg bg-zinc-50 p-4 text-left">
            <p className="mb-2 text-sm font-medium text-zinc-700">Suggestions :</p>
            <ul className="space-y-1 text-sm text-zinc-500">
              <li>- Essayez des termes de recherche differents</li>
              <li>- Elargissez la zone geographique</li>
              <li>- Reduisez le nombre de filtres actifs</li>
            </ul>
          </div>

          {/* Category quick links */}
          {onCategoryClick && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-700">Explorer par categorie :</p>
              <div className="flex flex-wrap justify-center gap-2">
                {Object.entries(CATEGORY_PRESETS).map(([key, { label, categories }]) => (
                  <CategoryChip
                    key={key}
                    label={label}
                    onClick={() => onCategoryClick(categories)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Empty state without query (initial state)
  if (results.length === 0 && !query) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="max-w-lg rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
            <Sparkles className="h-8 w-8 text-teal-500" />
          </div>
          <h2 className="mb-3 text-xl font-semibold text-zinc-900">
            Trouvez votre prochaine mission
          </h2>
          <p className="text-zinc-500">
            Utilisez la barre de recherche ou les filtres pour decouvrir des opportunites de benevolat pres de chez vous.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {total} {total === 1 ? 'resultat trouve' : 'resultats trouves'}
          {query && <span className="ml-1">pour &quot;{query}&quot;</span>}
        </p>
        {/* Show execution time only in development */}
        {process.env.NODE_ENV === 'development' && executionTimeMs && (
          <span className="text-xs text-zinc-400">{executionTimeMs}ms</span>
        )}
      </div>

      {/* Results grid with fade-in animation */}
      <div className="grid gap-6 md:grid-cols-2">
        {results.map((activity, index) => (
          <div
            key={activity.activityId || activity._id}
            className={cn(
              'animate-in fade-in duration-300',
              // Stagger animation based on index
              index < 4 && `delay-${index * 75}`
            )}
            style={{
              animationDelay: index < 8 ? `${index * 50}ms` : '0ms',
              animationFillMode: 'both',
            }}
          >
            <ActivityCard
              activity={activity}
              {...(activity.relevanceScore !== undefined && {
                relevanceScore: activity.relevanceScore,
              })}
              {...(activity.distance !== undefined && {
                distance: activity.distance,
              })}
            />
          </div>
        ))}
      </div>

      {/* Load More Trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="mt-8 flex justify-center">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
              <span>Chargement...</span>
            </div>
          ) : (
            <button
              onClick={fetchNextPage}
              className="rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50"
              aria-label="Charger plus de resultats"
            >
              Voir plus de resultats
            </button>
          )}
        </div>
      )}

      {/* End of results message */}
      {!hasNextPage && results.length > 0 && (
        <div className="mt-8 text-center">
          <span className="text-sm text-zinc-400">
            Fin des resultats
          </span>
        </div>
      )}
    </div>
  );
}
