'use client';

import { useEffect, useRef, useState } from 'react';
import { useMap } from './MapProvider';
import type mapboxgl from 'mapbox-gl';

interface AreaSelectionToolProps {
  onAreaSelected: (bounds: [number, number, number, number]) => void;
  onClearSelection: () => void;
}

export function AreaSelectionTool({
  onAreaSelected,
  onClearSelection,
}: AreaSelectionToolProps) {
  const { map, isLoaded } = useMap();
  const [isDrawing, setIsDrawing] = useState(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Create canvas overlay for drawing rectangle
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '10';

    const mapContainer = map.getContainer();
    mapContainer.appendChild(canvas);
    canvasRef.current = canvas;

    // Resize canvas to match map
    const resizeCanvas = () => {
      const { width, height } = mapContainer.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Disable map dragging when drawing
    let currentRect: { x: number; y: number; width: number; height: number } | null = null;

    const handleMouseDown = (e: mapboxgl.MapMouseEvent) => {
      // Prevent map from panning
      e.preventDefault();

      const point = e.point;
      startPoint.current = { x: point.x, y: point.y };
      setIsDrawing(true);

      // Disable map interactions
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.boxZoom.disable();
      map.doubleClickZoom.disable();
    };

    const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
      if (!startPoint.current) return;

      const point = e.point;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear previous rectangle
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate rectangle dimensions
      const x = Math.min(startPoint.current.x, point.x);
      const y = Math.min(startPoint.current.y, point.y);
      const width = Math.abs(point.x - startPoint.current.x);
      const height = Math.abs(point.y - startPoint.current.y);

      currentRect = { x, y, width, height };

      // Draw rectangle
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'; // Blue fill
      ctx.fillRect(x, y, width, height);

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'; // Blue border
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    };

    const handleMouseUp = (e: mapboxgl.MapMouseEvent) => {
      if (!startPoint.current || !currentRect) {
        startPoint.current = null;
        setIsDrawing(false);

        // Re-enable map interactions
        map.dragPan.enable();
        map.scrollZoom.enable();
        map.boxZoom.enable();
        map.doubleClickZoom.enable();
        return;
      }

      // Convert canvas coordinates to geographic coordinates
      const sw = map.unproject([currentRect.x, currentRect.y + currentRect.height]);
      const ne = map.unproject([currentRect.x + currentRect.width, currentRect.y]);

      const bounds: [number, number, number, number] = [
        sw.lng, // minLng
        sw.lat, // minLat
        ne.lng, // maxLng
        ne.lat, // maxLat
      ];

      // Clear canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      startPoint.current = null;
      setIsDrawing(false);
      currentRect = null;

      // Re-enable map interactions
      map.dragPan.enable();
      map.scrollZoom.enable();
      map.boxZoom.enable();
      map.doubleClickZoom.enable();

      // Notify parent with bounds
      onAreaSelected(bounds);
    };

    // Add event listeners
    map.on('mousedown', handleMouseDown);
    map.on('mousemove', handleMouseMove);
    map.on('mouseup', handleMouseUp);

    // Change cursor
    const mapCanvas = map.getCanvas();
    mapCanvas.style.cursor = 'crosshair';

    // Cleanup
    return () => {
      map.off('mousedown', handleMouseDown);
      map.off('mousemove', handleMouseMove);
      map.off('mouseup', handleMouseUp);

      // Re-enable map interactions
      map.dragPan.enable();
      map.scrollZoom.enable();
      map.boxZoom.enable();
      map.doubleClickZoom.enable();

      mapCanvas.style.cursor = '';

      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }

      window.removeEventListener('resize', resizeCanvas);
    };
  }, [map, isLoaded, onAreaSelected]);

  return null; // This component doesn't render anything visible
}
