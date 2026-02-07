import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getMockPoints } from '@/lib/mock-data-generator';

/**
 * GET /api/analytics/points
 * Returns police stop points for map visualization
 * Uses server-side pagination and filtering for performance
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boundsStr = searchParams.get('bounds') || '-180,-90,180,90';

    // Check if we should force mock mode
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      return NextResponse.json({
        success: true,
        data: getMockPoints(boundsStr),
        source: 'mock'
      });
    }

    // Existing logic...
    const zoom = parseInt(searchParams.get('zoom') || '10');
    const noSampling = searchParams.get('noSampling') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '5000'), noSampling ? 50000 : 10000);
    const violationType = searchParams.get('violationType');
    const hasAlcohol = searchParams.get('hasAlcohol');
    const hasAccident = searchParams.get('hasAccident');
    const hourStart = searchParams.get('hourStart') ? parseInt(searchParams.get('hourStart')!) : null;
    const hourEnd = searchParams.get('hourEnd') ? parseInt(searchParams.get('hourEnd')!) : null;
    const dayOfWeek = searchParams.get('dayOfWeek') ? parseInt(searchParams.get('dayOfWeek')!) : null;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null;

    // Speed-related filters
    const speedOnly = searchParams.get('speedOnly') === 'true';
    const detectionMethod = searchParams.get('detectionMethod');
    const minSpeedOver = searchParams.get('minSpeedOver') ? parseInt(searchParams.get('minSpeedOver')!) : null;
    const speedTrapsOnly = searchParams.get('speedTrapsOnly') === 'true';
    const vehicleMake = searchParams.get('vehicleMake');
    const searchConducted = searchParams.get('searchConducted') === 'true';
    const vehicleMarking = searchParams.get('vehicleMarking'); // 'marked' | 'unmarked' | null

    // Test connection
    await prisma.$connect();

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: (string | number | boolean)[] = [];
    let paramIndex = 1;

    // Bounds filter (required for detailed views)
    if (boundsStr) {
      const bounds = boundsStr.split(',').map(Number);
      if (bounds.length === 4) {
        const [minLng, minLat, maxLng, maxLat] = bounds;
        conditions.push(`latitude >= $${paramIndex++} AND latitude <= $${paramIndex++}`);
        conditions.push(`longitude >= $${paramIndex++} AND longitude <= $${paramIndex++}`);
        params.push(minLat, maxLat, minLng, maxLng);
      }
    }

    // Violation type filter
    if (violationType) {
      conditions.push(`violation_type = $${paramIndex++}`);
      params.push(violationType);
    }

    // Alcohol filter
    if (hasAlcohol === 'true') {
      conditions.push(`alcohol = true`);
    } else if (hasAlcohol === 'false') {
      conditions.push(`alcohol = false`);
    }

    // Accident filter
    if (hasAccident === 'true') {
      conditions.push(`accident = true`);
    } else if (hasAccident === 'false') {
      conditions.push(`accident = false`);
    }

    // Time filters
    if (hourStart !== null && hourEnd !== null) {
      if (hourStart <= hourEnd) {
        conditions.push(`EXTRACT(HOUR FROM stop_time) >= $${paramIndex++} AND EXTRACT(HOUR FROM stop_time) <= $${paramIndex++}`);
        params.push(hourStart, hourEnd);
      } else {
        conditions.push(`(EXTRACT(HOUR FROM stop_time) >= $${paramIndex++} OR EXTRACT(HOUR FROM stop_time) <= $${paramIndex++})`);
        params.push(hourStart, hourEnd);
      }
    }

    if (dayOfWeek !== null) {
      conditions.push(`EXTRACT(DOW FROM stop_date) = $${paramIndex++}`);
      params.push(dayOfWeek);
    }

    // Year filter
    if (year !== null) {
      conditions.push(`EXTRACT(YEAR FROM stop_date) = $${paramIndex++}`);
      params.push(year);
    }

    // Speed-only filter (filters by is_speed_related column)
    if (speedOnly) {
      conditions.push(`is_speed_related = true`);
    }

    // Detection method filter
    if (detectionMethod) {
      conditions.push(`detection_method = $${paramIndex++}`);
      params.push(detectionMethod);
    }

    // Minimum speed over limit filter
    if (minSpeedOver !== null) {
      conditions.push(`speed_over >= $${paramIndex++}`);
      params.push(minSpeedOver);
    }

    // Vehicle make filter
    if (vehicleMake && vehicleMake !== 'all') {
      conditions.push(`vehicle_make = $${paramIndex++}`);
      params.push(vehicleMake);
    }

    // Search conducted filter
    if (searchConducted) {
      conditions.push(`search_conducted = true`);
    }

    // Vehicle marking filter (marked vs unmarked police vehicles)
    if (vehicleMarking === 'marked') {
      // Marked vehicles: arrest_type contains "Marked" but NOT "Unmarked"
      conditions.push(`arrest_type ILIKE '%Marked%' AND arrest_type NOT ILIKE '%Unmarked%'`);
    } else if (vehicleMarking === 'unmarked') {
      // Unmarked vehicles: arrest_type contains "Unmarked"
      conditions.push(`arrest_type ILIKE '%Unmarked%'`);
    }

    // Speed trap detection - stationary detection methods only
    if (speedTrapsOnly) {
      conditions.push(`is_speed_related = true`);
      conditions.push(`(
        arrest_type LIKE 'E -%' OR 
        arrest_type LIKE 'F -%' OR 
        arrest_type LIKE 'G -%' OR 
        arrest_type LIKE 'H -%' OR 
        arrest_type LIKE 'Q -%' OR 
        arrest_type LIKE 'R -%'
      )`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sampling logic...
    let samplingClause = '';
    let dynamicLimit = limit;

    if (!noSampling) {
      if (zoom < 6) {
        samplingClause = 'AND MOD(ABS(HASHTEXT(id::text)), 500) = 0';
        dynamicLimit = 2000;
      } else if (zoom < 8) {
        samplingClause = 'AND MOD(ABS(HASHTEXT(id::text)), 200) = 0';
        dynamicLimit = 3000;
      } else if (zoom < 10) {
        samplingClause = 'AND MOD(ABS(HASHTEXT(id::text)), 50) = 0';
        dynamicLimit = 5000;
      } else if (zoom < 11) {
        samplingClause = 'AND MOD(ABS(HASHTEXT(id::text)), 20) = 0';
        dynamicLimit = 6000;
      } else if (zoom < 12) {
        samplingClause = 'AND MOD(ABS(HASHTEXT(id::text)), 8) = 0';
        dynamicLimit = 8000;
      } else if (zoom < 13) {
        samplingClause = 'AND MOD(ABS(HASHTEXT(id::text)), 4) = 0';
        dynamicLimit = 10000;
      }
    }

    const query = `
      SELECT 
        id, latitude as lat, longitude as lng, violation_type, description, sub_agency,
        stop_date, stop_time, alcohol, accident, vehicle_make, vehicle_model, vehicle_year,
        is_speed_related, recorded_speed, posted_limit, speed_over, detection_method, arrest_type
      FROM traffic_violations
      ${whereClause}
      ${samplingClause ? (whereClause ? samplingClause : 'WHERE ' + samplingClause.substring(4)) : ''}
      LIMIT $${paramIndex}
    `;
    params.push(dynamicLimit);

    const results = await prisma.$queryRawUnsafe<any[]>(query, ...params);

    // Handle empty database case with mock fallback
    if (results.length === 0 && !boundsStr.includes(',')) {
      return NextResponse.json({
        success: true,
        data: getMockPoints(boundsStr),
        source: 'mock_fallback'
      });
    }

    // Format as GeoJSON...
    const features = results.map(r => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [r.lng, r.lat] },
      properties: {
        id: r.id,
        violationType: r.violation_type || 'Unknown',
        description: r.description,
        subAgency: r.sub_agency,
        date: r.stop_date,
        time: r.stop_time,
        alcohol: r.alcohol,
        accident: r.accident,
        vehicle: r.vehicle_make
          ? `${r.vehicle_year || ''} ${r.vehicle_make} ${r.vehicle_model || ''}`.trim()
          : null,
        isSpeedRelated: r.is_speed_related,
        recordedSpeed: r.recorded_speed,
        postedLimit: r.posted_limit,
        speedOver: r.speed_over,
        detectionMethod: r.detection_method,
        arrestType: r.arrest_type,
      },
    }));

    return NextResponse.json({
      success: true,
      data: { type: 'FeatureCollection', features },
      meta: { count: features.length, zoom, limit },
    });
  } catch (error) {
    console.error('Error in points API (switching to mock):', error);
    const { searchParams } = new URL(request.url);
    const boundsStr = searchParams.get('bounds') || '-180,-90,180,90';

    return NextResponse.json({
      success: true,
      data: getMockPoints(boundsStr),
      source: 'error_fallback'
    });
  }
}
