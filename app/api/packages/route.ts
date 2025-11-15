import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId');
    
    const packages = await prisma.package.findMany({
      where: {
        isActive: true,
        ...(dealerId && { dealerId }),
      },
      include: {
        dealer: {
          select: {
            id: true,
            email: true,
            dealerProfile: {
              select: {
                businessName: true,
                city: true,
                state: true,
              },
            },
          },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                duration: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Packages retrieved successfully',
      data: packages,
    });
  } catch (error) {
    console.error('Get packages error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}