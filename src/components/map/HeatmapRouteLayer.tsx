'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useMap } from './MapProvider';
import type mapboxgl from 'mapbox-gl';

interface HeatmapRouteLayerProps {
    points: { lat: number; lng: number; value: number }[];
    mode: 'speed' | 'braking';
    width?: number;
    opacity?: number;
}

export function HeatmapRouteLayer({
    points,
    mode,
    width = 6,
    opacity = 1,
}: HeatmapRouteLayerProps) {
    const { map, isLoaded } = useMap();
    const [layerAdded, setLayerAdded] = useState(false);
    const mapRef = useRef<mapboxgl.Map | null>(null);

    const sourceId = 'heatmap-route-source';
    const layerId = 'heatmap-route-layer';

    // Color scales
    const getSpeedColor = (speed: number) => {
        if (speed < 30) return '#22C55E'; // Green
        if (speed < 60) return '#EAB308'; // Yellow
        if (speed < 80) return '#F97316'; // Orange
        return '#EF4444'; // Red
    };

    const getBrakingColor = (pressure: number) => {
        if (pressure < 1) return 'transparent';
        if (pressure < 30) return 'rgba(56, 189, 248, 0.5)'; // Light Blue
        if (pressure < 60) return 'rgba(14, 165, 233, 0.8)'; // Sky Blue
        return '#3B82F6'; // Blue
    };

    // Prepare GeoJSON data
    const data = useMemo(() => {
        if (points.length < 2) return { type: 'FeatureCollection', features: [] };

        const features = [];
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            const color = mode === 'speed'
                ? getSpeedColor(p1.value)
                : getBrakingColor(p1.value);

            if (color === 'transparent') continue;

            features.push({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [[p1.lng, p1.lat], [p2.lng, p2.lat]]
                },
                properties: {
                    color
                }
            });
        }

        return {
            type: 'FeatureCollection',
            features
        };
    }, [points, mode]);

    useEffect(() => {
        if (!map || !isLoaded) return;
        mapRef.current = map;

        const addLayer = () => {
            // Add source
            if (!map.getSource(sourceId)) {
                map.addSource(sourceId, {
                    type: 'geojson',
                    data: data as any,
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
                        'line-color': ['get', 'color'],
                        'line-width': width,
                        'line-opacity': opacity,
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
    }, [map, isLoaded, width, opacity]);

    // Update data
    useEffect(() => {
        if (!map || !layerAdded) return;

        const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
        if (source) {
            source.setData(data as any);
        }
    }, [map, layerAdded, data, sourceId]);

    return null;
}
