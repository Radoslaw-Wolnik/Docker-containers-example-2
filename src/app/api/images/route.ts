// src/app/api/images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { processImage } from '@/utils/imageProcessing.util';
import { ApiResponse, ImageCreateInput, ImageFilters, PaginationParams } from '@/types/global';
import { BadRequestError, UnauthorizedError } from '@/lib/errors';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('Authentication required');
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const isPublic = formData.get('isPublic') === 'true';

    if (!file) {
      throw new BadRequestError('No image file provided');
    }

    // Process and save the image
    const { filePath, publicUrl } = await processImage(file, session.user.id, {
      maxWidth: 1920,
      maxHeight: 1080,
      format: 'webp',
    });

    // Create image record
    const imageData: ImageCreateInput = {
      name: name || file.name,
      description,
      filePath: publicUrl,
      isPublic,
      userId: session.user.id,
    };

    const image = await prisma.image.create({
      data: imageData,
      include: {
        uploadedBy: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
      },
    });

    logger.info('Image uploaded', { userId: session.user.id, imageId: image.id });

    const response: ApiResponse = {
      data: image,
      message: 'Image uploaded successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Image upload error:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');
    const visibility = searchParams.get('visibility') as ImageFilters['visibility'];

    let whereClause: any = {
      OR: [
        { isPublic: true },
        ...(session?.user ? [{ userId: session.user.id }] : []),
      ],
    };

    if (userId) {
      whereClause = {
        userId: parseInt(userId),
        ...(session?.user.id !== parseInt(userId) ? { isPublic: true } : {}),
      };
    }

    if (visibility === 'public') {
      whereClause = { isPublic: true };
    } else if (visibility === 'private' && session?.user) {
      whereClause = { userId: session.user.id, isPublic: false };
    }

    const [total, images] = await Promise.all([
      prisma.image.count({ where: whereClause }),
      prisma.image.findMany({
        where: whereClause,
        include: {
          uploadedBy: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
            },
          },
          annotations: true,
          _count: {
            select: {
              annotations: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const response: ApiResponse = {
      data: {
        items: images,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching images:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}