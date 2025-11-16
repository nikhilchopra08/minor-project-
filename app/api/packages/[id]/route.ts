import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const packages = await prisma.package.findUnique({
      where: { 
        id,
        isActive: true 
      },
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
    });

    if (!packages) {
      return NextResponse.json(
        {
          success: false,
          message: 'Package not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Package retrieved successfully',
      data: packages,
    });
  } catch (error) {
    console.error('Get package error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}