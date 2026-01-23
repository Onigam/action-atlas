'use client';

import { Search, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = 'Je veux agir pour la biodiversite a Lausanne',
  value = '',
  onChange,
  onSearch,
  onClear,
  className,
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = React.useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
  };

  const handleClear = () => {
    setQuery('');
    onChange?.('');
    onClear?.();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        // Default behavior: navigate to search page
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
      }
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className={cn('relative flex items-center gap-2', className)}
    >
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 transition-colors" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          autoFocus={autoFocus}
          className={cn(
            'flex h-14 w-full rounded-xl border border-zinc-200 bg-white px-12 text-base text-zinc-900',
            'placeholder:text-zinc-400',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:shadow-sm',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-50',
            // Responsive placeholder via CSS - hide full placeholder on mobile
            '[&::placeholder]:max-sm:text-transparent'
          )}
          aria-label="Rechercher des activites de benevolat"
          data-placeholder-mobile="Rechercher une action..."
        />
        {/* Mobile placeholder overlay */}
        {!query && (
          <span
            className="absolute left-12 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none sm:hidden"
            aria-hidden="true"
          >
            Rechercher une action...
          </span>
        )}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-all duration-200"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className={cn(
          'h-14 px-6 rounded-xl font-medium text-white',
          'bg-teal-600 hover:bg-teal-700',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        Rechercher
      </button>
    </form>
  );
}
