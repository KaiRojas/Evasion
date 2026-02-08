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
    let startDateStr = searchParams.get('startDate');
    let endDateStr = searchParams.get('endDate');

    // --- SIMULATION MODE LOGIC ---
    // The dataset ends around April 5, 2024. 
    // To make "Live" and "Last 24h" work, we shift the query window back in time.
    // Target anchor: April 4, 2024 (a busy weekday)
    const SIMULATION_ANCHOR = new Date('2024-04-04T12:00:00Z');
    const now = new Date();
    const simulationOffset = now.getTime() - SIMULATION_ANCHOR.getTime();

    const whereClause: any = {};
    if (subAgency) whereClause.subAgency = subAgency;

    // Apply simulation offset to filters
    if (startDateStr || endDateStr) {
      whereClause.stopDate = {};

      if (startDateStr) {
        // If user asks for "Now - 1h", we actually look for "(Now - Offset) - 1h"
        const queryStart = new Date(new Date(startDateStr).getTime() - simulationOffset);
        whereClause.stopDate.gte = queryStart;
      }

      if (endDateStr) {
        const queryEnd = new Date(new Date(endDateStr).getTime() - simulationOffset);
        whereClause.stopDate.lte = queryEnd;
      }
    }

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

    // Handle empty data case as mock if no data exists AND no filters applied
    // (If filters applied, 0 is a valid result)
    if (totalStops === 0 && !subAgency && !startDateStr && !endDateStr) {
      return NextResponse.json({ success: true, data: getMockStats(), source: 'mock_fallback' });
    }

    // Get top locations
    const topLocations = await prisma.trafficViolation.groupBy({
      by: ['subAgency'],
      _count: { id: true },
      where: { subAgency: { not: null }, ...whereClause },
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

    // Get date range (for metadata)
    const dateRange = await prisma.trafficViolation.aggregate({
      _min: { stopDate: true },
      _max: { stopDate: true },
      where: whereClause,
    });

    // Peak calculations (using raw SQL for date parts, need to inject where clause manually or use prisma group by if possible)
    // For simplicity with raw query, we'll skip complex dynamic where injection for now 
    // or just fetch all and filter in memory if dataset is small (it's not).
    // Let's stick to basic stats for the filter view.

    return NextResponse.json({
      success: true,
      data: {

        // Metadata about the simulation for the frontend to show if needed
        simulation: {
          active: true,
          offsetMs: simulationOffset,
          virtualNow: new Date().toISOString(),
          dataAnchor: SIMULATION_ANCHOR.toISOString()
        },

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
        // Omit peak times for filtered views to save perf/complexity for now
        peakTimes: {
          hour: null,
          hourLabel: null,
          day: null,
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
