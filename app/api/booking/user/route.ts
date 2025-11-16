import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { authMiddleware } from '../../../../lib/middleware';
import { BookingQuerySchema } from '../../../../lib/schemas';

export async function GET(req: NextRequest) {
  try {
    const user = await authMiddleware(req);
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const queryParams = BookingQuerySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, status, month, year } = queryParams;
    const skip = (page - 1) * limit;

    const where: any = { userId: user.id };
    if (status) where.status = status;
    
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      where.scheduledDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          dealer: {
            include: {
              dealerProfile: {
                select: {
                  businessName: true,
                  phone: true,
                  city: true,
                  state: true,
                },
              },
            },
          },
          quote: {
            select: {
              renovationType: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { scheduledDate: 'asc' },
      }),
      prisma.booking.count({ where }),
    ]);

    // Get booking statistics for user
    const stats = await prisma.booking.aggregate({
      where: { userId: user.id },
      _count: {
        _all: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User bookings retrieved successfully',
      data: {
        bookings,
        stats: {
          totalBookings: stats._count._all,
          totalSpent: stats._sum.totalAmount || 0,
        },
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}