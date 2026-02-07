'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Marker, Popup } from 'react-leaflet';

interface PoliceStopsLayerProps {
    visible?: boolean;
    lowDetailMode?: boolean;
    showAllPoints?: boolean;
    filters?: {
        violationType?: string | null;
        hasAlcohol?: boolean | null;
        hasAccident?: boolean | null;
        hourStart?: number | null;
        hourEnd?: number | null;
        dayOfWeek?: number | null;
        year?: number | null;
        speedOnly?: boolean | null;
        detectionMethod?: string | null;
        minSpeedOver?: number | null;
        speedTrapsOnly?: boolean | null;
        vehicleMake?: string | null;
        searchConducted?: boolean | null;
    };
    onStopClick?: (properties: any) => void;
}

export function LeafletPoliceStops({
    visible = true,
    lowDetailMode = false,
    showAllPoints = false,
    filters = {},
    onStopClick,
}: PoliceStopsLayerProps) {
    const map = useMap();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async () => {
        if (!map) return;

        try {
            const bounds = map.getBounds();
            const zoom = map.getZoom();

            const params = new URLSearchParams();
            params.set('bounds', `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`);
            params.set('zoom', zoom.toString());

            if (showAllPoints) {
                params.set('noSampling', 'true');
                params.set('limit', '5000'); // Reduced limit for Leaflet performance
            }

            if (filters.violationType) params.set('violationType', filters.violationType);
            if (filters.hasAlcohol !== null && filters.hasAlcohol !== undefined) {
                params.set('hasAlcohol', filters.hasAlcohol.toString());
            }
            if (filters.hasAccident !== null && filters.hasAccident !== undefined) {
                params.set('hasAccident', filters.hasAccident.toString());
            }
            if (filters.hourStart !== null && filters.hourStart !== undefined) {
                params.set('hourStart', filters.hourStart.toString());
            }
            if (filters.hourEnd !== null && filters.hourEnd !== undefined) {
                params.set('hourEnd', filters.hourEnd.toString());
            }
            if (filters.year) params.set('year', filters.year.toString());
            if (filters.speedOnly) params.set('speedOnly', 'true');
            if (filters.detectionMethod) params.set('detectionMethod', filters.detectionMethod);
            if (filters.minSpeedOver) params.set('minSpeedOver', filters.minSpeedOver.toString());
            if (filters.vehicleMake) params.set('vehicleMake', filters.vehicleMake);
            if (filters.speedTrapsOnly) params.set('speedTrapsOnly', 'true');
            if (filters.dayOfWeek !== null && filters.dayOfWeek !== undefined) {
                params.set('dayOfWeek', filters.dayOfWeek.toString());
            }
            if (filters.searchConducted) params.set('searchConducted', 'true');

            setLoading(true);
            const res = await fetch(`/api/analytics/points?${params}`);
            if (res.ok) {
                const json = await res.json();
                if (json.success) {
                    setData(json.data);
                }
            }
        } catch (error) {
            console.warn('Error fetching police stops:', error);
        } finally {
            setLoading(false);
        }
    }, [map, filters, showAllPoints]);

    useEffect(() => {
        if (!map || !visible) return;

        fetchData();

        const handleMoveEnd = () => fetchData();
        map.on('moveend', handleMoveEnd);

        return () => {
            map.off('moveend', handleMoveEnd);
        };
    }, [map, visible, fetchData]);

    const markers = useMemo(() => {
        if (!data || !data.features) return [];

        return data.features.map((feature: any, index: number) => {
            const coords: [number, number] = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
            const props = feature.properties;

            // Custom color logic based on violation type
            let color = '#8B5CF6'; // Purple default
            if (props.alcohol) color = '#EF4444'; // Red
            else if (props.accident) color = '#F97316'; // Orange
            else if (props.violationType === 'Citation') color = '#3B82F6'; // Blue
            else if (props.violationType === 'Warning') color = '#22C55E'; // Green

            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6],
            });

            return (
                <Marker
                    key={feature.id || index}
                    position={coords}
                    icon={icon}
                    eventHandlers={{
                        click: () => {
                            if (onStopClick) onStopClick(props);
                        },
                    }}
                >
                    <Popup className="custom-popup">
                        <div className="p-2 min-w-[150px]">
                            <div className="font-bold text-[#F5F5F4]">{props.violationType}</div>
                            <div className="text-xs text-[#A8A8A8] mt-1">{props.charge || props.description}</div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white">
                                    {new Date(props.stopDate).toLocaleDateString()}
                                </div>
                                {props.isSpeedRelated && (
                                    <div className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400">
                                        Speeding
                                    </div>
                                )}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            );
        });
    }, [data, onStopClick]);

    if (!visible) return null;

    return (
        <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={80}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            polygonOptions={{
                fillColor: '#8B5CF6',
                color: '#8B5CF6',
                weight: 2,
                opacity: 0.5,
                fillOpacity: 0.1,
            }}
        >
            {markers}
        </MarkerClusterGroup>
    );
}
