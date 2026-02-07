'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Map as LeafletMap } from 'leaflet';

interface MapContextType {
  map: LeafletMap | null;
  setMap: (map: LeafletMap | null) => void;
  isLoaded: boolean;
  flyTo: (lng: number, lat: number, zoom?: number) => void;
}

const MapContext = createContext<MapContextType | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleSetMap = useCallback((newMap: LeafletMap | null) => {
    setMap(newMap);
    setIsLoaded(!!newMap);
  }, []);

  const flyTo = useCallback((lng: number, lat: number, zoom = 14) => {
    if (map) {
      // Leaflet uses [lat, lng] order
      map.flyTo([lat, lng], zoom, {
        duration: 1.5,
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
