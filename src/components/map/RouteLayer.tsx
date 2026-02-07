'use client';

import { useEffect, useRef } from 'react';
import { useMap } from './MapProvider';
import L from 'leaflet';

interface RouteLayerProps {
  id: string;
  coordinates: [number, number][]; // Array of [lng, lat]
  color?: string;
  width?: number;
  opacity?: number;
  dashed?: boolean;
}

export function RouteLayer({
  id,
  coordinates,
  color = '#f97316', // Orange
  width = 4,
  opacity = 0.8,
  dashed = false,
}: RouteLayerProps) {
  const { map, isLoaded } = useMap();
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!map || !isLoaded || coordinates.length < 2) return;

    // Convert [lng, lat] to [lat, lng] for Leaflet
    const latLngs: L.LatLngExpression[] = coordinates.map(([lng, lat]) => [lat, lng]);

    // Create polyline options
    const options: L.PolylineOptions = {
      color,
      weight: width,
      opacity,
      lineJoin: 'round',
      lineCap: 'round',
    };

    // Add dash pattern if needed
    if (dashed) {
      options.dashArray = '8, 8';
    }

    // Create or update polyline
    if (polylineRef.current) {
      polylineRef.current.setLatLngs(latLngs);
      polylineRef.current.setStyle(options);
    } else {
      polylineRef.current = L.polyline(latLngs, options).addTo(map);
    }

    return () => {
      if (polylineRef.current && map) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
    };
  }, [map, isLoaded, id, coordinates, color, width, opacity, dashed]);

  return null;
}
