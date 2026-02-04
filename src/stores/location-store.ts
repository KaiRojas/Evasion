/**
 * Location Store
 * Real-time location state management
 */

import { create } from 'zustand';
import type { Coordinates, LiveUserPin, PoliceAlert, MapBounds } from '@/types';

interface LocationState {
  // Current user location
  currentLocation: Coordinates | null;
  locationError: string | null;
  isTracking: boolean;
  isBroadcasting: boolean;
  
  // Map state
  mapBounds: MapBounds | null;
  mapZoom: number;
  mapCenter: Coordinates | null;
  
  // Live pins (friends on map)
  livePins: Map<string, LiveUserPin>;
  
  // Police alerts
  policeAlerts: Map<string, PoliceAlert>;
  
  // Actions
  setCurrentLocation: (location: Coordinates | null) => void;
  setLocationError: (error: string | null) => void;
  setTracking: (isTracking: boolean) => void;
  setBroadcasting: (isBroadcasting: boolean) => void;
  setMapBounds: (bounds: MapBounds | null) => void;
  setMapZoom: (zoom: number) => void;
  setMapCenter: (center: Coordinates | null) => void;
  
  // Live pin actions
  updateLivePin: (pin: LiveUserPin) => void;
  removeLivePin: (userId: string) => void;
  clearLivePins: () => void;
  
  // Police alert actions
  addPoliceAlert: (alert: PoliceAlert) => void;
  updatePoliceAlert: (alert: PoliceAlert) => void;
  removePoliceAlert: (alertId: string) => void;
  clearExpiredAlerts: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  // Initial state
  currentLocation: null,
  locationError: null,
  isTracking: false,
  isBroadcasting: false,
  mapBounds: null,
  mapZoom: 12,
  mapCenter: null,
  livePins: new Map(),
  policeAlerts: new Map(),
  
  // Location actions
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setLocationError: (error) => set({ locationError: error }),
  setTracking: (isTracking) => set({ isTracking }),
  setBroadcasting: (isBroadcasting) => set({ isBroadcasting }),
  
  // Map actions
  setMapBounds: (bounds) => set({ mapBounds: bounds }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  setMapCenter: (center) => set({ mapCenter: center }),
  
  // Live pin actions
  updateLivePin: (pin) => {
    const pins = new Map(get().livePins);
    pins.set(pin.userId, pin);
    set({ livePins: pins });
  },
  
  removeLivePin: (userId) => {
    const pins = new Map(get().livePins);
    pins.delete(userId);
    set({ livePins: pins });
  },
  
  clearLivePins: () => set({ livePins: new Map() }),
  
  // Police alert actions
  addPoliceAlert: (alert) => {
    const alerts = new Map(get().policeAlerts);
    alerts.set(alert.id, alert);
    set({ policeAlerts: alerts });
  },
  
  updatePoliceAlert: (alert) => {
    const alerts = new Map(get().policeAlerts);
    alerts.set(alert.id, alert);
    set({ policeAlerts: alerts });
  },
  
  removePoliceAlert: (alertId) => {
    const alerts = new Map(get().policeAlerts);
    alerts.delete(alertId);
    set({ policeAlerts: alerts });
  },
  
  clearExpiredAlerts: () => {
    const now = Date.now();
    const alerts = new Map(get().policeAlerts);
    
    alerts.forEach((alert, id) => {
      if (alert.expiresAt < now) {
        alerts.delete(id);
      }
    });
    
    set({ policeAlerts: alerts });
  },
}));
