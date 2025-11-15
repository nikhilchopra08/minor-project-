import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { authMiddleware, roleMiddleware } from '../../../../../lib/middleware';
import { UpdatePackageSchema } from '../../../../../lib/schemas';

interface Context {
  params: {
    id: string;
  };
}

export async function PUT(req: NextRequest, context: Context) {
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

    const { id } = context.params;
    const body = await req.json();
    const parsedData = UpdatePackageSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
        },
        { status: 400 }
      );
    }

    // Check if package exists and belongs to dealer
    const existingPackage = await prisma.package.findFirst({
      where: {
        id,
        dealerId: user.id,
      },
    });

    if (!existingPackage) {
      return NextResponse.json(
        {
          success: false,
          message: 'Package not found or access denied',
        },
        { status: 404 }
      );
    }

    const { serviceIds, ...packageData } = parsedData.data;

    let updateData: any = { ...packageData };

    if (serviceIds) {
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

      // Update package services
      updateData.services = {
        deleteMany: {}, // Remove existing services
        create: serviceIds.map(serviceId => ({
          serviceId: serviceId,
        })),
      };
    }

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: updateData,
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Package updated successfully',
      data: updatedPackage,
    });
  } catch (error) {
    console.error('Update package error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}