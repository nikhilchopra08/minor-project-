import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { adminMiddleware } from '../../../../lib/middleware';
import { AdminQuerySchema } from '../../../../lib/schemas';

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
      status,
      startDate,
      endDate
    } = queryParams;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      role: 'DEALER',
    };

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { dealerProfile: { businessName: { contains: search, mode: 'insensitive' } } },
        { dealerProfile: { businessEmail: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status === 'active') {
      where.dealerProfile = { is: {} }; // Dealers with profiles are considered active
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get dealers with counts and pagination
    const [dealers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          dealerProfile: {
            select: {
              businessName: true,
              businessEmail: true,
              phone: true,
              gstNumber: true,
              address: true,
              city: true,
              state: true,
              description: true,
            },
          },
          _count: {
            select: {
              services: {
                where: { isActive: true }
              },
              packages: {
                where: { isActive: true }
              },
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
    const formattedDealers = dealers.map(dealer => ({
      id: dealer.id,
      email: dealer.email,
      role: dealer.role,
      profile: dealer.dealerProfile,
      stats: {
        activeServices: dealer._count.services,
        activePackages: dealer._count.packages,
        loginCount: dealer._count.refreshTokens,
      },
      createdAt: dealer.createdAt,
      updatedAt: dealer.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      message: 'Dealers retrieved successfully',
      data: {
        dealers: formattedDealers,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get admin dealers error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}