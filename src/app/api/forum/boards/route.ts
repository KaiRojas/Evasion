import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Board, ForumUser } from '@/models/forum';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/forum/boards - Get all boards
 * POST /api/forum/boards - Create a new board (user-created)
 */

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'category', 'board', 'user-created'
    const parentId = searchParams.get('parent');
    const search = searchParams.get('search');
    
    // Build query
    const query: Record<string, unknown> = { 
      isArchived: false,
      'settings.isPrivate': false, // Only public boards
    };
    
    if (type) {
      query.type = type;
    }
    
    if (parentId) {
      query.parentBoard = parentId;
    } else if (!search) {
      // If no parent specified and not searching, get top-level boards
      query.parentBoard = { $exists: false };
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const boards = await Board.find(query)
      .populate('parentBoard', 'name slug')
      .populate('lastPostBy', 'username avatar')
      .sort({ order: 1, name: 1 })
      .lean();
    
    // Get sub-boards for each board
    const boardsWithSubs = await Promise.all(
      boards.map(async (board) => {
        const subBoards = await Board.find({ parentBoard: board._id, isArchived: false })
          .select('name slug threadCount postCount')
          .sort({ order: 1 })
          .lean();
        return { ...board, subBoards };
      })
    );
    
    return NextResponse.json({
      success: true,
      data: boardsWithSubs,
    });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch boards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV === 'development';

    // In dev mode, use a mock user if auth fails
    let user = null;
    let authId = '';
    let email = '';

    if (isDev) {
      // Try to get real user first
      try {
        const supabase = await createServerSupabaseClient();
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
          user = supabaseUser;
          authId = supabaseUser.id;
          email = supabaseUser.email || '';
        }
      } catch (error) {
        console.log('Supabase auth failed, using dev user');
      }

      // If no user in dev mode, create a dev user
      if (!user) {
        authId = 'dev-user-123';
        email = 'dev@test.com';
        console.log('Using dev mode authentication bypass');
      }
    } else {
      // Production mode - require auth
      const supabase = await createServerSupabaseClient();
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();

      if (!supabaseUser) {
        return NextResponse.json(
          { success: false, error: 'You must be logged in to create a board. Please sign in first.' },
          { status: 401 }
        );
      }

      user = supabaseUser;
      authId = supabaseUser.id;
      email = supabaseUser.email || '';
    }

    await connectDB();

    // Get or create forum user
    let forumUser = await ForumUser.findOne({ authId });
    if (!forumUser) {
      // Auto-create forum profile for convenience
      const username = email.split('@')[0] || `user_${authId.substring(0, 8)}`;
      forumUser = new ForumUser({
        authId,
        username,
        displayName: username, // Add required displayName field
        email,
        role: 'member',
        reputation: isDev ? 100 : 0, // Give reputation in dev mode
      });
      await forumUser.save();

      console.log('Auto-created forum profile for user:', authId);
    }

    // Check reputation for creating boards (skip in dev mode)
    const MIN_REP_TO_CREATE_BOARD = 100;

    if (!isDev && forumUser.reputation < MIN_REP_TO_CREATE_BOARD && forumUser.role === 'member') {
      return NextResponse.json(
        {
          success: false,
          error: `You need ${MIN_REP_TO_CREATE_BOARD} reputation points to create a board. You currently have ${forumUser.reputation} points.`
        },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { name, description, icon, color, parentBoard, settings } = body;
    
    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      );
    }
    
    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Check slug availability
    const existing = await Board.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A board with this name already exists' },
        { status: 400 }
      );
    }
    
    const board = new Board({
      name,
      slug,
      description,
      icon,
      color,
      parentBoard,
      type: 'user-created',
      createdBy: forumUser._id,
      moderators: [forumUser._id],
      settings: {
        isPrivate: settings?.isPrivate || false,
        requireApproval: settings?.requireApproval || false,
        allowPolls: true,
        allowImages: true,
        allowVideos: true,
        minRepToPost: 0,
        minRepToCreate: 0,
      },
    });
    
    await board.save();
    
    return NextResponse.json({
      success: true,
      data: board,
    });
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create board' },
      { status: 500 }
    );
  }
}
