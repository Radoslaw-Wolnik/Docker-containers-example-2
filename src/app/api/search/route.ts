import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { BadRequestError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    let whereClause: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Add visibility filter
    if (!session?.user.role === 'ADMIN') {
      whereClause.OR.push(
        { isPublic: true },
        { userId: session?.user.id }
      );
    }

    if (type !== 'all') {
      whereClause.type = type;
    }

    const [total, items] = await Promise.all([
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
          annotations: {
            select: {
              id: true,
              type: true,
              label: true,
            },
          },
          _count: {
            select: {
              annotations: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: {
        items,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: page,
          limit,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}