import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/forum/Event';
import { ForumUser } from '@/models/forum';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/events - Get all events
 * POST /api/events - Create a new event
 */

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'upcoming';
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    const query: Record<string, unknown> = {
      status: status,
    };

    if (type && type !== 'all') {
      query.eventType = type;
    }

    const events = await Event.find(query)
      .populate('host', 'username avatar')
      .sort({ startDate: 1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV === 'development';

    // Get authenticated user
    let authId = '';
    let email = '';

    if (isDev) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
          authId = supabaseUser.id;
          email = supabaseUser.email || '';
        }
      } catch (error) {
        console.log('Supabase auth failed, using dev user');
      }

      if (!authId) {
        authId = 'dev-user-123';
        email = 'dev@test.com';
      }
    } else {
      const supabase = await createServerSupabaseClient();
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();

      if (!supabaseUser) {
        return NextResponse.json(
          { success: false, error: 'You must be logged in to create an event' },
          { status: 401 }
        );
      }

      authId = supabaseUser.id;
      email = supabaseUser.email || '';
    }

    await connectDB();

    // Get or create forum user
    let forumUser = await ForumUser.findOne({ authId });
    if (!forumUser) {
      const username = email.split('@')[0] || `user_${authId.substring(0, 8)}`;
      forumUser = new ForumUser({
        authId,
        username,
        displayName: username,
        email,
        role: 'member',
      });
      await forumUser.save();
    }

    const body = await request.json();
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      location,
      maxAttendees,
      isPrivate,
      requiresApproval,
      vehicleRequirements,
      tags,
    } = body;

    // Validate required fields
    if (!title || !description || !eventType || !startDate || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create event
    const event = new Event({
      title,
      description,
      eventType,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      location,
      host: forumUser._id,
      maxAttendees,
      isPrivate: isPrivate || false,
      requiresApproval: requiresApproval || false,
      vehicleRequirements,
      tags: tags || [],
      attendees: [
        {
          user: forumUser._id,
          status: 'going',
          joinedAt: new Date(),
        },
      ],
      status: 'upcoming',
    });

    await event.save();

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
