import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { authMiddleware, roleMiddleware } from '../../../../../lib/middleware';
import { UpdateServiceSchema } from '../../../../../lib/schemas';

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
    const parsedData = UpdateServiceSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
        },
        { status: 400 }
      );
    }

    // Check if service exists and belongs to dealer
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        dealerId: user.id,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        {
          success: false,
          message: 'Service not found or access denied',
        },
        { status: 404 }
      );
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: parsedData.data,
    });

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService,
    });
  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: Context) {
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

    // Check if service exists and belongs to dealer
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        dealerId: user.id,
      },
    });

    if (!existingService) {
      return NextResponse.json(
        {
          success: false,
          message: 'Service not found or access denied',
        },
        { status: 404 }
      );
    }

    // Check if service is used in any packages
    const packageUsage = await prisma.packageService.findFirst({
      where: { serviceId: id },
    });

    if (packageUsage) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot delete service as it is used in packages. Deactivate instead.',
        },
        { status: 400 }
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}