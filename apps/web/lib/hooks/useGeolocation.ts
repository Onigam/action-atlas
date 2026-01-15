'use client';

import { useState, useCallback } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

const DEFAULT_ENABLE_HIGH_ACCURACY = false;
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_MAXIMUM_AGE = 5 * 60 * 1000; // 5 minutes

/**
 * Custom hook for accessing browser geolocation
 * Returns the user's current position or an error if unavailable
 */
export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: false,
    isSupported: typeof window !== 'undefined' && 'geolocation' in navigator,
  });

  const enableHighAccuracy = options.enableHighAccuracy ?? DEFAULT_ENABLE_HIGH_ACCURACY;
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const maximumAge = options.maximumAge ?? DEFAULT_MAXIMUM_AGE;

  const requestLocation = useCallback(() => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          isLoading: false,
          isSupported: true,
        });
      },
      (error) => {
        let errorMessage: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
          default:
            errorMessage = 'An unknown error occurred';
        }
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [state.isSupported, enableHighAccuracy, timeout, maximumAge]);

  const clearLocation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      latitude: null,
      longitude: null,
      error: null,
    }));
  }, []);

  return {
    ...state,
    requestLocation,
    clearLocation,
    hasLocation: state.latitude !== null && state.longitude !== null,
  };
}
