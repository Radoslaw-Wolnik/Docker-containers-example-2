// src/app/api/annotations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';
import { 
  ApiResponse, 
  AnnotationCreateInput, 
  AnnotationUpdateInput, 
  SafeAnnotation 
} from '@/types/global';
import { BadRequestError, UnauthorizedError } from '@/lib/errors';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('You must be logged in to create annotations');
    }

    const body: AnnotationCreateInput = await req.json();

    // Verify image exists and user has access
    const image = await prisma.image.findUnique({
      where: { id: body.imageId },
    });

    if (!image) {
      throw new BadRequestError('Image not found');
    }

    if (!image.isPublic && image.userId !== session.user.id) {
      throw new UnauthorizedError('No access to this image');
    }

    const annotation = await prisma.annotation.create({
      data: {
        ...body,
        userId: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
      },
    });

    logger.info('Annotation created', { 
      userId: session.user.id, 
      annotationId: annotation.id,
      imageId: body.imageId 
    });

    const response: ApiResponse<SafeAnnotation> = {
      data: annotation,
      message: 'Annotation created successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error creating annotation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create annotation' },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      throw new BadRequestError('Image ID is required');
    }

    const image = await prisma.image.findUnique({
      where: { id: parseInt(imageId) },
    });

    if (!image) {
      throw new BadRequestError('Image not found');
    }

    const annotations = await prisma.annotation.findMany({
      where: {
        imageId: parseInt(imageId),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const response: ApiResponse<SafeAnnotation[]> = {
      data: annotations,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching annotations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch annotations' },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}