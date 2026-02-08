/* eslint-disable no-console */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRunHistory } from '@/stores';

export interface DataPoint {
    timestamp: number;
    coords: {
        latitude: number;
        longitude: number;
        altitude: number | null;
        accuracy: number;
        altitudeAccuracy: number | null;
        heading: number | null;
        speed: number | null;
    };
    sensors?: {
        acceleration?: {
            x: number | null;
            y: number | null;
            z: number | null;
        };
        orientation?: {
            alpha: number | null;
            beta: number | null;
            gamma: number | null;
        };
    };
}

export function useDataRecorder(isRecording: boolean, simulate: boolean = false) {
    const [points, setPoints] = useState<DataPoint[]>([]);
    const [stats, setStats] = useState({ pointCount: 0, fileSizeKB: 0 });
    const watchIdRef = useRef<number | null>(null);
    const motionRef = useRef<NonNullable<DataPoint['sensors']>>({});
    const prevRecording = useRef(isRecording);

    // Request permissions for iOS 13+
    const requestPermissions = useCallback(async () => {
        if (typeof DeviceMotionEvent !== 'undefined' && 'requestPermission' in DeviceMotionEvent) {
            try {
                // @ts-ignore - non-standard iOS API
                const response = await (DeviceMotionEvent as any).requestPermission();
                console.log('iOS Motion Permission:', response);
                return response === 'granted';
            } catch (error) {
                console.error('Error requesting motion permission:', error);
                return false;
            }
        }
        return true; // Non-iOS or older devices don't need explicit permission
    }, []);

    // Manual download trigger
    const downloadLogs = useCallback((data?: DataPoint[]) => {
        const dataToSave = data || points;
        if (dataToSave.length === 0) return;

        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evasion-drive-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [points]);

    // Track device motion/orientation (if available)
    useEffect(() => {
        if (!isRecording) return;

        const handleMotion = (e: DeviceMotionEvent) => {
            motionRef.current.acceleration = {
                x: e.acceleration?.x ?? null,
                y: e.acceleration?.y ?? null,
                z: e.acceleration?.z ?? null
            };
        };

        const handleOrientation = (e: DeviceOrientationEvent) => {
            motionRef.current.orientation = {
                alpha: e.alpha,
                beta: e.beta,
                gamma: e.gamma
            };
        };

        window.addEventListener('devicemotion', handleMotion);
        window.addEventListener('deviceorientation', handleOrientation);

        return () => {
            window.removeEventListener('devicemotion', handleMotion);
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [isRecording]);

    // Track GPS with high frequency
    useEffect(() => {
        if (!isRecording) {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            return;
        }

        if (simulate) {
            // Simulation Mode: Generate points in a circle around a starting point (or LA)
            console.log("🤖 Simulation Mode Active");
            const startLat = 34.1;
            const startLng = -118.4;
            const radius = 0.01; // ~1km
            let angle = 0;

            const interval = setInterval(() => {
                angle += 0.1;
                const newPoint: DataPoint = {
                    timestamp: Date.now(),
                    coords: {
                        latitude: startLat + radius * Math.cos(angle),
                        longitude: startLng + radius * Math.sin(angle),
                        altitude: 100,
                        accuracy: 5,
                        altitudeAccuracy: 5,
                        heading: (angle * 180 / Math.PI + 90) % 360,
                        speed: 30, // 30 m/s ~ 60mph
                    },
                    sensors: {
                        acceleration: { x: 0, y: 0, z: 9.8 },
                        orientation: { alpha: 0, beta: 0, gamma: 0 }
                    }
                };

                setPoints(prev => {
                    const newPoints = [...prev, newPoint];
                    setStats({
                        pointCount: newPoints.length,
                        fileSizeKB: Math.round(JSON.stringify(newPoints).length / 1024)
                    });
                    return newPoints;
                });
            }, 1000); // 1 point per second

            return () => clearInterval(interval);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const newPoint: DataPoint = {
                    timestamp: position.timestamp,
                    coords: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        altitude: position.coords.altitude,
                        accuracy: position.coords.accuracy,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                    },
                    sensors: { ...motionRef.current } // Capture latest sensor state
                };

                setPoints(prev => {
                    const newPoints = [...prev, newPoint];
                    setStats({
                        pointCount: newPoints.length,
                        fileSizeKB: Math.round(JSON.stringify(newPoints).length / 1024)
                    });
                    return newPoints;
                });
            },
            (error) => console.error("GPS Error:", error),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [isRecording]);

    // Save run when stopping - Moved after downloadLogs definition
    useEffect(() => {
        // Check if we just stopped recording
        if (prevRecording.current && !isRecording && points.length > 0) {
            console.log("🛑 Recording stopped. Points:", points.length);

            // Calculate distance roughly
            let distance = 0;
            for (let i = 1; i < points.length; i++) {
                const p1 = points[i - 1].coords;
                const p2 = points[i].coords;
                // Simple Euclidean approximation for short distances
                const R = 6371e3; // metres
                const φ1 = p1.latitude * Math.PI / 180;
                const φ2 = p2.latitude * Math.PI / 180;
                const Δφ = (p2.latitude - p1.latitude) * Math.PI / 180;
                const Δλ = (p2.longitude - p1.longitude) * Math.PI / 180;
                const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                distance += R * c;
            }

            const runId = crypto.randomUUID();
            const timestamp = points[0].timestamp;
            const durationMs = points[points.length - 1].timestamp - timestamp;

            const runMetadata = {
                id: runId,
                timestamp,
                durationMs,
                distanceKm: distance / 1000,
                pointCount: points.length,
                previewTrace: points.map(p => [p.coords.longitude, p.coords.latitude] as [number, number])
            };

            // Save to history
            console.log("💾 Saving run to history:", runId);
            useRunHistory.getState().addRun(runMetadata, points);

            // Auto-download as backup
            downloadLogs(points);
        } else if (isRecording && points.length === 0) {
            // Started recording
            console.log("🎥 Recording started...");
            setPoints([]);
            setStats({ pointCount: 0, fileSizeKB: 0 });
        }

        prevRecording.current = isRecording;
    }, [isRecording, points, downloadLogs]);

    return {
        points,
        stats,
        downloadLogs,
        requestPermissions
    };
}
