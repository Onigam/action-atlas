import type { ActivityCategory } from '@action-atlas/types';

/**
 * Activity categories with display names and icons
 */
export const ACTIVITY_CATEGORIES: Record<
  ActivityCategory,
  { label: string; description: string }
> = {
  education: {
    label: 'Education',
    description: 'Teaching, tutoring, mentoring',
  },
  environment: {
    label: 'Environment',
    description: 'Conservation, cleanup, sustainability',
  },
  health: {
    label: 'Health',
    description: 'Healthcare, wellness, support',
  },
  'social-services': {
    label: 'Social Services',
    description: 'Community support, assistance programs',
  },
  'arts-culture': {
    label: 'Arts & Culture',
    description: 'Museums, performing arts, heritage',
  },
  'animal-welfare': {
    label: 'Animal Welfare',
    description: 'Shelters, rescue, conservation',
  },
  'community-development': {
    label: 'Community Development',
    description: 'Infrastructure, urban planning, neighborhoods',
  },
  youth: {
    label: 'Youth',
    description: 'Programs for children and teenagers',
  },
  seniors: {
    label: 'Seniors',
    description: 'Elderly care and activities',
  },
  technology: {
    label: 'Technology',
    description: 'Digital literacy, coding, STEM',
  },
  other: {
    label: 'Other',
    description: 'General volunteering opportunities',
  },
};

/**
 * Skill levels with descriptions
 */
export const SKILL_LEVELS = {
  beginner: {
    label: 'Beginner',
    description: 'No prior experience needed',
  },
  intermediate: {
    label: 'Intermediate',
    description: 'Some experience helpful',
  },
  advanced: {
    label: 'Advanced',
    description: 'Significant experience required',
  },
  expert: {
    label: 'Expert',
    description: 'Professional-level expertise',
  },
} as const;

/**
 * Time commitment options
 */
export const TIME_COMMITMENTS = [
  { value: 'flexible', label: 'Flexible' },
  { value: 'one-time', label: 'One-time' },
  { value: 'recurring', label: 'Recurring' },
  { value: '1-2', label: '1-2 hours/week' },
  { value: '3-5', label: '3-5 hours/week' },
  { value: '6-10', label: '6-10 hours/week' },
  { value: '10+', label: '10+ hours/week' },
] as const;

/**
 * Distance filter options (in kilometers)
 */
export const DISTANCE_OPTIONS = [
  { value: 25, label: 'Within 25km' },
  { value: 50, label: 'Within 50km' },
  { value: 100, label: 'Within 100km' },
  { value: -1, label: 'Any distance' },
] as const;

/**
 * Search result limits
 */
export const SEARCH_LIMITS = {
  DEFAULT: 20,
  MAX: 100,
  MIN: 5,
} as const;

/**
 * Application routes
 */
export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  ACTIVITY: (id: string) => `/activities/${id}` as const,
  ORGANIZATION: (id: string) => `/organizations/${id}` as const,
  ABOUT: '/about',
  CONTACT: '/contact',
};

/**
 * API endpoints
 */
export const API_ROUTES = {
  SEARCH: '/api/search',
  ACTIVITIES: '/api/activities',
  ACTIVITY: (id: string) => `/api/activities/${id}`,
  ORGANIZATIONS: '/api/organizations',
  ORGANIZATION: (id: string) => `/api/organizations/${id}`,
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Cache durations (in seconds)
 */
export const CACHE_DURATIONS = {
  SEARCH_RESULTS: 300, // 5 minutes
  ACTIVITY: 600, // 10 minutes
  ORGANIZATION: 3600, // 1 hour
  EMBEDDINGS: 2592000, // 30 days
} as const;

/**
 * Form validation constants
 */
export const VALIDATION = {
  SEARCH_QUERY_MIN: 3,
  SEARCH_QUERY_MAX: 500,
  TITLE_MIN: 5,
  TITLE_MAX: 200,
  DESCRIPTION_MIN: 50,
  DESCRIPTION_MAX: 5000,
} as const;

/**
 * External links
 */
export const EXTERNAL_LINKS = {
  GITHUB: 'https://github.com/your-org/action-atlas',
  TWITTER: 'https://twitter.com/actionatlas',
  SUPPORT: 'mailto:support@actionatlas.org',
} as const;
