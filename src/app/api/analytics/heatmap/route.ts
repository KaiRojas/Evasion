import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics/heatmap
 * Returns heatmap data for traffic violations
 * 
 * Query params:
 * - bounds: "minLng,minLat,maxLng,maxLat" (optional)
 * - hourStart: 0-23 (optional)
 * - hourEnd: 0-23 (optional)
 * - dayOfWeek: 0-6 (optional, Sunday=0)
 * - zoom: map zoom level for clustering (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const bounds = searchParams.get('bounds')?.split(',').map(Number);
    const hourStart = searchParams.get('hourStart') ? parseInt(searchParams.get('hourStart')!) : null;
    const hourEnd = searchParams.get('hourEnd') ? parseInt(searchParams.get('hourEnd')!) : null;
    const dayOfWeek = searchParams.get('dayOfWeek') ? parseInt(searchParams.get('dayOfWeek')!) : null;
    const zoom = searchParams.get('zoom') ? parseInt(searchParams.get('zoom')!) : 10;
    
    // Determine grid precision based on zoom level
    // Higher zoom = finer grid
    const gridPrecision = zoom >= 14 ? 3 : zoom >= 11 ? 2 : 1;
    
    // Build where conditions
    const whereConditions: string[] = [];
    const params: (number | string)[] = [];
    let paramIndex = 1;
    
    if (bounds && bounds.length === 4) {
      const [minLng, minLat, maxLng, maxLat] = bounds;
      whereConditions.push(`grid_lat >= $${paramIndex++} AND grid_lat <= $${paramIndex++}`);
      whereConditions.push(`grid_lng >= $${paramIndex++} AND grid_lng <= $${paramIndex++}`);
      params.push(minLat, maxLat, minLng, maxLng);
    }
    
    if (hourStart !== null && hourEnd !== null) {
      if (hourStart <= hourEnd) {
        whereConditions.push(`hour_of_day >= $${paramIndex++} AND hour_of_day <= $${paramIndex++}`);
        params.push(hourStart, hourEnd);
      } else {
        // Handle overnight range (e.g., 22-6)
        whereConditions.push(`(hour_of_day >= $${paramIndex++} OR hour_of_day <= $${paramIndex++})`);
        params.push(hourStart, hourEnd);
      }
    }
    
    if (dayOfWeek !== null) {
      whereConditions.push(`day_of_week = $${paramIndex++}`);
      params.push(dayOfWeek);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // Query hotspots with aggregation
    const query = `
      SELECT 
        ROUND(grid_lat::numeric, ${gridPrecision}) as lat,
        ROUND(grid_lng::numeric, ${gridPrecision}) as lng,
        SUM(total_stops) as count,
        AVG(probability) as intensity
      FROM violation_hotspots
      ${whereClause}
      GROUP BY ROUND(grid_lat::numeric, ${gridPrecision}), ROUND(grid_lng::numeric, ${gridPrecision})
      ORDER BY count DESC
      LIMIT 5000
    `;
    
    const results = await prisma.$queryRawUnsafe<Array<{
      lat: number;
      lng: number;
      count: bigint;
      intensity: number;
    }>>(query, ...params);
    
    // Format for Mapbox heatmap
    const features = results.map(r => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [Number(r.lng), Number(r.lat)],
      },
      properties: {
        count: Number(r.count),
        intensity: Number(r.intensity),
      },
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        type: 'FeatureCollection',
        features,
      },
      meta: {
        totalPoints: features.length,
        gridPrecision,
        filters: {
          bounds,
          hourStart,
          hourEnd,
          dayOfWeek,
        },
      },
    });
  } catch (error) {
    // Check if table doesn't exist yet
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
      // Return empty data if table not created yet
      return NextResponse.json({
        success: true,
        data: {
          type: 'FeatureCollection',
          features: [],
        },
        meta: {
          totalPoints: 0,
          message: 'No data yet. Run db:import to load traffic violation data.',
        },
      });
    }
    
    console.error('Error fetching heatmap data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch heatmap data' },
      { status: 500 }
    );
  }
}
