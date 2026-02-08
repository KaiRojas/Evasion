import { useEffect, useState, useRef } from 'react';
import { MapProvider, useMapContext } from './MapProvider';
import Map, { NavigationControl, ScaleControl, useMap as useReactMapGL, type ViewStateChangeEvent, Source, Layer } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { applyEvasionMapTheme } from './mapTheme';

// Ensure you have your token in .env.local
const RAW_MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const MAPBOX_TOKEN = RAW_MAPBOX_TOKEN?.trim();
const MAPBOX_TOKEN_INVALID = !MAPBOX_TOKEN || MAPBOX_TOKEN.toLowerCase().includes('placeholder');

interface BaseMapProps {
  initialCenter?: [number, number]; // [lng, lat]
  initialZoom?: number;
  initialPitch?: number;
  initialBearing?: number;
  viewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
    padding?: { top?: number; bottom?: number; left?: number; right?: number };
  };
  followUser?: boolean;
  followResumeMs?: number;
  followResetKey?: number;
  onMove?: (center: { lng: number; lat: number }, zoom: number, viewState?: any) => void;
  onClick?: (lng: number, lat: number, x: number, y: number) => void;
  className?: string;
  children?: React.ReactNode;
  hideControls?: boolean;
  mapStyle?: string;
  theme?: 'evasion' | 'default';
  antialias?: boolean;
  routeTrace?: [number, number][]; // Array of [lng, lat]
}

type MapViewState = NonNullable<BaseMapProps['viewState']> & {
  padding?: { top?: number; bottom?: number; left?: number; right?: number };
};

// Internal component to sync state between react-map-gl and our custom context
function MapStateSync({
  onMove,
  onClick,
  setCustomMap
}: {
  onMove?: (center: { lng: number; lat: number }, zoom: number, viewState?: any) => void;
  onClick?: (lng: number, lat: number, x: number, y: number) => void;
  setCustomMap: (map: mapboxgl.Map | null) => void;
}) {
  const { current: map } = useReactMapGL();

  useEffect(() => {
    if (map) {
      setCustomMap(map.getMap());
    }
    return () => setCustomMap(null);
  }, [map, setCustomMap]);

  return null;
}

function MapThemeSync({ enabled }: { enabled: boolean }) {
  const { current: mapRef } = useReactMapGL();

  useEffect(() => {
    if (!mapRef || !enabled) return;
    const map = mapRef.getMap();

    const applyTheme = () => {
      applyEvasionMapTheme(map);
    };

    if (map.isStyleLoaded()) {
      applyTheme();
    }

    map.on('style.load', applyTheme);
    return () => {
      map.off('style.load', applyTheme);
    };
  }, [mapRef, enabled]);

  return null;
}

function BaseMapInner({
  initialCenter = [-118.2437, 34.0522], // Los Angeles default [lng, lat]
  initialZoom = 12,
  initialPitch = 0,
  initialBearing = 0,
  viewState: externalViewState,
  followUser = false,
  followResumeMs = 6000,
  followResetKey,
  onMove,
  onClick,
  className = 'h-full w-full',
  children,
  hideControls = false,
  mapStyle = "mapbox://styles/mapbox/dark-v11",
  theme = 'evasion',
  antialias = true,
  routeTrace
}: BaseMapProps) {
  const { setMap } = useMapContext();
  const [internalViewState, setInternalViewState] = useState<MapViewState>({
    longitude: initialCenter[0],
    latitude: initialCenter[1],
    zoom: initialZoom,
    pitch: initialPitch,
    bearing: initialBearing
  });
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const followTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const viewState = (!followUser && externalViewState) ? externalViewState : internalViewState;

  if (MAPBOX_TOKEN_INVALID) {
    return (
      <div className={`flex items-center justify-center bg-zinc-950 text-red-500 p-4 border border-red-900 ${className}`}>
        Error: NEXT_PUBLIC_MAPBOX_TOKEN is missing or a placeholder. Set a real Mapbox token and restart the dev server.
      </div>
    );
  }

  useEffect(() => {
    if (!followUser || !externalViewState || isUserInteracting) return;
    setInternalViewState(prev => ({
      ...prev,
      ...externalViewState,
      padding: externalViewState.padding ?? prev.padding,
    }));
  }, [
    followUser,
    isUserInteracting,
    externalViewState?.longitude,
    externalViewState?.latitude,
    externalViewState?.zoom,
    externalViewState?.pitch,
    externalViewState?.bearing,
    externalViewState?.padding?.top,
    externalViewState?.padding?.bottom,
    externalViewState?.padding?.left,
    externalViewState?.padding?.right
  ]);

  useEffect(() => {
    if (!followUser || followResetKey === undefined) return;
    if (followTimeoutRef.current) {
      clearTimeout(followTimeoutRef.current);
      followTimeoutRef.current = null;
    }
    setIsUserInteracting(false);
    if (externalViewState) {
      setInternalViewState(prev => ({
        ...prev,
        ...externalViewState,
        padding: externalViewState.padding ?? prev.padding,
      }));
    }
  }, [
    followUser,
    followResetKey,
    externalViewState?.longitude,
    externalViewState?.latitude,
    externalViewState?.zoom,
    externalViewState?.pitch,
    externalViewState?.bearing,
    externalViewState?.padding?.top,
    externalViewState?.padding?.bottom,
    externalViewState?.padding?.left,
    externalViewState?.padding?.right
  ]);

  useEffect(() => {
    return () => {
      if (followTimeoutRef.current) {
        clearTimeout(followTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`} style={{ minHeight: '400px' }}>
      <Map
        {...viewState}
        antialias={antialias}
        onMove={(evt: ViewStateChangeEvent) => {
          if (!externalViewState || followUser) {
            setInternalViewState(evt.viewState);
          }
          if (onMove) {
            onMove(
              { lng: evt.viewState.longitude, lat: evt.viewState.latitude },
              evt.viewState.zoom,
              evt.viewState
            );
          }
        }}
        onMoveStart={() => {
          if (!followUser) return;
          setIsUserInteracting(true);
          if (followTimeoutRef.current) {
            clearTimeout(followTimeoutRef.current);
          }
        }}
        onMoveEnd={() => {
          if (!followUser) return;
          if (followTimeoutRef.current) {
            clearTimeout(followTimeoutRef.current);
          }
          followTimeoutRef.current = setTimeout(() => {
            setIsUserInteracting(false);
          }, followResumeMs);
        }}
        onClick={evt => {
          if (onClick) {
            onClick(evt.lngLat.lng, evt.lngLat.lat, evt.point.x, evt.point.y);
          }
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        reuseMaps
        attributionControl={false}
        onError={(e) => {
          console.error("Mapbox Error:", e);
          if (e.error?.message?.includes('401') || e.error?.status === 401) {
            alert("Map Error: Invalid Token. Check your Netlify environment variables.");
          }
        }}
      >
        {!hideControls && (
          <>
            <NavigationControl position="top-right" showCompass={true} />
            <ScaleControl position="bottom-left" />
          </>
        )}

        <MapStateSync
          onMove={onMove}
          onClick={onClick}
          setCustomMap={setMap as any}
        />

        <MapThemeSync enabled={theme === 'evasion'} />

        {/* Route Trace Layer */}
        {routeTrace && routeTrace.length > 1 && (
          <Source
            id="route-trace-source"
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routeTrace
              }
            }}
          >
            <Layer
              id="route-trace-layer"
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#8B5CF6', // Evasion Purple
                'line-width': 4,
                'line-opacity': 0.8,
                'line-blur': 1
              }}
            />
          </Source>
        )}

        {children}
      </Map>

      {/* Custom attribution styling if needed, otherwise Mapbox default is fine */}
      <style jsx global>{`
        .mapboxgl-ctrl-group {
          background-color: rgba(6, 4, 10, 0.9) !important;
          border: 1px solid rgba(139, 92, 246, 0.2) !important;
        }
        .mapboxgl-ctrl-icon {
          filter: invert(1) !important; /* Make icons white */
        }
      `}</style>
    </div>
  );
}

export function BaseMap(props: BaseMapProps) {
  return (
    <MapProvider>
      <BaseMapInner {...props} />
    </MapProvider>
  );
}
