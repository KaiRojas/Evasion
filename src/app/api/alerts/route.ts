import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Alert creation schema
const createAlertSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  reportType: z.enum(['STATIONARY', 'MOBILE', 'SPEED_TRAP', 'CHECKPOINT', 'ACCIDENT']),
  description: z.string().max(500).optional(),
});

// POST /api/alerts - Report a police sighting
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = createAlertSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check rate limit (max 5 reports per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentReports = await prisma.policeReport.count({
      where: {
        reporterId: user.id,
        reportedAt: { gte: oneHourAgo },
      },
    });

    if (recentReports >= 5) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Max 5 reports per hour.' },
        { status: 429 }
      );
    }

    // Create report (expires in 30 minutes)
    const report = await prisma.policeReport.create({
      data: {
        reporterId: user.id,
        latitude: data.latitude,
        longitude: data.longitude,
        reportType: data.reportType,
        description: data.description,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

// GET /api/alerts - Get active alerts in area
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radiusMiles = parseFloat(searchParams.get('radius') || '10');

    // Get active, non-expired alerts
    // Note: For proper geo queries, you'd use PostGIS functions
    // This is a simplified version that filters in-app
    const alerts = await prisma.policeReport.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { reportedAt: 'desc' },
      take: 50,
    });

    // Calculate rough distance and filter (simplified, not using PostGIS)
    const nearbyAlerts = alerts.filter((alert) => {
      const dLat = alert.latitude - lat;
      const dLng = alert.longitude - lng;
      const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 69; // Rough miles
      return distance <= radiusMiles;
    });

    // Format response
    const formattedAlerts = nearbyAlerts.map((alert) => ({
      id: alert.id,
      reporterId: alert.reporterId,
      location: {
        latitude: alert.latitude,
        longitude: alert.longitude,
      },
      reportType: alert.reportType,
      description: alert.description,
      confirmations: alert.confirmations,
      reportedAt: alert.reportedAt.getTime(),
      expiresAt: alert.expiresAt.getTime(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedAlerts,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// PATCH /api/alerts - Confirm an alert
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json(
        { success: false, error: 'Alert ID required' },
        { status: 400 }
      );
    }

    // Increment confirmations
    const alert = await prisma.policeReport.update({
      where: { id: alertId },
      data: {
        confirmations: { increment: 1 },
        // Extend expiry by 10 minutes on confirmation
        expiresAt: new Date(Date.now() + 40 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error('Error confirming alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to confirm alert' },
      { status: 500 }
    );
  }
}
