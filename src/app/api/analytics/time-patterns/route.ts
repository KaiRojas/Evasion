import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'hourly';
    const subAgency = searchParams.get('subAgency');
    
    let data;
    
    switch (type) {
      case 'hourly':
        data = await getHourlyPatterns(subAgency);
        break;
      case 'daily':
        data = await getDailyPatterns(subAgency);
        break;
      case 'monthly':
        data = await getMonthlyPatterns(subAgency);
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
    // Check if table doesn't exist yet
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
      // Return empty patterns
      const emptyHourly = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        label: `${hour.toString().padStart(2, '0')}:00`,
        count: 0,
        alcoholCount: 0,
        accidentCount: 0,
      }));
      
      return NextResponse.json({
        success: true,
        data: emptyHourly,
        type: 'hourly',
        message: 'No data yet. Run db:import to load traffic violation data.',
      });
    }
    
    console.error('Error fetching time patterns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch time patterns' },
      { status: 500 }
    );
  }
}

async function getHourlyPatterns(subAgency: string | null) {
  const whereClause = subAgency ? `WHERE sub_agency = '${subAgency}'` : '';
  
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

async function getDailyPatterns(subAgency: string | null) {
  const whereClause = subAgency ? `WHERE sub_agency = '${subAgency}'` : '';
  
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

async function getMonthlyPatterns(subAgency: string | null) {
  const whereClause = subAgency ? `WHERE sub_agency = '${subAgency}'` : '';
  
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
