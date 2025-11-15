import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { authMiddleware, roleMiddleware } from '../../../../lib/middleware';
import { CreatePackageSchema } from '../../../../lib/schemas';

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

    if (!roleMiddleware(['DEALER'])(user)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden',
        },
        { status: 403 }
      );
    }

    const packages = await prisma.package.findMany({
      where: {
        dealerId: user.id,
      },
      include: {
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
      message: 'Dealer packages retrieved successfully',
      data: packages,
    });
  } catch (error) {
    console.error('Get dealer packages error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    if (!roleMiddleware(['DEALER'])(user)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsedData = CreatePackageSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
        },
        { status: 400 }
      );
    }

    const { serviceIds, ...packageData } = parsedData.data;

    // Verify all services belong to the dealer
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        dealerId: user.id,
      },
    });

    if (services.length !== serviceIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: 'Some services not found or access denied',
        },
        { status: 400 }
      );
    }

    const packageRecord = await prisma.package.create({
      data: {
        ...packageData,
        dealerId: user.id,
        services: {
          create: serviceIds.map(serviceId => ({
            serviceId: serviceId,
          })),
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Package created successfully',
        data: packageRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create package error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}