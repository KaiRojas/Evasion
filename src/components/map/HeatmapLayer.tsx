'use client';

import { useEffect, useState, useRef } from 'react';
import { useMap } from './MapProvider';
import type mapboxgl from 'mapbox-gl';

interface HeatmapLayerProps {
  id?: string;
  data: GeoJSON.FeatureCollection | null;
  visible?: boolean;
  radius?: number;
  intensity?: number;
  colorStops?: Array<[number, string]>;
  opacity?: number;
}

const DEFAULT_COLOR_STOPS: Array<[number, string]> = [
  [0, 'rgba(0, 0, 255, 0)'],
  [0.1, 'royalblue'],
  [0.3, 'cyan'],
  [0.5, 'lime'],
  [0.7, 'yellow'],
  [1, 'red'],
];

export function HeatmapLayer({
  id = 'violations-heatmap',
  data,
  visible = true,
  radius = 20,
  intensity = 1,
  colorStops = DEFAULT_COLOR_STOPS,
  opacity = 0.8,
}: HeatmapLayerProps) {
  const { map, isLoaded } = useMap();
  const [layerAdded, setLayerAdded] = useState(false);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const sourceId = `${id}-source`;
  const layerId = `${id}-layer`;

  // Add source and layer
  useEffect(() => {
    if (!map || !isLoaded) return;
    
    // Store map reference for cleanup
    mapRef.current = map;

    // Check if map is still valid
    try {
      // Add source if it doesn't exist
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: data || { type: 'FeatureCollection', features: [] },
        });
      }

      // Add heatmap layer if it doesn't exist
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: 'heatmap',
          source: sourceId,
          maxzoom: 15,
          paint: {
            // Increase weight based on count property
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'count'],
              0, 0,
              100, 0.5,
              1000, 1,
            ],
            // Increase intensity as zoom level increases
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              15, 3,
            ],
            // Color gradient
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              ...colorStops.flatMap(([stop, color]) => [stop, color]),
            ],
            // Radius increases with zoom
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, radius / 2,
              15, radius * 2,
            ],
            // Opacity
            'heatmap-opacity': opacity,
          },
        });
        
        setLayerAdded(true);
      }
    } catch (error) {
      console.warn('HeatmapLayer: Error adding layer', error);
    }

    return () => {
      const currentMap = mapRef.current;
      if (!currentMap) return;
      
      try {
        if (currentMap.getLayer(layerId)) {
          currentMap.removeLayer(layerId);
        }
        if (currentMap.getSource(sourceId)) {
          currentMap.removeSource(sourceId);
        }
      } catch (error) {
        // Map may have been destroyed, ignore errors
      }
      setLayerAdded(false);
    };
  }, [map, isLoaded, sourceId, layerId, colorStops, opacity, radius, data]);

  // Update data when it changes
  useEffect(() => {
    if (!map || !layerAdded || !data) return;

    try {
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData(data);
      }
    } catch (error) {
      // Map may have been destroyed
    }
  }, [map, layerAdded, sourceId, data]);

  // Update visibility
  useEffect(() => {
    if (!map || !layerAdded) return;

    try {
      map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    } catch (error) {
      // Map may have been destroyed
    }
  }, [map, layerAdded, layerId, visible]);

  // Update paint properties
  useEffect(() => {
    if (!map || !layerAdded) return;

    try {
      map.setPaintProperty(layerId, 'heatmap-intensity', [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, intensity,
        15, intensity * 3,
      ]);
    } catch (error) {
      // Map may have been destroyed
    }
  }, [map, layerAdded, layerId, intensity]);

  return null;
}
