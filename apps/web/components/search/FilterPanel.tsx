'use client';

import { Filter } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { ACTIVITY_CATEGORIES, DISTANCE_OPTIONS } from '@/lib/constants';

export interface SearchFilters {
  categories?: string[];
  distance?: number | undefined;
  timeCommitment?: string | undefined;
}

export interface FilterPanelProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onClear?: () => void;
  className?: string;
}

export function FilterPanel({
  filters,
  onChange,
  onClear,
  className,
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </div>

        {/* Categories */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Category
          </h3>
          <div className="space-y-2">
            {Object.entries(ACTIVITY_CATEGORIES).map(([key, { label }]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={filters.categories?.includes(key) || false}
                  onChange={() => handleCategoryToggle(key)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <span className="text-muted-foreground hover:text-foreground">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Distance */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Distance
          </h3>
          <div className="space-y-2">
            {DISTANCE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name="distance"
                  checked={filters.distance === option.value}
                  onChange={() => handleDistanceChange(option.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                />
                <span className="text-muted-foreground hover:text-foreground">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Time Commitment */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Time Commitment
          </h3>
          <p className="text-sm text-muted-foreground">
            Time filters coming soon...
          </p>
        </div>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={() => {
              onChange({});
              onClear?.();
            }}
            className="w-full text-sm text-primary hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  );
}
