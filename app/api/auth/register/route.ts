import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'Name, email, and password are required' },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, error: 'An account with this email already exists' },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  return NextResponse.json<ApiResponse<{ id: string; email: string; name: string }>>({
    success: true,
    data: { id: user._id.toString(), email: user.email, name: user.name },
  });
}
