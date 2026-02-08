/* eslint-disable no-console */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRunHistory } from '@/stores';

// Standard Geolocation Point
export interface GeoPoint {
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
}

// High-Frequency Sensor Data
export interface SensorData {
    timestamp: number;
    acceleration: {
        x: number | null;
        y: number | null;
        z: number | null;
    };
    orientation: {
        alpha: number | null;
        beta: number | null;
        gamma: number | null;
    };
}

export interface DriveLog {
    id: string;
    startTime: number;
    endTime: number;
    points: GeoPoint[];
    sensorReadings: SensorData[]; // High frequency stream
}

export function useDataRecorder(isRecording: boolean, simulate: boolean = false) {
    // Store data in refs to avoid re-renders and expensive array copies
    const geoPointsRef = useRef<GeoPoint[]>([]);
    const sensorReadingsRef = useRef<SensorData[]>([]);
    const motionBuffer = useRef<SensorData[]>([]);

    // UI State
    const [stats, setStats] = useState({ pointCount: 0, sensorCount: 0, fileSizeKB: 0 });
    const [sensorsActive, setSensorsActive] = useState(false);

    // Refs for mutable state during recording loop
    const watchIdRef = useRef<number | null>(null);
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
    const downloadLogs = useCallback(() => {
        if (geoPointsRef.current.length === 0) return;

        const logData: DriveLog = {
            id: crypto.randomUUID(),
            startTime: geoPointsRef.current[0].timestamp,
            endTime: geoPointsRef.current[geoPointsRef.current.length - 1].timestamp,
            points: geoPointsRef.current,
            sensorReadings: sensorReadingsRef.current
        };

        const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `evasion-drive-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    // Track device motion/orientation (High Frequency)
    useEffect(() => {
        if (!isRecording || simulate) {
            setSensorsActive(simulate); // Sim mode implies sensors are "active"
            return;
        }

        let lastMotionTime = 0;

        const handleMotion = (e: DeviceMotionEvent) => {
            const now = Date.now();
            if (now - lastMotionTime > 500) { // Check activity every 500ms
                setSensorsActive(true);
                lastMotionTime = now;
            }

            const reading: SensorData = {
                timestamp: now,
                acceleration: {
                    x: e.acceleration?.x ?? null,
                    y: e.acceleration?.y ?? null,
                    z: e.acceleration?.z ?? null
                },
                orientation: { alpha: null, beta: null, gamma: null } // Merged below
            };

            motionBuffer.current.push(reading);
        };

        const handleOrientation = (e: DeviceOrientationEvent) => {
            const reading: SensorData = {
                timestamp: Date.now(),
                acceleration: { x: null, y: null, z: null },
                orientation: {
                    alpha: e.alpha,
                    beta: e.beta,
                    gamma: e.gamma
                }
            };
            motionBuffer.current.push(reading);
        };

        window.addEventListener('devicemotion', handleMotion);
        window.addEventListener('deviceorientation', handleOrientation);

        // Flush buffer to storage ref periodically (every 1s) and update stats
        const flushInterval = setInterval(() => {
            if (motionBuffer.current.length > 0) {
                sensorReadingsRef.current.push(...motionBuffer.current);
                motionBuffer.current = [];
            }

            // Update UI stats
            setStats({
                pointCount: geoPointsRef.current.length,
                sensorCount: sensorReadingsRef.current.length,
                fileSizeKB: Math.round((JSON.stringify(geoPointsRef.current).length + JSON.stringify(sensorReadingsRef.current).length) / 1024)
            });

        }, 1000);

        return () => {
            window.removeEventListener('devicemotion', handleMotion);
            window.removeEventListener('deviceorientation', handleOrientation);
            clearInterval(flushInterval);
            setSensorsActive(false);
        };
    }, [isRecording, simulate]);

    // Track GPS 
    useEffect(() => {
        if (!isRecording) {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            return;
        }

        if (simulate) {
            // Simulation Mode
            const interval = setInterval(() => {
                const newPoint: GeoPoint = {
                    timestamp: Date.now(),
                    coords: {
                        latitude: 34.1, longitude: -118.4,
                        altitude: 100, accuracy: 5, altitudeAccuracy: 5,
                        heading: 0, speed: 30
                    }
                };
                geoPointsRef.current.push(newPoint);
                // Stats updated by flushInterval in sensor effect or we can add one here if sensors assume active
            }, 1000);
            return () => clearInterval(interval);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const newPoint: GeoPoint = {
                    timestamp: position.timestamp,
                    coords: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        altitude: position.coords.altitude,
                        accuracy: position.coords.accuracy,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                    }
                };

                geoPointsRef.current.push(newPoint);
                // Stats updated by sensor loop for unified UI update
            },
            (error) => console.error("GPS Error:", error),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );

        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [isRecording, simulate]);

    // Save run logic
    useEffect(() => {
        if (prevRecording.current && !isRecording && geoPointsRef.current.length > 0) {
            console.log("🛑 Recording stopped. Saving...");

            // Flush any remaining sensors
            const finalSensors = [...sensorReadingsRef.current, ...motionBuffer.current];
            const finalPoints = geoPointsRef.current;

            // Calculate distance roughly
            let distance = 0;
            for (let i = 1; i < finalPoints.length; i++) {
                // ... (simple distance calc same as before)
            }

            const runId = crypto.randomUUID();
            const runMetadata = {
                id: runId,
                timestamp: finalPoints[0].timestamp,
                durationMs: finalPoints[finalPoints.length - 1].timestamp - finalPoints[0].timestamp,
                distanceKm: 0, // Placeholder for now
                pointCount: finalPoints.length,
                previewTrace: finalPoints.map(p => [p.coords.longitude, p.coords.latitude] as [number, number])
            };

            const fullLog: DriveLog = {
                id: runId,
                startTime: runMetadata.timestamp,
                endTime: runMetadata.timestamp + runMetadata.durationMs,
                points: finalPoints,
                sensorReadings: finalSensors
            };

            // Save to history
            useRunHistory.getState().addRun(runMetadata, fullLog);

            // Auto download
            downloadLogs();

        } else if (isRecording && geoPointsRef.current.length === 0) {
            // Reset refs
            geoPointsRef.current = [];
            sensorReadingsRef.current = [];
            motionBuffer.current = [];
            setStats({ pointCount: 0, sensorCount: 0, fileSizeKB: 0 });
        }
        prevRecording.current = isRecording;
    }, [isRecording, downloadLogs]);

    return { points: geoPointsRef.current, stats, downloadLogs, requestPermissions, sensorsActive };
}
