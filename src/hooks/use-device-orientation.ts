'use client';

import { useState, useEffect } from 'react';

interface DeviceOrientationState {
    alpha: number | null; // Z-axis rotation (0-360)
    beta: number | null;  // X-axis rotation (-180 to 180) - Front/Back tilt
    gamma: number | null; // Y-axis rotation (-90 to 90) - Left/Right tilt
    isSupported: boolean;
    permissionGranted: boolean;
}

const DEFAULT_STATE: DeviceOrientationState = {
    alpha: null,
    beta: null,
    gamma: null,
    isSupported: false,
    permissionGranted: false,
};

export function useDeviceOrientation() {
    const [orientation, setOrientation] = useState<DeviceOrientationState>(DEFAULT_STATE);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.DeviceOrientationEvent) {
            setOrientation(prev => ({ ...prev, isSupported: false }));
            return;
        }

        // Check if permission is needed (iOS 13+)
        // @ts-ignore - requestPermission is non-standard
        const needsPermission = typeof DeviceOrientationEvent.requestPermission === 'function';

        if (!needsPermission) {
            setOrientation(prev => ({ ...prev, isSupported: true, permissionGranted: true }));
        }

        const handleOrientation = (event: DeviceOrientationEvent) => {
            setOrientation({
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma,
                isSupported: true,
                permissionGranted: true,
            });
        };

        if (!needsPermission) {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    const requestPermission = async () => {
        // @ts-ignore
        if (typeof DeviceOrientationEvent.requestPermission !== 'function') return true;

        try {
            // @ts-ignore
            const state = await DeviceOrientationEvent.requestPermission();
            if (state === 'granted') {
                setOrientation(prev => ({ ...prev, permissionGranted: true }));
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    return {
        ...orientation,
        requestPermission,
    };
}
