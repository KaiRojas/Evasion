'use client';

import { useEffect, useState, useRef } from 'react';
import { useMap } from './MapProvider';
import type mapboxgl from 'mapbox-gl';

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
  const [layerAdded, setLayerAdded] = useState(false);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const sourceId = `route-source-${id}`;
  const layerId = `route-layer-${id}`;

  useEffect(() => {
    if (!map || !isLoaded) return;
    mapRef.current = map;

    const addLayer = () => {
      // Add source
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coordinates,
            },
            properties: {},
          },
        });
      }

      // Add layer
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': color,
            'line-width': width,
            'line-opacity': opacity,
            ...(dashed ? { 'line-dasharray': [2, 2] } : {}),
          },
        });
      }
      setLayerAdded(true);
    };

    if (map.isStyleLoaded()) {
      addLayer();
    } else {
      map.once('style.load', addLayer);
    }

    return () => {
      const currentMap = mapRef.current;
      if (!currentMap) return;

      if (currentMap.getLayer(layerId)) {
        currentMap.removeLayer(layerId);
      }
      if (currentMap.getSource(sourceId)) {
        currentMap.removeSource(sourceId);
      }
      setLayerAdded(false);
    };
  }, [map, isLoaded, id, color, width, opacity, dashed]);

  // Update data when coordinates change
  useEffect(() => {
    if (!map || !layerAdded) return;

    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'Feature',
        geometry: {
          type: 'LineString', // Use LineString for a route
          coordinates: coordinates,
        },
        properties: {},
      });
    }
  }, [map, layerAdded, coordinates, sourceId]);

  return null;
}
