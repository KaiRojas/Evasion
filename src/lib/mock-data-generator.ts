/**
 * Mock Data Generator for Evasion V2
 * Provides fallback intelligence when the database is unreachable.
 */

export interface MockStats {
    overview: {
        totalStops: number;
        alcoholStops: number;
        accidentStops: number;
        searchStops: number;
        fatalStops: number;
        alcoholRate: string;
        accidentRate: string;
    };
    dateRange: {
        start: string;
        end: string;
    };
    peakTimes: {
        hour: number;
        hourLabel: string;
        day: string;
    };
    topLocations: Array<{ name: string; count: number }>;
    violationTypes: Array<{ type: string; count: number }>;
    vehicleMakes: Array<{ make: string; count: number }>;
    detectionMethods: Array<{ method: string; count: number; percentage: number }>;
}

export const getMockStats = (): MockStats => {
    const totalStops = 142850;
    const alcoholStops = 4231;
    const accidentStops = 8912;

    return {
        overview: {
            totalStops,
            alcoholStops,
            accidentStops,
            searchStops: 12430,
            fatalStops: 124,
            alcoholRate: ((alcoholStops / totalStops) * 100).toFixed(2) + '%',
            accidentRate: ((accidentStops / totalStops) * 100).toFixed(2) + '%',
        },
        dateRange: {
            start: '2025-01-01T00:00:00Z',
            end: '2026-02-06T23:00:00Z',
        },
        peakTimes: {
            hour: 23,
            hourLabel: '23:00',
            day: 'Saturday',
        },
        topLocations: [
            { name: 'Bethesda / MD-190', count: 18432 },
            { name: 'Silver Spring / US-29', count: 15120 },
            { name: 'Gaithersburg / I-270', count: 12891 },
            { name: 'Rockville / MD-355', count: 11412 },
            { name: 'Germantown / MD-118', count: 9842 },
        ],
        violationTypes: [
            { type: 'Speeding (Aggressive)', count: 54320 },
            { type: 'Reckless Driving', count: 24120 },
            { type: 'DUI / Controlled Substance', count: 4231 },
            { type: 'Equipment Violation', count: 21210 },
            { type: 'Mobile Phone / Distracted', count: 19730 },
        ],
        vehicleMakes: [
            { make: 'BMW', count: 28142 },
            { make: 'MERCEDES', count: 24983 },
            { make: 'HONDA', count: 21421 },
            { make: 'TOYOTA', count: 19120 },
            { make: 'LEXUS', count: 16943 },
        ],
        detectionMethods: [
            { method: 'Radar', count: 68432, percentage: 47.9 },
            { method: 'Laser', count: 42310, percentage: 29.6 },
            { method: 'Patrol', count: 15120, percentage: 10.6 },
            { method: 'VASCAR', count: 10842, percentage: 7.6 },
            { method: 'Automated', count: 6146, percentage: 4.3 },
        ],
    };
};

export const getMockTimePatterns = (type: 'hourly' | 'daily' | 'monthly') => {
    if (type === 'hourly') {
        return Array.from({ length: 24 }, (_, hour) => {
            // Create a realistic bell curve for enforcement (peaks at night and rush hour)
            const base = 100;
            const rushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19) ? 400 : 0;
            const nightShift = (hour >= 22 || hour <= 2) ? 600 : 0;
            const count = base + rushHour + nightShift + Math.floor(Math.random() * 200);

            return {
                hour,
                label: `${hour.toString().padStart(2, '0')}:00`,
                count,
                alcoholCount: hour >= 22 || hour <= 3 ? Math.floor(count * 0.15) : Math.floor(count * 0.01),
                accidentCount: hour >= 17 && hour <= 20 ? Math.floor(count * 0.08) : Math.floor(count * 0.03),
            };
        });
    }

    if (type === 'daily') {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return dayNames.map((label, day) => {
            const isWeekend = day === 0 || day === 6 || day === 5;
            const count = isWeekend ? 8500 + Math.floor(Math.random() * 2000) : 4500 + Math.floor(Math.random() * 1000);
            return {
                day,
                label,
                shortLabel: label.slice(0, 3),
                count,
                alcoholCount: isWeekend ? Math.floor(count * 0.12) : Math.floor(count * 0.02),
                accidentCount: isWeekend ? Math.floor(count * 0.07) : Math.floor(count * 0.04),
            };
        });
    }

    // Monthly
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((label, month) => ({
        month,
        label,
        count: 12000 + Math.floor(Math.random() * 5000),
        alcoholCount: 800 + Math.floor(Math.random() * 400),
        accidentCount: 500 + Math.floor(Math.random() * 300),
    }));
};

export const getMockPoints = (boundsStr: string) => {
    const [west, south, east, north] = boundsStr.split(',').map(Number);

    // Create more points for "Intelligence Map" feel
    const features = Array.from({ length: 150 }, (_, i) => {
        const isHighRisk = Math.random() > 0.8;
        const isAlcohol = Math.random() > 0.92;
        const isAccident = Math.random() > 0.95;

        return {
            type: 'Feature',
            id: `mock-${i}`,
            geometry: {
                type: 'Point',
                coordinates: [
                    west + Math.random() * (east - west),
                    south + Math.random() * (north - south),
                ],
            },
            properties: {
                violationType: isAlcohol ? 'DUI' : (isHighRisk ? 'Aggressive Speeding' : 'Citation'),
                description: isHighRisk ? 'Extreme speed recorded via LIDAR.' : 'Routine traffic stop.',
                alcohol: isAlcohol,
                accident: isAccident,
                stopDate: new Date().toISOString(),
                isSpeedRelated: isHighRisk,
                charge: isHighRisk ? `${Math.floor(Math.random() * 30) + 90} MPH in 55 MPH ZONE` : 'Speeding - 1-9 MPH over',
                subAgency: 'Rockville / MD-355',
            },
        };
    });

    return { type: 'FeatureCollection', features };
};
