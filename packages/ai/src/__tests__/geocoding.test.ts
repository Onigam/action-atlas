import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { geocode, geocodeFirst, isGeocodingAvailable, GeocodingResult } from '../geocoding';

// Mock fetch globally
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('geocoding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    delete process.env.GOOGLE_MAPS_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isGeocodingAvailable', () => {
    it('should return true when API key is set', () => {
      process.env.GOOGLE_MAPS_API_KEY = 'test-key';
      expect(isGeocodingAvailable()).toBe(true);
    });

    it('should return false when API key is not set', () => {
      expect(isGeocodingAvailable()).toBe(false);
    });
  });

  describe('geocode', () => {
    beforeEach(() => {
      process.env.GOOGLE_MAPS_API_KEY = 'test-key';
    });

    it('should throw error when API key is not set', async () => {
      delete process.env.GOOGLE_MAPS_API_KEY;
      await expect(geocode({ formattedAddress: 'New York' })).rejects.toThrow(
        'GOOGLE_MAPS_API_KEY environment variable is not set'
      );
    });

    it('should throw error for empty address', async () => {
      await expect(geocode({ formattedAddress: '' })).rejects.toThrow(
        'formattedAddress cannot be empty'
      );
    });

    it('should throw error for address too long', async () => {
      const longAddress = 'a'.repeat(501);
      await expect(geocode({ formattedAddress: longAddress })).rejects.toThrow(
        'formattedAddress exceeds maximum length of 500 characters'
      );
    });

    it('should throw error for invalid language', async () => {
      await expect(geocode({ formattedAddress: 'New York', language: 'english' })).rejects.toThrow(
        'language must be a valid 2-letter ISO language code'
      );
    });

    it('should handle successful geocoding response', async () => {
      const mockResponse = {
        results: [
          {
            formatted_address: 'New York, NY, USA',
            geometry: {
              location: { lat: 40.7128, lng: -74.0060 }
            },
            place_id: 'test-place-id'
          }
        ],
        status: 'OK'
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const results = await geocode({ formattedAddress: 'New York' });

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
        formattedAddress: 'New York, NY, USA',
        placeId: 'test-place-id'
      });

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('maps.googleapis.com/maps/api/geocode/json')
      );
    });

    it('should return empty array for ZERO_RESULTS', async () => {
      const mockResponse = {
        results: [],
        status: 'ZERO_RESULTS'
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const results = await geocode({ formattedAddress: 'Nonexistent Place' });
      expect(results).toEqual([]);
    });

    it('should throw error for API errors', async () => {
      const mockResponse = {
        results: [],
        status: 'REQUEST_DENIED',
        error_message: 'Invalid API key'
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await expect(geocode({ formattedAddress: 'New York' })).rejects.toThrow(
        'Geocoding failed with status REQUEST_DENIED: Invalid API key'
      );
    });

    it('should throw error for HTTP errors', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      await expect(geocode({ formattedAddress: 'New York' })).rejects.toThrow(
        'Geocoding request failed with status 403: Forbidden'
      );
    });
  });

  describe('geocodeFirst', () => {
    beforeEach(() => {
      process.env.GOOGLE_MAPS_API_KEY = 'test-key';
    });

    it('should return the first result', async () => {
      const mockResponse = {
        results: [
          {
            formatted_address: 'New York, NY, USA',
            geometry: { location: { lat: 40.7128, lng: -74.0060 } },
            place_id: 'test-place-id'
          }
        ],
        status: 'OK'
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await geocodeFirst({ formattedAddress: 'New York' });

      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
        formattedAddress: 'New York, NY, USA',
        placeId: 'test-place-id'
      });
    });

    it('should return null when no results', async () => {
      const mockResponse = {
        results: [],
        status: 'ZERO_RESULTS'
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await geocodeFirst({ formattedAddress: 'Nonexistent' });
      expect(result).toBeNull();
    });
  });
});