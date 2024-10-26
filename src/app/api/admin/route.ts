import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { ForbiddenError, BadRequestError } from '@/lib/errors';
import logger from '@/lib/logger';

// GET /api/admin/stats
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required');
    }

    // Fetch all statistics in parallel
    const [
      totalUsers,
      totalImages,
      totalAnnotations,
      bannedUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.image.count(),
      prisma.annotation.count(),
      prisma.user.count({ where: { isBanned: true } })
    ]);

    const recentActivity = await prisma.annotation.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
        image: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: {
        totalUsers,
        totalImages,
        totalAnnotations,
        bannedUsers,
        recentActivity,
      },
    });
  } catch (error) {
    logger.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch admin stats' },
      { status: error instanceof ForbiddenError ? 403 : 500 }
    );
  }
}

// POST /api/admin/users/[id]/ban
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required');
    }

    const userId = req.url.split('/').pop();
    if (!userId) throw new BadRequestError('User ID is required');

    const { action, duration } = await req.json();

    if (action === 'ban') {
      const banExpiresAt = duration ? new Date(Date.now() + duration * 86400000) : null;
      
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          isBanned: true,
          banExpiresAt,
        },
      });

      logger.info(`User banned`, { userId, duration, banExpiresAt });
    } else if (action === 'unban') {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          isBanned: false,
          banExpiresAt: null,
        },
      });

      logger.info(`User unbanned`, { userId });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in user moderation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to moderate user' },
      { status: error instanceof ForbiddenError ? 403 : 500 }
    );
  }
}

// DELETE /api/admin/images/[id]
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required');
    }

    const imageId = req.url.split('/').pop();
    if (!imageId) throw new BadRequestError('Image ID is required');

    // Delete image file from storage
    const image = await prisma.image.findUnique({
      where: { id: parseInt(imageId) },
    });

    if (image) {
      await deleteFile(image.filePath); // Utility function to delete file
    }

    // Delete image record and all related annotations
    await prisma.image.delete({
      where: { id: parseInt(imageId) },
    });

    logger.info(`Image deleted by admin`, { imageId });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete image' },
      { status: error instanceof ForbiddenError ? 403 : 500 }
    );
  }
}