import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Location update schema
const locationUpdateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().min(0).optional(),
  accuracy: z.number().min(0).optional(),
});

// POST /api/location - Update user's location
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
    const validationResult = locationUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid location data' },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Upsert location - create or update
    const location = await prisma.userLocation.create({
      data: {
        userId: user.id,
        latitude: data.latitude,
        longitude: data.longitude,
        heading: data.heading,
        speed: data.speed,
        accuracy: data.accuracy,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: location,
    });
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update location' },
      { status: 500 }
    );
  }
}

// GET /api/location - Get nearby friends
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radiusMiles = parseFloat(searchParams.get('radius') || '25');

    // Get user's friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: user.id, status: 'ACCEPTED' },
          { friendId: user.id, status: 'ACCEPTED' },
        ],
      },
      select: {
        userId: true,
        friendId: true,
      },
    });

    const friendIds = friendships.map((f) =>
      f.userId === user.id ? f.friendId : f.userId
    );

    if (friendIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get recent locations (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const locations = await prisma.userLocation.findMany({
      where: {
        userId: { in: friendIds },
        isActive: true,
        timestamp: { gte: fiveMinutesAgo },
      },
      orderBy: { timestamp: 'desc' },
      distinct: ['userId'],
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            vehicles: {
              where: { isPrimary: true },
              select: {
                make: true,
                model: true,
                nickname: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    // Format response
    const friendPins = locations.map((loc) => ({
      id: loc.id,
      userId: loc.userId,
      username: loc.user.username,
      displayName: loc.user.displayName,
      avatarUrl: loc.user.avatarUrl,
      location: {
        latitude: loc.latitude,
        longitude: loc.longitude,
      },
      heading: loc.heading,
      speed: loc.speed,
      vehicleName: loc.user.vehicles[0]
        ? `${loc.user.vehicles[0].nickname || `${loc.user.vehicles[0].make} ${loc.user.vehicles[0].model}`}`
        : null,
      lastUpdated: loc.timestamp.getTime(),
    }));

    return NextResponse.json({
      success: true,
      data: friendPins,
    });
  } catch (error) {
    console.error('Error fetching friend locations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// DELETE /api/location - Stop broadcasting
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mark all user locations as inactive
    await prisma.userLocation.updateMany({
      where: { userId: user.id, isActive: true },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Location broadcasting stopped',
    });
  } catch (error) {
    console.error('Error stopping location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to stop broadcasting' },
      { status: 500 }
    );
  }
}
