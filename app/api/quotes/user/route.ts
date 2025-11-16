import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { authMiddleware } from '../../../../lib/middleware';
import { QuoteQuerySchema } from '../../../../lib/schemas';

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
    const queryParams = QuoteQuerySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, status } = queryParams;
    const skip = (page - 1) * limit;

    const where: any = { userId: user.id };
    if (status) where.status = status;

    const [quotes, totalCount] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
          dealer: {
            include: {
              dealerProfile: {
                select: {
                  businessName: true,
                  city: true,
                  state: true,
                  phone: true,
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

    return NextResponse.json({
      success: true,
      message: 'User quotes retrieved successfully',
      data: {
        quotes,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get user quotes error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}