import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { processImage } from '@/utils/imageProcessing.util';
import { BadRequestError, UnauthorizedError } from '@/lib/errors';
import bcrypt from 'bcrypt';

// GET /api/users/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('Not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        _count: {
          select: {
            images: true,
            annotations: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    // Remove sensitive information
    const { password, ...safeUser } = user;
    return NextResponse.json({ data: safeUser });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}

// PUT /api/users/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('Not authenticated');
    }

    if (session.user.id !== parseInt(params.id)) {
      throw new UnauthorizedError('Not authorized to update this profile');
    }

    const body = await req.json();
    const { username, email } = body;

    // Check if username or email is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
        NOT: {
          id: parseInt(params.id),
        },
      },
    });

    if (existingUser) {
      throw new BadRequestError(
        existingUser.username === username
          ? 'Username already taken'
          : 'Email already taken'
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(params.id) },
      data: {
        username,
        email,
      },
      include: {
        _count: {
          select: {
            images: true,
            annotations: true,
          },
        },
      },
    });

    // Remove sensitive information
    const { password, ...safeUser } = updatedUser;
    return NextResponse.json({ data: safeUser });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}

// POST /api/users/avatar
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('Not authenticated');
    }

    const formData = await req.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      throw new BadRequestError('No file provided');
    }

    // Process and save the avatar image
    const { publicUrl } = await processImage(file, session.user.id, {
      maxWidth: 400,
      maxHeight: 400,
      format: 'webp',
    });

    // Update user's profile picture in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profilePicture: publicUrl,
      },
    });

    return NextResponse.json({
      data: {
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}

// POST /api/users/password
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('Not authenticated');
    }

    const { currentPassword, newPassword } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}