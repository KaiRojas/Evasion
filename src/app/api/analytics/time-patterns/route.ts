import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getMockTimePatterns } from '@/lib/mock-data-generator';

/**
 * GET /api/analytics/time-patterns
 * Returns time-based patterns for traffic violations
 * 
 * Query params:
 * - type: "hourly" | "daily" | "monthly" (default: hourly)
 * - subAgency: filter by district (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // --- SIMULATION MODE LOGIC ---
    // Target anchor: April 4, 2024
    const SIMULATION_ANCHOR = new Date('2024-04-04T12:00:00Z');
    const now = new Date();
    const simulationOffset = now.getTime() - SIMULATION_ANCHOR.getTime();

    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    // Build WHERE clause with shifted dates
    let dateFilter = '';

    if (startDateStr) {
      const queryStart = new Date(new Date(startDateStr).getTime() - simulationOffset);
      // Format as YYYY-MM-DD HH:mm:ss for postgres
      const startIso = queryStart.toISOString().replace('T', ' ').split('.')[0];
      dateFilter += ` AND stop_date >= '${startIso}'`;
    }

    if (endDateStr) {
      const queryEnd = new Date(new Date(endDateStr).getTime() - simulationOffset);
      const endIso = queryEnd.toISOString().replace('T', ' ').split('.')[0];
      dateFilter += ` AND stop_date <= '${endIso}'`;
    }


    // Test connection
    await prisma.$connect();

    switch (type) {
      case 'hourly':
        data = await getHourlyPatterns(subAgency, dateFilter);
        break;
      case 'daily':
        data = await getDailyPatterns(subAgency, dateFilter);
        break;
      case 'monthly':
        data = await getMonthlyPatterns(subAgency, dateFilter);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type. Use: hourly, daily, or monthly' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data,
      type,
    });
  } catch (error) {
    console.error('Error in time-patterns API (switching to mock):', error);
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'hourly') as 'hourly' | 'daily';

    return NextResponse.json({
      success: true,
      data: getMockTimePatterns(type),
      source: 'error_fallback'
    });
  }
}

async function getHourlyPatterns(subAgency: string | null, dateFilter: string) {
  let whereClause = 'WHERE 1=1';
  if (subAgency) whereClause += ` AND sub_agency = '${subAgency}'`;
  if (dateFilter) whereClause += dateFilter;

  const results = await prisma.$queryRawUnsafe<Array<{
    hour: number;
    count: bigint;
    alcohol_count: bigint;
    accident_count: bigint;
  }>>(`
    SELECT 
      EXTRACT(HOUR FROM stop_time)::int as hour,
      COUNT(*) as count,
      SUM(CASE WHEN alcohol THEN 1 ELSE 0 END) as alcohol_count,
      SUM(CASE WHEN accident THEN 1 ELSE 0 END) as accident_count
    FROM traffic_violations
    ${whereClause}
    GROUP BY hour
    ORDER BY hour
  `);

  // Fill in missing hours with 0
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const found = results.find(r => r.hour === hour);
    return {
      hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
      count: found ? Number(found.count) : 0,
      alcoholCount: found ? Number(found.alcohol_count) : 0,
      accidentCount: found ? Number(found.accident_count) : 0,
    };
  });

  return hourlyData;
}

async function getDailyPatterns(subAgency: string | null, dateFilter: string) {
  let whereClause = 'WHERE 1=1';
  if (subAgency) whereClause += ` AND sub_agency = '${subAgency}'`;
  if (dateFilter) whereClause += dateFilter;

  const results = await prisma.$queryRawUnsafe<Array<{
    day: number;
    count: bigint;
    alcohol_count: bigint;
    accident_count: bigint;
  }>>(`
    SELECT 
      EXTRACT(DOW FROM stop_date)::int as day,
      COUNT(*) as count,
      SUM(CASE WHEN alcohol THEN 1 ELSE 0 END) as alcohol_count,
      SUM(CASE WHEN accident THEN 1 ELSE 0 END) as accident_count
    FROM traffic_violations
    ${whereClause}
    GROUP BY day
    ORDER BY day
  `);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const dailyData = Array.from({ length: 7 }, (_, day) => {
    const found = results.find(r => r.day === day);
    return {
      day,
      label: dayNames[day],
      shortLabel: dayNames[day].slice(0, 3),
      count: found ? Number(found.count) : 0,
      alcoholCount: found ? Number(found.alcohol_count) : 0,
      accidentCount: found ? Number(found.accident_count) : 0,
    };
  });

  return dailyData;
}

async function getMonthlyPatterns(subAgency: string | null, dateFilter: string) {
  let whereClause = 'WHERE 1=1';
  if (subAgency) whereClause += ` AND sub_agency = '${subAgency}'`;
  if (dateFilter) whereClause += dateFilter;

  const results = await prisma.$queryRawUnsafe<Array<{
    month: number;
    year: number;
    count: bigint;
  }>>(`
    SELECT 
      EXTRACT(MONTH FROM stop_date)::int as month,
      EXTRACT(YEAR FROM stop_date)::int as year,
      COUNT(*) as count
    FROM traffic_violations
    ${whereClause}
    GROUP BY year, month
    ORDER BY year, month
  `);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return results.map(r => ({
    month: r.month,
    year: r.year,
    label: `${monthNames[r.month - 1]} ${r.year}`,
    count: Number(r.count),
  }));
}
