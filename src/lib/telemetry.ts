export interface TelemetryPoint {
    lat: number;
    lng: number;
    timestamp: number;
    speed: number; // mph
    elevation: number; // meters
    brakePressure: number; // 0-100
    acceleration: number; // G-force
    heading: number;
}

export interface DriveTelemetry {
    id: string;
    points: TelemetryPoint[];
    stats: {
        avgSpeed: number;
        maxSpeed: number;
        totalDistance: number;
        duration: number;
        elevationDelta: number;
        maxGForce: number;
        performanceDelta: number; // % relative to optimal
    };
}

export function generateMockTelemetry(id: string): DriveTelemetry {
    if (id === 'cannonball') {
        return generateCannonballMock(id);
    }
    const points: TelemetryPoint[] = [];
    const startTime = Date.now() - 3600000;
    const numPoints = 120; // 1 point per 30s for a 1h drive, or higher freq for detail

    // Starting near Mulholland Drive (LA)
    let lat = 34.1314;
    let lng = -118.4234;
    let elevation = 450;

    for (let i = 0; i < numPoints; i++) {
        // Create a curvy path
        lat += Math.sin(i * 0.1) * 0.002 + 0.001;
        lng += Math.cos(i * 0.1) * 0.002 + 0.001;

        // Mock speed with acceleration and braking zones
        const baseSpeed = 45;
        const speedVar = Math.sin(i * 0.3) * 25;
        const speed = Math.max(0, baseSpeed + speedVar);

        // Brake pressure increases when speed drops significantly
        const prevSpeed = i > 0 ? points[i - 1].speed : speed;
        const brakePressure = speed < prevSpeed - 5 ? Math.min(100, (prevSpeed - speed) * 10) : 0;

        // G-force based on speed and "turn radius" (mocked via variation)
        const acceleration = Math.abs(Math.sin(i * 0.5)) * 1.2;

        // Elevation change
        elevation += Math.sin(i * 0.05) * 5;

        points.push({
            lat,
            lng,
            timestamp: startTime + i * 30000,
            speed,
            elevation,
            brakePressure,
            acceleration,
            heading: (i * 10) % 360
        });
    }

    return {
        id,
        points,
        stats: {
            avgSpeed: 48.5,
            maxSpeed: 82.3,
            totalDistance: 12.4,
            duration: 2712, // seconds
            elevationDelta: 124,
            maxGForce: 1.24,
            performanceDelta: +2.4 // 2.4% faster than optimal line
        }
    };
}

function generateCannonballMock(id: string): DriveTelemetry {
    const points: TelemetryPoint[] = [];
    const startTime = Date.now() - 8 * 3600000;

    // Rough NYC -> LA corridor (illustrative, not precise)
    const waypoints: Array<[number, number]> = [
        [-74.012, 40.706],   // NYC
        [-77.0365, 38.8977], // DC
        [-81.6557, 30.3322], // Jacksonville
        [-84.3880, 33.7490], // Atlanta
        [-86.7816, 36.1627], // Nashville
        [-90.0715, 29.9511], // New Orleans
        [-95.3698, 29.7604], // Houston
        [-98.4936, 29.4241], // San Antonio
        [-106.6504, 35.0844], // Albuquerque
        [-112.0740, 33.4484], // Phoenix
        [-118.2437, 34.0522] // Los Angeles
    ];

    const pointsPerSegment = 120;
    let elevation = 10;
    let t = 0;

    for (let s = 0; s < waypoints.length - 1; s++) {
        const [lng1, lat1] = waypoints[s];
        const [lng2, lat2] = waypoints[s + 1];

        for (let i = 0; i < pointsPerSegment; i++) {
            const u = i / pointsPerSegment;
            const jitter = (Math.sin((t + i) * 0.15) * 0.08) + (Math.cos((t + i) * 0.23) * 0.05);
            const lat = lat1 + (lat2 - lat1) * u + jitter * 0.12;
            const lng = lng1 + (lng2 - lng1) * u + jitter * 0.18;

            const speedBase = 78 + Math.sin((t + i) * 0.2) * 12;
            const speed = Math.max(40, speedBase);
            const prevSpeed = points.length > 0 ? points[points.length - 1].speed : speed;
            const brakePressure = speed < prevSpeed - 8 ? Math.min(100, (prevSpeed - speed) * 6) : 0;
            const acceleration = Math.abs(Math.sin((t + i) * 0.35)) * 1.6;

            elevation += Math.sin((t + i) * 0.05) * 8;

            points.push({
                lat,
                lng,
                timestamp: startTime + points.length * 30000,
                speed,
                elevation,
                brakePressure,
                acceleration,
                heading: ((t + i) * 7) % 360
            });
        }

        t += pointsPerSegment;
    }

    return {
        id,
        points,
        stats: {
            avgSpeed: 78.2,
            maxSpeed: 112.4,
            totalDistance: 2800.0,
            duration: points.length * 30,
            elevationDelta: 620,
            maxGForce: 1.9,
            performanceDelta: +6.8
        }
    };
}
