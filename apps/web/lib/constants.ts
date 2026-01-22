/**
 * Known activity categories with display names and descriptions.
 * Ordered by count in the database (most popular first).
 */
export const ACTIVITY_CATEGORIES: Record<
  string,
  { label: string; description: string }
> = {
  Children: {
    label: 'Children',
    description: 'Programs for children and young people',
  },
  Education: {
    label: 'Education',
    description: 'Teaching, tutoring, mentoring',
  },
  Poverty: {
    label: 'Poverty',
    description: 'Fighting poverty and economic hardship',
  },
  Health: {
    label: 'Health',
    description: 'Healthcare, wellness, support',
  },
  'Social integration': {
    label: 'Social integration',
    description: 'Helping people integrate into society',
  },
  Hunger: {
    label: 'Hunger',
    description: 'Food security and nutrition programs',
  },
  Environment: {
    label: 'Environment',
    description: 'Conservation, cleanup, sustainability',
  },
  'Human rights': {
    label: 'Human rights',
    description: 'Advocacy and protection of human rights',
  },
  Disability: {
    label: 'Disability',
    description: 'Support for people with disabilities',
  },
  'Gender Equality': {
    label: 'Gender Equality',
    description: 'Promoting gender equality and women empowerment',
  },
  'Sustainable cities': {
    label: 'Sustainable cities',
    description: 'Urban sustainability and livable cities',
  },
  Animals: {
    label: 'Animals',
    description: 'Animal welfare and protection',
  },
  Refugees: {
    label: 'Refugees',
    description: 'Support for refugees and displaced people',
  },
  'Arts & Culture': {
    label: 'Arts & Culture',
    description: 'Museums, performing arts, heritage',
  },
  'Professional reintegration': {
    label: 'Professional reintegration',
    description: 'Helping people return to work',
  },
  Innovation: {
    label: 'Innovation',
    description: 'Technology and innovative solutions',
  },
  Sport: {
    label: 'Sport',
    description: 'Sports and physical activities',
  },
  'Responsible consumption': {
    label: 'Responsible consumption',
    description: 'Sustainable consumption practices',
  },
  Water: {
    label: 'Water',
    description: 'Clean water access and sanitation',
  },
  'Disaster relief': {
    label: 'Disaster relief',
    description: 'Emergency response and disaster recovery',
  },
  'Clean energy': {
    label: 'Clean energy',
    description: 'Renewable energy and clean technology',
  },
};

/**
 * Category presets for quick filtering.
 * Each preset maps to a list of category keys.
 */
export const CATEGORY_PRESETS: Record<
  string,
  { label: string; description: string; categories: string[] }
> = {
  humanitarian: {
    label: 'Humanitarian',
    description: 'Emergency aid and basic needs',
    categories: [
      'Children',
      'Poverty',
      'Hunger',
      'Refugees',
      'Disaster relief',
      'Human rights',
    ],
  },
  social: {
    label: 'Social',
    description: 'Education, health and inclusion',
    categories: [
      'Education',
      'Health',
      'Disability',
      'Social integration',
      'Gender Equality',
      'Professional reintegration',
    ],
  },
  environmental: {
    label: 'Environmental',
    description: 'Planet and sustainability',
    categories: [
      'Environment',
      'Animals',
      'Water',
      'Clean energy',
      'Sustainable cities',
      'Responsible consumption',
    ],
  },
  'culture-innovation': {
    label: 'Culture & Innovation',
    description: 'Arts, sports and technology',
    categories: ['Arts & Culture', 'Sport', 'Innovation'],
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
