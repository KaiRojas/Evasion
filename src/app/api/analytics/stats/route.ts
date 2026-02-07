import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getMockStats } from '@/lib/mock-data-generator';

/**
 * GET /api/analytics/stats
 * Returns overall statistics for traffic violations
 */
export async function GET(request: NextRequest) {
  try {
    // Check if we should force mock mode
    if (process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      return NextResponse.json({ success: true, data: getMockStats(), source: 'mock' });
    }

    const { searchParams } = new URL(request.url);
    const subAgency = searchParams.get('subAgency');

    const whereClause = subAgency ? { subAgency } : {};

    // Test connection first
    await prisma.$connect();

    // Get total counts
    const [
      totalStops,
      alcoholStops,
      accidentStops,
      searchStops,
      fatalStops,
    ] = await Promise.all([
      prisma.trafficViolation.count({ where: whereClause }),
      prisma.trafficViolation.count({ where: { ...whereClause, alcohol: true } }),
      prisma.trafficViolation.count({ where: { ...whereClause, accident: true } }),
      prisma.trafficViolation.count({ where: { ...whereClause, searchConducted: true } }),
      prisma.trafficViolation.count({ where: { ...whereClause, fatal: true } }),
    ]);

    // Handle empty data case as mock if no data exists
    if (totalStops === 0 && !subAgency) {
      return NextResponse.json({ success: true, data: getMockStats(), source: 'mock_fallback' });
    }

    // Get top locations
    const topLocations = await prisma.trafficViolation.groupBy({
      by: ['subAgency'],
      _count: { id: true },
      where: { subAgency: { not: null } },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Get violation type breakdown
    const violationTypes = await prisma.trafficViolation.groupBy({
      by: ['violationType'],
      _count: { id: true },
      where: { violationType: { not: null }, ...whereClause },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Get vehicle make breakdown
    const vehicleMakes = await prisma.trafficViolation.groupBy({
      by: ['vehicleMake'],
      _count: { id: true },
      where: { vehicleMake: { not: null }, ...whereClause },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Get date range
    const dateRange = await prisma.trafficViolation.aggregate({
      _min: { stopDate: true },
      _max: { stopDate: true },
      where: whereClause,
    });

    // Peak hour
    const peakHourResult = await prisma.$queryRaw<Array<{ hour: number; count: bigint }>>`
      SELECT 
        EXTRACT(HOUR FROM stop_time)::int as hour,
        COUNT(*) as count
      FROM traffic_violations
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 1
    `;
    const peakHour = peakHourResult[0]?.hour ?? null;

    // Peak day
    const peakDayResult = await prisma.$queryRaw<Array<{ day: number; count: bigint }>>`
      SELECT 
        EXTRACT(DOW FROM stop_date)::int as day,
        COUNT(*) as count
      FROM traffic_violations
      GROUP BY day
      ORDER BY count DESC
      LIMIT 1
    `;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peakDay = peakDayResult[0]?.day !== undefined ? dayNames[peakDayResult[0].day] : null;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalStops,
          alcoholStops,
          accidentStops,
          searchStops,
          fatalStops,
          alcoholRate: totalStops > 0 ? ((alcoholStops / totalStops) * 100).toFixed(2) + '%' : '0%',
          accidentRate: totalStops > 0 ? ((accidentStops / totalStops) * 100).toFixed(2) + '%' : '0%',
        },
        dateRange: {
          start: dateRange._min.stopDate,
          end: dateRange._max.stopDate,
        },
        peakTimes: {
          hour: peakHour,
          hourLabel: peakHour !== null ? `${peakHour.toString().padStart(2, '0')}:00` : null,
          day: peakDay,
        },
        topLocations: topLocations.map(l => ({
          name: l.subAgency,
          count: l._count.id,
        })),
        violationTypes: violationTypes.map(v => ({
          type: v.violationType,
          count: v._count.id,
        })),
        vehicleMakes: vehicleMakes.map(v => ({
          make: v.vehicleMake,
          count: v._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Error in stats API (switching to mock):', error);
    return NextResponse.json({
      success: true,
      data: getMockStats(),
      source: 'error_fallback'
    });
  }
}
