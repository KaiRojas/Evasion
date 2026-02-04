/**
 * Real-time Hook
 * Manages Socket.io connection for live updates
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useLocationStore } from '@/stores';
import { useAuth } from '@/hooks/use-auth';
import { 
  getSocket, 
  connectSocket, 
  disconnectSocket, 
  broadcastLocation,
  stopBroadcasting as stopSocketBroadcast,
} from '@/lib/socket';
import type { LiveUserPin, PoliceAlert } from '@/types';

interface UseRealtimeOptions {
  autoConnect?: boolean;
  broadcastInterval?: number; // ms
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { autoConnect = true, broadcastInterval = 3000 } = options;
  const { user, isAuthenticated } = useAuth();
  const { 
    currentLocation, 
    isBroadcasting,
    updateLivePin, 
    removeLivePin,
    addPoliceAlert,
    updatePoliceAlert,
    removePoliceAlert,
    clearExpiredAlerts,
  } = useLocationStore();
  
  const broadcastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastBroadcastRef = useRef<{ lat: number; lng: number } | null>(null);

  // Set up socket event listeners
  useEffect(() => {
    if (!autoConnect || !isAuthenticated) return;

    const socket = connectSocket();

    // Friend location updates
    socket.on('friend:location', (data: LiveUserPin) => {
      updateLivePin(data);
    });

    socket.on('friend:offline', (userId: string) => {
      removeLivePin(userId);
    });

    // Police alerts
    socket.on('alert:new', (alert: PoliceAlert) => {
      addPoliceAlert(alert);
    });

    socket.on('alert:confirmed', (alert: PoliceAlert) => {
      updatePoliceAlert(alert);
    });

    socket.on('alert:expired', (alertId: string) => {
      removePoliceAlert(alertId);
    });

    // Clean up expired alerts periodically
    const cleanupInterval = setInterval(clearExpiredAlerts, 60000);

    return () => {
      disconnectSocket();
      clearInterval(cleanupInterval);
    };
  }, [autoConnect, isAuthenticated, updateLivePin, removeLivePin, addPoliceAlert, updatePoliceAlert, removePoliceAlert, clearExpiredAlerts]);

  // Broadcast location when enabled
  useEffect(() => {
    if (!isBroadcasting || !currentLocation) {
      if (broadcastTimerRef.current) {
        clearInterval(broadcastTimerRef.current);
        broadcastTimerRef.current = null;
      }
      return;
    }

    const broadcast = () => {
      if (!currentLocation) return;

      // Only broadcast if moved significantly (> 10 meters)
      const last = lastBroadcastRef.current;
      if (last) {
        const dLat = Math.abs(currentLocation.latitude - last.lat);
        const dLng = Math.abs(currentLocation.longitude - last.lng);
        const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111000; // meters
        if (distance < 10) return;
      }

      broadcastLocation(currentLocation);
      lastBroadcastRef.current = {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      };
    };

    // Broadcast immediately
    broadcast();

    // Then on interval
    broadcastTimerRef.current = setInterval(broadcast, broadcastInterval);

    return () => {
      if (broadcastTimerRef.current) {
        clearInterval(broadcastTimerRef.current);
      }
    };
  }, [isBroadcasting, currentLocation, broadcastInterval]);

  // Stop broadcasting on unmount or when disabled
  useEffect(() => {
    return () => {
      if (isBroadcasting) {
        stopSocketBroadcast();
      }
    };
  }, [isBroadcasting]);

  const startBroadcasting = useCallback(() => {
    useLocationStore.getState().setBroadcasting(true);
  }, []);

  const stopBroadcasting = useCallback(() => {
    useLocationStore.getState().setBroadcasting(false);
    stopSocketBroadcast();
    lastBroadcastRef.current = null;
  }, []);

  return {
    socket: getSocket(),
    isConnected: getSocket().connected,
    startBroadcasting,
    stopBroadcasting,
    isBroadcasting,
  };
}
