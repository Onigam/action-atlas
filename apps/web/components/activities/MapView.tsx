'use client';

import { MapPin } from 'lucide-react';

export interface MapViewProps {
  latitude?: number;
  longitude?: number;
  className?: string;
}

/**
 * Map view component (placeholder for now)
 * TODO: Integrate with a mapping library (e.g., Mapbox, Leaflet)
 */
export function MapView({ latitude, longitude, className }: MapViewProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border bg-muted p-8 ${className || ''}`}
    >
      <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
      <p className="text-center text-sm text-muted-foreground">
        Map view coming soon
      </p>
      {latitude !== undefined && longitude !== undefined && (
        <p className="mt-2 text-xs text-muted-foreground">
          Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      )}
    </div>
  );
}
