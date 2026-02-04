import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

// GET /api/routes/[id] - Get a single route
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        points: {
          orderBy: { sequence: 'asc' },
        },
        ratings: {
          include: {
            user: {
              select: {
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { ratings: true },
        },
      },
    });

    if (!route) {
      return NextResponse.json(
        { success: false, error: 'Route not found' },
        { status: 404 }
      );
    }

    // Increment drive count (view count proxy)
    await prisma.route.update({
      where: { id },
      data: { driveCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      data: route,
    });
  } catch (error) {
    console.error('Error fetching route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch route' },
      { status: 500 }
    );
  }
}

// DELETE /api/routes/[id] - Delete a route
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user owns the route
    const route = await prisma.route.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!route) {
      return NextResponse.json(
        { success: false, error: 'Route not found' },
        { status: 404 }
      );
    }

    if (route.creatorId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own routes' },
        { status: 403 }
      );
    }

    await prisma.route.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Route deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete route' },
      { status: 500 }
    );
  }
}
