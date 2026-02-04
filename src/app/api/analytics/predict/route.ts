import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics/predict
 * Returns predicted high-activity zones for the current time
 * 
 * Query params:
 * - lat: user's latitude (optional, for sorting by proximity)
 * - lng: user's longitude (optional)
 * - hour: hour to predict for (default: current hour)
 * - day: day of week (default: current day, 0=Sunday)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const userLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    
    const now = new Date();
    const hour = searchParams.get('hour') ? parseInt(searchParams.get('hour')!) : now.getHours();
    const day = searchParams.get('day') ? parseInt(searchParams.get('day')!) : now.getDay();
    
    // Get hotspots for the specified time
    const hotspots = await prisma.violationHotspot.findMany({
      where: {
        hourOfDay: hour,
        dayOfWeek: day,
        probability: { gte: 0.1 }, // Only show significant hotspots
      },
      orderBy: {
        probability: 'desc',
      },
      take: 50,
    });
    
    // Calculate risk level and sort by proximity if user location provided
    let predictions = hotspots.map(h => {
      let distance = null;
      if (userLat !== null && userLng !== null) {
        // Haversine distance approximation
        const dLat = h.gridLat - userLat;
        const dLng = h.gridLng - userLng;
        distance = Math.sqrt(dLat * dLat + dLng * dLng) * 69; // Rough miles
      }
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'very_high';
      if (h.probability >= 0.7) riskLevel = 'very_high';
      else if (h.probability >= 0.4) riskLevel = 'high';
      else if (h.probability >= 0.2) riskLevel = 'medium';
      else riskLevel = 'low';
      
      return {
        id: h.id,
        location: {
          latitude: h.gridLat,
          longitude: h.gridLng,
        },
        probability: h.probability,
        riskLevel,
        totalHistoricalStops: h.totalStops,
        alcoholIncidents: h.alcoholStops,
        accidentIncidents: h.accidentStops,
        distanceMiles: distance ? Math.round(distance * 10) / 10 : null,
      };
    });
    
    // Sort by proximity if user location provided
    if (userLat !== null && userLng !== null) {
      predictions = predictions.sort((a, b) => {
        if (a.distanceMiles === null) return 1;
        if (b.distanceMiles === null) return -1;
        return a.distanceMiles - b.distanceMiles;
      });
    }
    
    // Get time context
    const timeLabels = [
      'Late Night', 'Late Night', 'Late Night', 'Late Night', 'Early Morning', 'Early Morning',
      'Morning Rush', 'Morning Rush', 'Morning Rush', 'Mid Morning', 'Mid Morning', 'Midday',
      'Midday', 'Early Afternoon', 'Afternoon', 'Afternoon Rush', 'Afternoon Rush', 'Evening Rush',
      'Evening Rush', 'Evening', 'Evening', 'Night', 'Night', 'Late Night'
    ];
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return NextResponse.json({
      success: true,
      data: {
        predictions: predictions.slice(0, 20), // Top 20
        context: {
          hour,
          hourLabel: `${hour.toString().padStart(2, '0')}:00`,
          timeOfDay: timeLabels[hour],
          day,
          dayLabel: dayNames[day],
          totalHotspots: predictions.length,
          highRiskCount: predictions.filter(p => p.riskLevel === 'high' || p.riskLevel === 'very_high').length,
        },
      },
    });
  } catch (error) {
    // Check if table doesn't exist yet
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('does not exist') || errorMessage.includes('relation')) {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      const timeLabels = [
        'Late Night', 'Late Night', 'Late Night', 'Late Night', 'Early Morning', 'Early Morning',
        'Morning Rush', 'Morning Rush', 'Morning Rush', 'Mid Morning', 'Mid Morning', 'Midday',
        'Midday', 'Early Afternoon', 'Afternoon', 'Afternoon Rush', 'Afternoon Rush', 'Evening Rush',
        'Evening Rush', 'Evening', 'Evening', 'Night', 'Night', 'Late Night'
      ];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      return NextResponse.json({
        success: true,
        data: {
          predictions: [],
          context: {
            hour,
            hourLabel: `${hour.toString().padStart(2, '0')}:00`,
            timeOfDay: timeLabels[hour],
            day,
            dayLabel: dayNames[day],
            totalHotspots: 0,
            highRiskCount: 0,
          },
          message: 'No data yet. Run db:import to load traffic violation data.',
        },
      });
    }
    
    console.error('Error generating predictions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}
