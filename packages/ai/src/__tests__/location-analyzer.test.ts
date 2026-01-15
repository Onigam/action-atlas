import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeLocationQuery, hasValidLocation, LocationExtractionResult } from '../location-analyzer';
import { generateObject } from 'ai';

// Mock the ai SDK
vi.mock('ai', () => ({
  generateObject: vi.fn()
}));

// Mock openai
vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => 'mock-model')
}));

// Get the mocked function
const generateObjectMock = vi.mocked(generateObject);

describe('location-analyzer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('analyzeLocationQuery', () => {
    it('should extract location from query with city', async () => {
      const mockResult = {
        object: {
          formattedAddress: 'Paris, France',
          language: 'fr'
        }
      };

      generateObjectMock.mockResolvedValueOnce(mockResult);

      const result = await analyzeLocationQuery('volunteer opportunities in Paris');

      expect(result).toEqual({
        formattedAddress: 'Paris, France',
        language: 'fr'
      });

      expect(generateObjectMock).toHaveBeenCalledWith({
        model: 'mock-model',
        schema: expect.any(Object), // LocationExtractionResult schema
        system: expect.stringContaining('expert at detecting'),
        prompt: 'volunteer opportunities in Paris',
        temperature: 0
      });
    });

    it('should return null for queries without location', async () => {
      const mockResult = {
        object: {
          formattedAddress: null,
          language: null
        }
      };

      generateObjectMock.mockResolvedValueOnce(mockResult);

      const result = await analyzeLocationQuery('I want to help');

      expect(result).toEqual({
        formattedAddress: null,
        language: null
      });
    });

    it('should handle LLM errors gracefully', async () => {
      generateObjectMock.mockRejectedValueOnce(new Error('API Error'));

      // Mock console.error to avoid test output
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await analyzeLocationQuery('some query');

      expect(result).toEqual({
        formattedAddress: null,
        language: null
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Location Analyzer] Error extracting location:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('hasValidLocation', () => {
    it('should return true for valid location', () => {
      const result: LocationExtractionResult = {
        formattedAddress: 'New York, NY, USA',
        language: 'en'
      };

      expect(hasValidLocation(result)).toBe(true);
    });

    it('should return false when formattedAddress is null', () => {
      const result: LocationExtractionResult = {
        formattedAddress: null,
        language: 'en'
      };

      expect(hasValidLocation(result)).toBe(false);
    });

    it('should return false when language is null', () => {
      const result: LocationExtractionResult = {
        formattedAddress: 'Paris, France',
        language: null
      };

      expect(hasValidLocation(result)).toBe(false);
    });

    it('should return false when both are null', () => {
      const result: LocationExtractionResult = {
        formattedAddress: null,
        language: null
      };

      expect(hasValidLocation(result)).toBe(false);
    });
  });
});