import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { BadRequestError, UnauthorizedError } from '@/lib/errors';
import { AnnotationCreateInput, AnnotationUpdateInput } from '@/types/global';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('You must be logged in to create annotations');
    }

    const body: AnnotationCreateInput = await req.json();

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
          },
        },
      },
    });

    return NextResponse.json({ data: annotation });
  } catch (error) {
    console.error('Error creating annotation:', error);
    const status = error instanceof BadRequestError ? 400 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create annotation' },
      { status }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('You must be logged in to update annotations');
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      throw new BadRequestError('Annotation ID is required');
    }

    const body: AnnotationUpdateInput = await req.json();

    const annotation = await prisma.annotation.findUnique({
      where: { id: parseInt(id) },
    });

    if (!annotation) {
      throw new BadRequestError('Annotation not found');
    }

    if (annotation.userId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new UnauthorizedError('You do not have permission to update this annotation');
    }

    const updated = await prisma.annotation.update({
      where: { id: parseInt(id) },
      data: body,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating annotation:', error);
    const status = error instanceof BadRequestError ? 400 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update annotation' },
      { status }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('You must be logged in to delete annotations');
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new BadRequestError('Annotation ID is required');
    }

    const annotation = await prisma.annotation.findUnique({
      where: { id: parseInt(id) },
    });

    if (!annotation) {
      throw new BadRequestError('Annotation not found');
    }

    if (annotation.userId !== session.user.id && session.user.role !== 'ADMIN') {
      throw new UnauthorizedError('You do not have permission to delete this annotation');
    }

    await prisma.annotation.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting annotation:', error);
    const status = error instanceof BadRequestError ? 400 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete annotation' },
      { status }
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

    const annotations = await prisma.annotation.findMany({
      where: {
        imageId: parseInt(imageId),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ data: annotations });
  } catch (error) {
    console.error('Error fetching annotations:', error);
    const status = error instanceof BadRequestError ? 400 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch annotations' },
      { status }
    );
  }
}