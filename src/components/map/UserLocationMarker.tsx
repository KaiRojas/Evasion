'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMap } from './MapProvider';
import type { Coordinates } from '@/types';

interface UserLocationMarkerProps {
  location: Coordinates | null;
  label?: string;
}

export function UserLocationMarker({ location, label = 'You' }: UserLocationMarkerProps) {
  const { map } = useMap();
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map || !location) return;

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.className = 'user-location-marker';
      el.style.pointerEvents = 'none';
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 bg-[#EF4444]/40 rounded-full animate-ping"></div>
          <div class="relative w-5 h-5 bg-[#EF4444] rounded-full border-2 border-white shadow-[0_0_20px_rgba(239,68,68,0.5)]"></div>
          <div class="absolute -bottom-8 bg-black/60 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest border border-white/10 text-white">
            ${label}
          </div>
        </div>
      `;


      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.longitude, location.latitude])
        .addTo(map);

      markerRef.current = marker;
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, location, label]);

  useEffect(() => {
    if (!markerRef.current) return;
    if (!location) {
      markerRef.current.remove();
      markerRef.current = null;
      return;
    }

    markerRef.current.setLngLat([location.longitude, location.latitude]);
  }, [location?.longitude, location?.latitude, location]);

  return null;
}
