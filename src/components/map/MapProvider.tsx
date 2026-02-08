'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';

interface MapContextType {
  map: MapboxMap | null;
  setMap: (map: MapboxMap | null) => void;
  isLoaded: boolean;
  flyTo: (lng: number, lat: number, zoom?: number) => void;
}

const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<MapboxMap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleSetMap = useCallback((newMap: MapboxMap | null) => {
    setMap(newMap);
    setIsLoaded(!!newMap);
  }, []);

  const flyTo = useCallback((lng: number, lat: number, zoom = 14) => {
    if (map) {
      map.flyTo({
        center: [lng, lat],
        zoom,
        duration: 2000, // slightly longer for smoother transition
        essential: true
      });
    }
  }, [map]);

  return (
    <MapContext.Provider value={{ map, setMap: handleSetMap, isLoaded, flyTo }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}

// Also export for BaseMap compatibility
export { useMap as useMapContext };
