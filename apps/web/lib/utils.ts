import type { Geolocation, Location } from '@action-atlas/types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/**
 * Format a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const units = [
    { name: 'year', seconds: 31536000 },
    { name: 'month', seconds: 2592000 },
    { name: 'week', seconds: 604800 },
    { name: 'day', seconds: 86400 },
    { name: 'hour', seconds: 3600 },
    { name: 'minute', seconds: 60 },
  ];

  for (const unit of units) {
    const count = Math.floor(diffInSeconds / unit.seconds);
    if (count >= 1) {
      return `${count} ${unit.name}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

/**
 * Format distance in kilometers or miles
 */
export function formatDistance(distanceInKm: number): string {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`;
  }
  return `${distanceInKm.toFixed(1)}km`;
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format geolocations to a short string
 * Extracts the first formatted address from geolocations array
 *
 * @param geolocations - Array of geolocation objects or undefined
 * @param preferredLanguage - Language preference for formatted address (default: 'en')
 * @returns Formatted location string
 */
export function formatLocationShort(
  geolocations: Geolocation[] | undefined,
  preferredLanguage: string = 'en'
): string {
  if (!geolocations || !Array.isArray(geolocations) || geolocations.length === 0) {
    return 'Location not specified';
  }

  // Get the first geolocation
  const geo = geolocations[0];
  if (!geo?.formattedAddress || geo.formattedAddress.length === 0) {
    return 'Location not specified';
  }

  // Try to find the preferred language
  const preferred = geo.formattedAddress.find(
    (addr) => addr.language === preferredLanguage
  );

  if (preferred?.formattedAddress) {
    return preferred.formattedAddress;
  }

  // Fallback to first available
  return geo.formattedAddress[0]?.formattedAddress ?? 'Location not specified';
}

/**
 * Format a Location object (legacy format) to a short string
 * Used for organizations and other entities that still use the old Location type
 *
 * @param location - Location object with address
 * @returns Formatted location string
 */
export function formatLegacyLocationShort(location: Location | undefined): string {
  if (!location?.address?.city) {
    return 'Location not specified';
  }

  const { city, country } = location.address;
  return country ? `${city}, ${country}` : city;
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sleep for a specified duration (useful for testing)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
