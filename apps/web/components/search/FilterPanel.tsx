'use client';

import { Filter, MapPin, Loader2, AlertCircle } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { ACTIVITY_CATEGORIES, DISTANCE_OPTIONS } from '@/lib/constants';

export interface SearchFilters {
  categories?: string[];
  distance?: number | undefined;
  timeCommitment?: string | undefined;
}

export interface GeolocationStatus {
  isLoading: boolean;
  hasLocation: boolean;
  error: string | null;
}

export interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onClear?: () => void;
  className?: string;
  geolocationStatus?: GeolocationStatus;
}

export function FilterPanel({
  filters,
  onChange,
  onClear,
  className,
  geolocationStatus,
}: FilterPanelProps) {
  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    const newFilters = { ...filters };
    if (newCategories.length > 0) {
      newFilters.categories = newCategories;
    } else {
      delete newFilters.categories;
    }

    onChange(newFilters);
  };

  const handleDistanceChange = (distance: number) => {
    onChange({
      ...filters,
      distance: filters.distance === distance ? undefined : distance,
    });
  };

  const activeFiltersCount =
    (filters.categories?.length || 0) + (filters.distance ? 1 : 0);

  return (
    <aside className={className}>
      <div className="space-y-6 rounded-2xl border-3 border-black bg-white p-6 shadow-brutal-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b-3 border-black pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg border-2 border-black bg-primary-400 p-2 shadow-brutal-sm">
              <Filter className="h-5 w-5 text-black" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-black">
              Filters
            </h2>
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="primary" className="text-base">
              {activeFiltersCount}
            </Badge>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-black">
            Category
          </h3>
          <div className="space-y-2">
            {Object.entries(ACTIVITY_CATEGORIES).map(([key, { label }]) => (
              <label
                key={key}
                className="group flex cursor-pointer items-center gap-3 rounded-lg border-2 border-transparent p-2 text-sm transition-all hover:border-black hover:bg-primary-50 hover:shadow-brutal-sm"
              >
                <input
                  type="checkbox"
                  checked={filters.categories?.includes(key) || false}
                  onChange={() => handleCategoryToggle(key)}
                  className="h-5 w-5 rounded-md border-3 border-black text-primary-500 transition-all focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                />
                <span className="font-bold text-black transition-colors group-hover:text-primary-600">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Distance */}
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-black">
            Distance
          </h3>

          {/* Geolocation Status */}
          {geolocationStatus && filters.distance && filters.distance > 0 && (
            <div className="rounded-lg border-2 border-black p-2">
              {geolocationStatus.isLoading && (
                <div className="flex items-center gap-2 text-sm text-black/70">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-medium">Getting your location...</span>
                </div>
              )}
              {geolocationStatus.hasLocation && !geolocationStatus.isLoading && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Location detected</span>
                </div>
              )}
              {geolocationStatus.error && (
                <div className="flex items-center gap-2 text-sm text-destructive-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">{geolocationStatus.error}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            {DISTANCE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="group flex cursor-pointer items-center gap-3 rounded-lg border-2 border-transparent p-2 text-sm transition-all hover:border-black hover:bg-secondary-50 hover:shadow-brutal-sm"
              >
                <input
                  type="radio"
                  name="distance"
                  checked={filters.distance === option.value}
                  onChange={() => handleDistanceChange(option.value)}
                  className="h-5 w-5 border-3 border-black text-secondary-400 transition-all focus:ring-2 focus:ring-secondary-400 focus:ring-offset-2"
                />
                <span className="font-bold text-black transition-colors group-hover:text-secondary-600">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Time Commitment */}
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-black">
            Time Commitment
          </h3>
          <div className="rounded-lg border-2 border-black bg-accent-100 p-3 shadow-brutal-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-black/70">
              Time filters coming soon...
            </p>
          </div>
        </div>

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <button
            onClick={() => {
              onChange({});
              onClear?.();
            }}
            className="w-full rounded-lg border-2 border-black bg-destructive-400 px-4 py-3 text-sm font-bold uppercase tracking-wide text-black shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  );
}
