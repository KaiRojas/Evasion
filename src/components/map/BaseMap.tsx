import { useEffect, useState } from 'react';
import { MapProvider, useMapContext } from './MapProvider';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, ZoomControl, ScaleControl, useMap } from 'react-leaflet';

// Fix for default marker icons in Leaflet with Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

interface BaseMapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  onMove?: (center: { lng: number; lat: number }, zoom: number) => void;
  onClick?: (lng: number, lat: number) => void;
  className?: string;
  children?: React.ReactNode;
}

// Controller component to sync our custom MapContext and handle events
function MapEvents({
  onMove,
  onClick,
  setMap
}: {
  onMove?: (center: { lng: number; lat: number }, zoom: number) => void;
  onClick?: (lng: number, lat: number) => void;
  setMap: (map: L.Map | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    setMap(map);
    return () => setMap(null);
  }, [map, setMap]);

  useEffect(() => {
    if (!onMove && !onClick) return;

    const handleMoveEnd = () => {
      if (onMove) {
        const center = map.getCenter();
        onMove({ lng: center.lng, lat: center.lat }, map.getZoom());
      }
    };

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (onClick) {
        onClick(e.latlng.lng, e.latlng.lat);
      }
    };

    map.on('moveend', handleMoveEnd);
    map.on('click', handleClick);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('click', handleClick);
    };
  }, [map, onMove, onClick]);

  return null;
}

function BaseMapInner({
  initialCenter = [-118.2437, 34.0522], // Los Angeles default
  initialZoom = 12,
  onMove,
  onClick,
  className = 'h-full w-full',
  children,
}: BaseMapProps) {
  const { setMap } = useMapContext();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className={`bg-zinc-950 ${className}`} style={{ minHeight: '400px' }} />
    );
  }

  return (
    <div className={`relative ${className}`} style={{ minHeight: '400px' }}>
      <MapContainer
        center={[initialCenter[1], initialCenter[0]]} // [lat, lng]
        zoom={initialZoom}
        zoomControl={false}
        className="absolute inset-0 w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        <ZoomControl position="topright" />
        <ScaleControl position="bottomleft" />

        <MapEvents onMove={onMove} onClick={onClick} setMap={setMap as any} />

        {children}
      </MapContainer>

      {/* Custom dark theme overrides for Leaflet controls */}
      <style jsx global>{`
        .leaflet-control-zoom a {
          background-color: rgba(6, 4, 10, 0.9) !important;
          color: #F5F5F4 !important;
          border-color: rgba(139, 92, 246, 0.2) !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: rgba(139, 92, 246, 0.3) !important;
        }
        .leaflet-control-scale-line {
          background-color: rgba(6, 4, 10, 0.8) !important;
          color: #F5F5F4 !important;
          border-color: rgba(139, 92, 246, 0.3) !important;
        }
        .leaflet-control-attribution {
          background-color: rgba(6, 4, 10, 0.8) !important;
          color: #888 !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #8B5CF6 !important;
        }
        .leaflet-container {
          background-color: #06040A !important;
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
