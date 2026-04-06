import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import SavedCafe from '@/lib/db/models/SavedCafe';
import User from '@/lib/db/models/User';
import type { ApiResponse } from '@/types';

// GET /api/user/favorites — get user's saved cafes
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  await connectDB();
  const saved = await SavedCafe.find({ user_id: session.user.id }).sort({ saved_at: -1 }).lean();

  return NextResponse.json<ApiResponse<typeof saved>>({ success: true, data: saved });
}

// POST /api/user/favorites — save a cafe
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { place_id, name, address, rating, photo_url, coordinates } = body;

  if (!place_id || !name || !coordinates) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'Missing required fields' },
      { status: 400 }
    );
  }

  await connectDB();

  try {
    const saved = await SavedCafe.findOneAndUpdate(
      { user_id: session.user.id, place_id },
      { user_id: session.user.id, place_id, name, address, rating, photo_url, coordinates },
      { upsert: true, new: true }
    );

    // Sync to User model
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { favorites: place_id },
    });

    return NextResponse.json<ApiResponse<typeof saved>>({ success: true, data: saved });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'Failed to save cafe' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/favorites — remove a cafe
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const placeId = req.nextUrl.searchParams.get('place_id');
  if (!placeId) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'Missing place_id' },
      { status: 400 }
    );
  }

  await connectDB();

  await SavedCafe.deleteOne({ user_id: session.user.id, place_id: placeId });
  await User.findByIdAndUpdate(session.user.id, {
    $pull: { favorites: placeId },
  });

  return NextResponse.json<ApiResponse<{ deleted: boolean }>>({
    success: true,
    data: { deleted: true },
  });
}
