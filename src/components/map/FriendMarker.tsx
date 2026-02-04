'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMap } from './MapProvider';
import type { LiveUserPin } from '@/types';

interface FriendMarkerProps {
  friend: LiveUserPin;
  onClick?: (friend: LiveUserPin) => void;
}

export function FriendMarker({ friend, onClick }: FriendMarkerProps) {
  const { map } = useMap();
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create custom marker element
    const el = document.createElement('div');
    el.className = 'friend-marker';
    el.innerHTML = `
      <div class="relative group cursor-pointer">
        <div class="w-10 h-10 rounded-full bg-zinc-900 border-3 border-orange-500 flex items-center justify-center overflow-hidden shadow-lg transform transition-transform group-hover:scale-110">
          ${friend.avatarUrl 
            ? `<img src="${friend.avatarUrl}" alt="${friend.displayName}" class="w-full h-full object-cover" />`
            : `<span class="text-orange-500 font-bold text-sm">${friend.displayName.charAt(0)}</span>`
          }
        </div>
        ${friend.heading !== undefined ? `
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-orange-500" 
               style="transform: translateX(-50%) rotate(${friend.heading}deg);"></div>
        ` : ''}
        <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-900/90 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
          ${friend.displayName}
          ${friend.speed ? `<span class="text-orange-400 ml-1">${Math.round(friend.speed)} mph</span>` : ''}
        </div>
      </div>
    `;

    el.addEventListener('click', () => onClick?.(friend));

    const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([friend.location.longitude, friend.location.latitude])
      .addTo(map);

    markerRef.current = marker;

    return () => {
      marker.remove();
    };
  }, [map, friend, onClick]);

  // Update position when it changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat([friend.location.longitude, friend.location.latitude]);
    }
  }, [friend.location]);

  return null;
}
