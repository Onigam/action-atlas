'use client';

import {
  Filter,
  MapPin,
  Loader2,
  AlertCircle,
  ChevronDown,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import {
  ACTIVITY_CATEGORIES,
  CATEGORY_PRESETS,
  DISTANCE_OPTIONS,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

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

// Mobile Filter Chip component
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
        active
          ? 'bg-teal-50 text-teal-700 border border-teal-500'
          : 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:border-zinc-300'
      )}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

// Mobile Filter Sheet component
function MobileFilterSheet({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Prevent body scroll when sheet is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
          <h2 className="text-lg font-semibold text-zinc-900">Filtres</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            aria-label="Fermer les filtres"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function FilterPanel({
  filters,
  onChange,
  onClear,
  className,
  geolocationStatus,
}: FilterPanelProps) {
  const [isCustomExpanded, setIsCustomExpanded] = React.useState(false);
  const [activePreset, setActivePreset] = React.useState<string | null>(null);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);

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

    // Clear active preset when manually toggling categories
    setActivePreset(null);
    onChange(newFilters);
  };

  const handlePresetToggle = (presetKey: string) => {
    const preset = CATEGORY_PRESETS[presetKey];
    if (!preset) return;

    if (activePreset === presetKey) {
      // Deselect preset - clear categories
      setActivePreset(null);
      const newFilters = { ...filters };
      delete newFilters.categories;
      onChange(newFilters);
    } else {
      // Select preset - set its categories
      setActivePreset(presetKey);
      onChange({ ...filters, categories: [...preset.categories] });
    }
  };

  const handleDistanceChange = (distance: number) => {
    onChange({
      ...filters,
      distance: filters.distance === distance ? undefined : distance,
    });
  };

  const activeFiltersCount =
    (filters.categories?.length || 0) + (filters.distance ? 1 : 0);

  // Filter content component (used in both desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-700">Categorie</h3>

        {/* Preset Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(CATEGORY_PRESETS).map(
            ([key, { label, description }]) => (
              <button
                key={key}
                onClick={() => handlePresetToggle(key)}
                title={description}
                className={cn(
                  'rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all duration-200',
                  activePreset === key
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-teal-500 hover:bg-teal-50'
                )}
              >
                {label}
              </button>
            )
          )}
        </div>

        {/* Custom Toggle */}
        <button
          onClick={() => setIsCustomExpanded(!isCustomExpanded)}
          className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50"
        >
          <span className="flex items-center gap-2">
            Personnaliser
            {filters.categories && !activePreset && (
              <Badge variant="ghost" className="text-xs border-0 shadow-none bg-teal-100 text-teal-700">
                {filters.categories.length}
              </Badge>
            )}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-zinc-500 transition-transform duration-200',
              isCustomExpanded && 'rotate-180'
            )}
          />
        </button>

        {/* Custom Categories List */}
        {isCustomExpanded && (
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-2">
            {Object.entries(ACTIVITY_CATEGORIES).map(([key, { label }]) => (
              <label
                key={key}
                className="group flex cursor-pointer items-center gap-2 rounded p-1.5 text-sm transition-all duration-150 hover:bg-zinc-50"
              >
                <input
                  type="checkbox"
                  checked={filters.categories?.includes(key) || false}
                  onChange={() => handleCategoryToggle(key)}
                  className="h-4 w-4 rounded border-zinc-300 text-teal-600 transition-all focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
                />
                <span className="text-zinc-600 transition-colors group-hover:text-zinc-900">
                  {label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Distance */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-700">Distance</h3>

        {/* Geolocation Status */}
        {geolocationStatus && filters.distance && filters.distance > 0 && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2">
            {geolocationStatus.isLoading && (
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                <span>Detection de votre position...</span>
              </div>
            )}
            {geolocationStatus.hasLocation && !geolocationStatus.isLoading && (
              <div className="flex items-center gap-2 text-sm text-teal-700">
                <MapPin className="h-4 w-4" />
                <span>Position detectee</span>
              </div>
            )}
            {geolocationStatus.error && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{geolocationStatus.error}</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-1">
          {DISTANCE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="group flex cursor-pointer items-center gap-3 rounded p-2 text-sm transition-all duration-150 hover:bg-zinc-50"
            >
              <input
                type="radio"
                name="distance"
                checked={filters.distance === option.value}
                onChange={() => handleDistanceChange(option.value)}
                className="h-4 w-4 border-zinc-300 text-teal-600 transition-all focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
              />
              <span className="text-zinc-600 transition-colors group-hover:text-zinc-900">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Time Commitment */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-zinc-700">Engagement</h3>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs text-zinc-500">
            Filtres de temps a venir...
          </p>
        </div>
      </div>

      {/* Clear Filters Button */}
      {activeFiltersCount > 0 && (
        <button
          onClick={() => {
            onChange({});
            setActivePreset(null);
            onClear?.();
          }}
          className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors duration-200"
          aria-label="Effacer tous les filtres"
        >
          Effacer tous les filtres
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Chips - visible on screens smaller than lg */}
      <div className="lg:hidden mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* Filter button to open sheet */}
          <button
            onClick={() => setIsMobileSheetOpen(true)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              activeFiltersCount > 0
                ? 'bg-teal-50 text-teal-700 border border-teal-500'
                : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
            )}
            aria-label="Ouvrir les filtres"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Category preset chips */}
          {Object.entries(CATEGORY_PRESETS).map(([key, { label }]) => (
            <FilterChip
              key={key}
              label={label}
              active={activePreset === key}
              onClick={() => handlePresetToggle(key)}
            />
          ))}

          {/* Distance chips */}
          {DISTANCE_OPTIONS.slice(0, 3).map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              active={filters.distance === option.value}
              onClick={() => handleDistanceChange(option.value)}
            />
          ))}
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      <MobileFilterSheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
      >
        <FilterContent />
      </MobileFilterSheet>

      {/* Desktop Filter Panel - hidden on mobile */}
      <aside className={cn('hidden lg:block', className)}>
        <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-900">Filtres</h2>
            </div>
            {activeFiltersCount > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-medium text-teal-700">
                {activeFiltersCount}
              </span>
            )}
          </div>

          <FilterContent />
        </div>
      </aside>
    </>
  );
}
