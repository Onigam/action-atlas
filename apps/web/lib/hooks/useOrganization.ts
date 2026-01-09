'use client';

import type { Organization , Activity } from '@action-atlas/types';
import { useQuery } from '@tanstack/react-query';

import { getOrganizationById, getOrganizationActivities } from '@/lib/api-client';


/**
 * Custom hook for fetching organization details
 */
export function useOrganization(organizationId: string | undefined) {
  return useQuery<Organization & { activityCount?: number }>({
    queryKey: ['organization', organizationId],
    queryFn: () => {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }
      return getOrganizationById(organizationId);
    },
    enabled: Boolean(organizationId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Custom hook for fetching organization's activities with pagination
 */
export function useOrganizationActivities(
  organizationId: string | undefined,
  options?: { page?: number; limit?: number }
) {
  return useQuery<{ activities: Activity[]; total: number }>({
    queryKey: ['organization-activities', organizationId, options],
    queryFn: () => {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }
      return getOrganizationActivities(organizationId, options);
    },
    enabled: Boolean(organizationId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
