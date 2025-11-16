import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminMiddleware } from '@/lib/middleware';
import { AdminQuerySchema } from '@/lib/schemas';

export async function GET(req: NextRequest) {
  try {
    const admin = await adminMiddleware(req);
    
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - Admin access required',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const queryParams = AdminQuerySchema.parse(Object.fromEntries(searchParams));

    const {
      page,
      limit,
      search,
      role,
      status,
      startDate,
      endDate
    } = queryParams;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      role: 'USER',
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { userProfile: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status === 'active') {
      where.userProfile = { is: {} }; // Users with profiles are considered active
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          userProfile: {
            select: {
              fullName: true,
              phone: true,
              city: true,
              state: true,
              address: true,
            },
          },
          _count: {
            select: {
              refreshTokens: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Format response
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.userProfile,
      loginCount: user._count.refreshTokens,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: formattedUsers,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}