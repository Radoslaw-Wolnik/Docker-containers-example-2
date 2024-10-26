import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';
import { format, subDays } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new UnauthorizedError('Authentication required');
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30';
    const userId = searchParams.get('userId');

    const startDate = subDays(new Date(), parseInt(period));

    let whereClause: any = {
      createdAt: {
        gte: startDate,
      },
    };

    if (userId && (session.user.role === 'ADMIN' || session.user.id === parseInt(userId))) {
      whereClause.userId = parseInt(userId);
    }

    const [
      imageStats,
      annotationStats,
      activityTimeline,
      topAnnotators,
    ] = await Promise.all([
      // Image statistics
      prisma.image.groupBy({
        by: ['isPublic'],
        where: whereClause,
        _count: true,
      }),

      // Annotation statistics
      prisma.annotation.groupBy({
        by: ['type'],
        where: whereClause,
        _count: true,
      }),

      // Activity timeline
      prisma.image.groupBy({
        by: ['createdAt'],
        where: whereClause,
        _count: true,
        orderBy: {
          createdAt: 'asc',
        },
      }),

      // Top annotators
      prisma.user.findMany({
        where: {
          annotations: {
            some: whereClause,
          },
        },
        select: {
          id: true,
          username: true,
          profilePicture: true,
          _count: {
            select: {
              annotations: true,
            },
          },
        },
        orderBy: {
          annotations: {
            _count: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    // Process timeline data for visualization
    const timeline = activityTimeline.reduce((acc: Record<string, number>, day) => {
      const date = format(day.createdAt, 'yyyy-MM-dd');
      acc[date] = day._count;
      return acc;
    }, {});

    return NextResponse.json({
      data: {
        images: {
          total: imageStats.reduce((acc, stat) => acc + stat._count, 0),
          public: imageStats.find(stat => stat.isPublic)?._count || 0,
          private: imageStats.find(stat => !stat.isPublic)?._count || 0,
        },
        annotations: {
          total: annotationStats.reduce((acc, stat) => acc + stat._count, 0),
          byType: Object.fromEntries(
            annotationStats.map(stat => [stat.type, stat._count])
          ),
        },
        timeline,
        topAnnotators: topAnnotators.map(user => ({
          id: user.id,
          username: user.username,
          profilePicture: user.profilePicture,
          annotationCount: user._count.annotations,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch statistics' },
      { status: error instanceof UnauthorizedError ? 401 : 500 }
    );
  }
}