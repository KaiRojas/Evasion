/**
 * Geolocation Hook
 * Track user's real-time GPS position
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Coordinates } from '@/types';

interface GeolocationState {
  location: Coordinates | null;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

const defaultOptions: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
  watchPosition: false,
};

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  
  const [state, setState] = useState<GeolocationState>({
    location: null,
    heading: null,
    speed: null,
    accuracy: null,
    error: null,
    isLoading: true,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  });

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState((prev) => ({
      ...prev,
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      heading: position.coords.heading,
      speed: position.coords.speed ? position.coords.speed * 2.237 : null, // m/s to mph
      accuracy: position.coords.accuracy,
      error: null,
      isLoading: false,
    }));
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage: string;
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location access.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
      default:
        errorMessage = 'An unknown error occurred.';
    }
    
    setState((prev) => ({
      ...prev,
      error: errorMessage,
      isLoading: false,
    }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser.',
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));
    
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: opts.enableHighAccuracy,
        timeout: opts.timeout,
        maximumAge: opts.maximumAge,
      }
    );
  }, [state.isSupported, handleSuccess, handleError, opts]);

  useEffect(() => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser.',
        isLoading: false,
      }));
      return;
    }

    let watchId: number | undefined;

    if (opts.watchPosition) {
      watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy: opts.enableHighAccuracy,
          timeout: opts.timeout,
          maximumAge: opts.maximumAge,
        }
      );
    } else {
      getCurrentPosition();
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [opts.watchPosition, opts.enableHighAccuracy, opts.timeout, opts.maximumAge]);

  return {
    ...state,
    refresh: getCurrentPosition,
  };
}
