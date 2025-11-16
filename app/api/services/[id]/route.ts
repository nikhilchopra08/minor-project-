import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Context {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, context: Context) {
  try {
    const { id } = context.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        dealer: {
          select: {
            id: true,
            email: true,
            dealerProfile: {
              select: {
                businessName: true,
                businessEmail: true,
                phone: true,
                address: true,
                city: true,
                state: true,
                description: true,
              },
            },
          },
        },
        packages: {
          include: {
            package: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          message: 'Service not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Service retrieved successfully',
      data: service,
    });
  } catch (error) {
    console.error('Get service error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}