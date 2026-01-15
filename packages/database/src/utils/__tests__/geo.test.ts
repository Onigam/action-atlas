import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance, isValidCoordinates } from '../geo';

describe('calculateHaversineDistance', () => {
  it('should calculate distance between two points correctly', () => {
    // Distance between New York (40.7128, -74.0060) and London (51.5074, -0.1278)
    // Expected distance is approximately 5570 km
    const distance = calculateHaversineDistance(40.7128, -74.0060, 51.5074, -0.1278);
    expect(distance).toBeGreaterThan(5500000); // 5500 km in meters
    expect(distance).toBeLessThan(5700000); // 5700 km in meters
  });

  it('should return 0 for identical coordinates', () => {
    const distance = calculateHaversineDistance(40.7128, -74.0060, 40.7128, -74.0060);
    expect(distance).toBe(0);
  });

  it('should handle coordinates at poles', () => {
    // North Pole to South Pole should be approximately 20015 km
    const distance = calculateHaversineDistance(90, 0, -90, 0);
    expect(distance).toBeGreaterThan(19900000); // 19900 km in meters
    expect(distance).toBeLessThan(20100000); // 20100 km in meters
  });
});

describe('isValidCoordinates', () => {
  it('should return true for valid coordinates', () => {
    expect(isValidCoordinates(40.7128, -74.0060)).toBe(true);
    expect(isValidCoordinates(0, 0)).toBe(true);
    expect(isValidCoordinates(-90, -180)).toBe(true);
    expect(isValidCoordinates(90, 180)).toBe(true);
  });

  it('should return false for invalid coordinates', () => {
    expect(isValidCoordinates(null, -74.0060)).toBe(false);
    expect(isValidCoordinates(40.7128, null)).toBe(false);
    expect(isValidCoordinates(91, -74.0060)).toBe(false); // latitude > 90
    expect(isValidCoordinates(-91, -74.0060)).toBe(false); // latitude < -90
    expect(isValidCoordinates(40.7128, 181)).toBe(false); // longitude > 180
    expect(isValidCoordinates(40.7128, -181)).toBe(false); // longitude < -180
    expect(isValidCoordinates(NaN, -74.0060)).toBe(false);
    expect(isValidCoordinates(40.7128, NaN)).toBe(false);
  });
});