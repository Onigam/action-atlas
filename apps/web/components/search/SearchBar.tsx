'use client';

import { Search, X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  placeholder = 'Search for volunteering activities...',
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
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          autoFocus={autoFocus}
          className="h-14 pl-12 pr-12 text-base"
          aria-label="Search for volunteering activities"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-sm p-1 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <Button type="submit" size="lg" className="h-14 px-8">
        Search
      </Button>
    </form>
  );
}
