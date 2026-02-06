import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Board } from '@/models/forum';

/**
 * GET /api/forum/boards/[slug] - Get a board by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;

    console.log('[Board API] Fetching board with slug:', slug);

    const board = await Board.findOne({
      slug: slug,
      isArchived: false,
    })
      .populate('createdBy', 'username avatar')
      .populate('moderators', 'username avatar')
      .populate('parentBoard', 'name slug')
      .lean();

    console.log('[Board API] Found board:', !!board);

    if (!board) {
      console.log('[Board API] Board not found with slug:', slug);
      return NextResponse.json(
        { success: false, error: 'Board not found' },
        { status: 404 }
      );
    }

    // Check if private and user has access (TODO: implement permission check)
    // For now, just return the board

    return NextResponse.json({
      success: true,
      data: board,
    });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}
