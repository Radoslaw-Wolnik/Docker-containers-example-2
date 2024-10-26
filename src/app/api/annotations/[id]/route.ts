// src/app/api/annotations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';
import { ApiResponse, AnnotationUpdateInput, SafeAnnotation } from '@/types/global';
import { BadRequestError, UnauthorizedError } from '@/lib/errors';
import logger from '@/lib/logger';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('Authentication required');
    }

    const annotationId = parseInt(params.id);
    const updates: AnnotationUpdateInput = await req.json();

    const existingAnnotation = await prisma.annotation.findUnique({
      where: { id: annotationId },
    });

    if (!existingAnnotation) {
      throw new BadRequestError('Annotation not found');
    }

    // Check permission
    if (
      existingAnnotation.userId !== session.user.id && 
      session.user.role !== 'ADMIN'
    ) {
      throw new UnauthorizedError('No permission to update this annotation');
    }

    const updated = await prisma.annotation.update({
      where: { id: annotationId },
      data: updates,
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

    logger.info('Annotation updated', { 
      userId: session.user.id,
      annotationId 
    });

    const response: ApiResponse<SafeAnnotation> = {
      data: updated,
      message: 'Annotation updated successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Error updating annotation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update annotation' },
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

    const annotationId = parseInt(params.id);
    const annotation = await prisma.annotation.findUnique({
      where: { id: annotationId },
    });

    if (!annotation) {
      throw new BadRequestError('Annotation not found');
    }

    // Check permission
    if (
      annotation.userId !== session.user.id && 
      session.user.role !== 'ADMIN'
    ) {
      throw new UnauthorizedError('No permission to delete this annotation');
    }

    await prisma.annotation.delete({
      where: { id: annotationId },
    });

    logger.info('Annotation deleted', { 
      userId: session.user.id,
      annotationId 
    });

    return NextResponse.json({
      message: 'Annotation deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting annotation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete annotation' },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}