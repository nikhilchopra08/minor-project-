import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { authMiddleware, roleMiddleware } from '../../../../lib/middleware';
import { BookingQuerySchema } from '../../../../lib/schemas';

export async function GET(req: NextRequest) {
  try {
    const dealer = await authMiddleware(req);
    
    if (!dealer) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    if (!roleMiddleware(['DEALER'])(dealer)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden - Dealers only',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const queryParams = BookingQuerySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, status, month, year } = queryParams;
    const skip = (page - 1) * limit;

    const where: any = { dealerId: dealer.id };
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
          user: {
            include: {
              userProfile: {
                select: {
                  fullName: true,
                  phone: true,
                  address: true,
                  city: true,
                  state: true,
                },
              },
            },
          },
          quote: {
            select: {
              renovationType: true,
              description: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { scheduledDate: 'asc' },
      }),
      prisma.booking.count({ where }),
    ]);

    // Get booking statistics for dealer
    const stats = await prisma.booking.aggregate({
      where: { dealerId: dealer.id },
      _count: {
        _all: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const today = new Date();
    const upcomingBookings = await prisma.booking.count({
      where: {
        dealerId: dealer.id,
        scheduledDate: {
          gte: today,
        },
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS'],
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Dealer bookings retrieved successfully',
      data: {
        bookings,
        stats: {
          totalBookings: stats._count._all,
          totalRevenue: stats._sum.totalAmount || 0,
          upcomingBookings,
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
    console.error('Get dealer bookings error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}