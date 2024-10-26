// src/app/api/images/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { deleteFile } from '@/utils/fileUtils';
import { authOptions } from '../../auth/[...nextauth]/route';
import { ApiResponse, ImageUpdateInput, ExtendedImage } from '@/types/global';
import { BadRequestError, UnauthorizedError } from '@/lib/errors';
import logger from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const imageId = parseInt(params.id);

    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            username: true,
            profilePicture: true,
          },
        },
        annotations: {
          include: {
            createdBy: {
              select: {
                id: true,
                username: true,
                profilePicture: true,
              },
            },
          },
        },
        _count: {
          select: {
            annotations: true,
          },
        },
      },
    });

    if (!image) {
      throw new BadRequestError('Image not found');
    }

    // Check access
    if (!image.isPublic && (!session || image.userId !== session.user.id)) {
      throw new UnauthorizedError('No access to this image');
    }

    const response: ApiResponse<ExtendedImage> = {
      data: image,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error fetching image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch image' },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('Authentication required');
    }

    const imageId = parseInt(params.id);
    const updates: ImageUpdateInput = await req.json();

    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new BadRequestError('Image not found');
    }

    if (image.userId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new UnauthorizedError('No permission to update this image');
    }

    const updated = await prisma.image.update({
      where: { id: imageId },
      data: updates,
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

    logger.info('Image updated', { 
      userId: session.user.id,
      imageId 
    });

    const response: ApiResponse<ExtendedImage> = {
      data: updated,
      message: 'Image updated successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error updating image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update image' },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('Authentication required');
    }

    const imageId = parseInt(params.id);
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new BadRequestError('Image not found');
    }

    if (image.userId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new UnauthorizedError('No permission to delete this image');
    }

    // Delete file from storage
    await deleteFile(image.filePath);

    // Delete image and all related annotations
    await prisma.image.delete({
      where: { id: imageId },
    });

    logger.info('Image deleted', { 
      userId: session.user.id,
      imageId 
    });

    return NextResponse.json({
      message: 'Image deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete image' },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}