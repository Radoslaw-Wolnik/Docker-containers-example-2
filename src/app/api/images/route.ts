import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { BadRequestError, UnauthorizedError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    const images = await prisma.image.findMany({
      where: {
        OR: [
          { isPublic: true },
          { userId: session?.user?.id },
          ...(userId ? [{ userId: parseInt(userId) }] : []),
        ],
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            username: true,
          },
        },
        annotations: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ data: images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('You must be logged in to upload images');
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;
    const name = formData.get('name') as string;

    if (!file) {
      throw new BadRequestError('No file provided');
    }

    // Create user upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'users', session.user.id.toString());
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadDir, filename);
    const publicPath = `/uploads/users/${session.user.id}/${filename}`;

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create database record
    const image = await prisma.image.create({
      data: {
        name: name || file.name,
        filePath: publicPath,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ data: image });
  } catch (error) {
    console.error('Error uploading image:', error);
    const status = error instanceof BadRequestError ? 400 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status }
    );
  }
}