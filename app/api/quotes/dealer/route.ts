import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { authMiddleware, roleMiddleware } from '../../../../lib/middleware';
import { QuoteQuerySchema } from '../../../../lib/schemas';

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
    const queryParams = QuoteQuerySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, status } = queryParams;
    const skip = (page - 1) * limit;

    const where: any = { dealerId: dealer.id };
    if (status) where.status = status;

    const [quotes, totalCount] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
          user: {
            include: {
              userProfile: {
                select: {
                  fullName: true,
                  phone: true,
                  city: true,
                  state: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.quote.count({ where }),
    ]);

    // Get quote statistics
    const stats = await prisma.quote.aggregate({
      where: { dealerId: dealer.id },
      _count: {
        _all: true,
      },
      _avg: {
        totalAmount: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Dealer quotes retrieved successfully',
      data: {
        quotes,
        stats: {
          totalQuotes: stats._count._all,
          averageQuote: stats._avg.totalAmount,
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
    console.error('Get dealer quotes error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}