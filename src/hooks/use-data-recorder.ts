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
    const [geoPoints, setGeoPoints] = useState<GeoPoint[]>([]);
    const [sensorReadings, setSensorReadings] = useState<SensorData[]>([]);
    const [stats, setStats] = useState({ pointCount: 0, sensorCount: 0, fileSizeKB: 0 });

    // Refs for mutable state during recording loop
    const watchIdRef = useRef<number | null>(null);
    const motionBuffer = useRef<SensorData[]>([]);
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
        if (geoPoints.length === 0) return;

        const logData: DriveLog = {
            id: crypto.randomUUID(),
            startTime: geoPoints[0].timestamp,
            endTime: geoPoints[geoPoints.length - 1].timestamp,
            points: geoPoints,
            sensorReadings: sensorReadings
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
    }, [geoPoints, sensorReadings]);

    // Track device motion/orientation (High Frequency)
    useEffect(() => {
        if (!isRecording || simulate) return;

        const handleMotion = (e: DeviceMotionEvent) => {
            const reading: SensorData = {
                timestamp: Date.now(),
                acceleration: {
                    x: e.acceleration?.x ?? null,
                    y: e.acceleration?.y ?? null,
                    z: e.acceleration?.z ?? null
                },
                orientation: { alpha: null, beta: null, gamma: null } // Merged below
            };

            // We use a buffer ref to avoid React render loop overhead on 60fps events
            motionBuffer.current.push(reading);
        };

        const handleOrientation = (e: DeviceOrientationEvent) => {
            // Create a reading or merge with last if very close? 
            // For simplicity, we'll log orientation events separately or just attach to next motion
            // Actually, typically we just want to update a "current orientation" ref and attach it to motion events
            // But to be precise, let's just push to buffer.
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

        // Flush buffer to state periodically (e.g. every 1 sec) to update UI stats
        const flushInterval = setInterval(() => {
            if (motionBuffer.current.length > 0) {
                setSensorReadings(prev => [...prev, ...motionBuffer.current]);
                setStats(s => ({
                    ...s,
                    sensorCount: s.sensorCount + motionBuffer.current.length,
                    fileSizeKB: Math.round((JSON.stringify(geoPoints).length + JSON.stringify(sensorReadings).length) / 1024)
                }));
                motionBuffer.current = [];
            }
        }, 1000);

        return () => {
            window.removeEventListener('devicemotion', handleMotion);
            window.removeEventListener('deviceorientation', handleOrientation);
            clearInterval(flushInterval);
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
                setGeoPoints(prev => [...prev, newPoint]);
                setStats(s => ({ ...s, pointCount: s.pointCount + 1 }));
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

                setGeoPoints(prev => {
                    const newPoints = [...prev, newPoint];
                    return newPoints;
                });
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
        if (prevRecording.current && !isRecording && geoPoints.length > 0) {
            console.log("🛑 Recording stopped. Saving...");

            // Flush any remaining sensors
            const finalSensors = [...sensorReadings, ...motionBuffer.current];
            const finalPoints = geoPoints;

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
                distanceKm: 0, // Placeholder
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

            // Save to history (Note: useRunHistory needs update to handle DriveLog structure if different from before)
            // For now, we pass fullLog as "rawData"
            useRunHistory.getState().addRun(runMetadata, fullLog);

            // Auto download
            const blob = new Blob([JSON.stringify(fullLog, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `evasion-log-${runId.slice(0, 8)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } else if (isRecording && geoPoints.length === 0) {
            setGeoPoints([]);
            setSensorReadings([]);
            setStats({ pointCount: 0, sensorCount: 0, fileSizeKB: 0 });
            motionBuffer.current = [];
        }
        prevRecording.current = isRecording;
    }, [isRecording, geoPoints, sensorReadings]);

    return { points: geoPoints, stats, downloadLogs, requestPermissions };
}
