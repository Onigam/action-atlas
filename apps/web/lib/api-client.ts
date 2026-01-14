import type { Activity, Organization, SearchResponse } from '@action-atlas/types';

// Re-export SearchResponse for use in hooks
export type { SearchResponse };

import { API_ROUTES } from './constants';

/**
 * Search filters for activities
 */
export interface SearchFilters {
  category?: string;
  skills?: string[];
  location?: {
    lat: number;
    lng: number;
    maxDistance?: number;
  };
  timeCommitment?: string;
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Base API client configuration
 */
const API_BASE_URL =
  process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3000';

/**
 * Fetch wrapper with error handling and retry logic
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { retries?: number }
): Promise<T> {
  const { retries = 1, ...fetchOptions } = options || {};
  const url = `${API_BASE_URL}${endpoint}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions?.headers,
        },
        ...(fetchOptions?.signal && { signal: fetchOptions.signal }),
      });

      if (!response.ok) {
        let error: ApiError;
        try {
          error = await response.json() as ApiError;
        } catch {
          error = {
            error: 'API Error',
            message: response.statusText,
            statusCode: response.status,
          };
        }
        throw new Error(error.message ?? 'An error occurred');
      }

      return response.json() as Promise<T>;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('An unexpected error occurred');

      // Don't retry on client errors (4xx) or if it's the last attempt
      if (
        lastError.message.includes('404') ||
        lastError.message.includes('400') ||
        attempt === retries
      ) {
        break;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw lastError || new Error('An unexpected error occurred');
}

/**
 * Search activities with semantic search
 */
export async function searchActivities(
  query: string,
  filters?: SearchFilters
): Promise<SearchResponse> {
  return fetchApi<SearchResponse>(API_ROUTES.SEARCH, {
    method: 'POST',
    body: JSON.stringify({ query, ...filters }),
  });
}

/**
 * Get activity by ID
 */
export async function getActivityById(id: string): Promise<Activity> {
  const response = await fetchApi<{ data: Activity }>(API_ROUTES.ACTIVITY(id), {
    method: 'GET',
  });
  return response.data;
}

/**
 * Get all activities (with pagination)
 */
export async function getActivities(params?: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<{
  activities: Activity[];
  total: number;
  page: number;
  limit: number;
}> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.category) searchParams.set('category', params.category);

  const query = searchParams.toString();
  const endpoint = query
    ? `${API_ROUTES.ACTIVITIES}?${query}`
    : API_ROUTES.ACTIVITIES;

  return fetchApi(endpoint, { method: 'GET' });
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(
  id: string
): Promise<Organization & { activityCount?: number }> {
  const response = await fetchApi<{
    data: {
      organization: Organization & { activityCount?: number };
    };
  }>(API_ROUTES.ORGANIZATION(id), {
    method: 'GET',
  });
  return response.data.organization;
}

/**
 * Get activities for an organization
 */
export async function getOrganizationActivities(
  organizationId: string,
  params?: { page?: number; limit?: number }
): Promise<{
  activities: Activity[];
  total: number;
}> {
  const searchParams = new URLSearchParams({ organizationId });
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetchApi<{
    data: {
      activities: Activity[];
    };
  }>(`${API_ROUTES.ACTIVITIES}?${searchParams.toString()}`, {
    method: 'GET',
  });

  return {
    activities: response.data.activities,
    total: response.data.activities.length,
  };
}

/**
 * Create a new activity (admin only)
 */
export async function createActivity(
  activity: Partial<Activity>
): Promise<Activity> {
  return fetchApi<Activity>(API_ROUTES.ACTIVITIES, {
    method: 'POST',
    body: JSON.stringify(activity),
  });
}

/**
 * Update an activity (admin only)
 */
export async function updateActivity(
  id: string,
  updates: Partial<Activity>
): Promise<Activity> {
  return fetchApi<Activity>(API_ROUTES.ACTIVITY(id), {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

/**
 * Delete an activity (admin only)
 */
export async function deleteActivity(id: string): Promise<void> {
  return fetchApi<void>(API_ROUTES.ACTIVITY(id), {
    method: 'DELETE',
  });
}
