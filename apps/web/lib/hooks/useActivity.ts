'use client';

import type { Activity } from '@action-atlas/types';
import { useQuery } from '@tanstack/react-query';

import { getActivityById } from '@/lib/api-client';

/**
 * Custom hook for fetching a single activity by ID
 */
export function useActivity(activityId: string | undefined) {
  return useQuery<Activity>({
    queryKey: ['activity', activityId],
    queryFn: () => {
      if (!activityId) {
        throw new Error('Activity ID is required');
      }
      return getActivityById(activityId);
    },
    enabled: Boolean(activityId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
