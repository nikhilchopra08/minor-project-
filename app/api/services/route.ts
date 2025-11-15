import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const dealerId = searchParams.get('dealerId');
    
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Services retrieved successfully',
      data: services,
    });
  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}