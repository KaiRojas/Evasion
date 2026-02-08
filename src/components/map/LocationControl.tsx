'use client';

import { useCallback } from 'react';
import { Locate } from 'lucide-react';
import { useMap } from './MapProvider';
import { useGeolocation } from '@/hooks';
import { Button } from '@/components/ui';

interface LocationControlProps {
    className?: string;
}

export function LocationControl({ className = '' }: LocationControlProps) {
    const { map } = useMap();
    const { location, isLoading } = useGeolocation();

    const handleSnapToLocation = useCallback(() => {
        if (!map || !location) return;

        map.flyTo({
            center: [location.longitude, location.latitude],
            zoom: 15,
            essential: true,
            duration: 2000
        });
    }, [map, location]);

    if (!location && !isLoading) return null;

    return (
        <div className={`absolute bottom-6 left-6 z-10 ${className}`}>
            <Button
                variant="secondary"
                size="icon"
                onClick={handleSnapToLocation}
                className="w-12 h-12 rounded-full shadow-lg bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 hover:bg-zinc-800"
                title="Snap to my location"
                disabled={isLoading || !location}
            >
                <Locate
                    size={24}
                    className={`${isLoading ? 'animate-pulse text-zinc-500' : 'text-blue-500'}`}
                />
            </Button>
        </div>
    );
}
