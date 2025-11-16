import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { authMiddleware, roleMiddleware } from '../../../../../lib/middleware';
import { UpdateBookingStatusSchema } from '../../../../../lib/schemas';

interface Context {
  params: {
    id: string;
  };
}

export async function PUT(req: NextRequest, context: Context) {
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

    const { id } = context.params;
    const body = await req.json();
    const parsedData = UpdateBookingStatusSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
        },
        { status: 400 }
      );
    }

    // Verify booking exists and belongs to this dealer
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        dealerId: dealer.id,
      },
    });

    if (!existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: 'Booking not found or access denied',
        },
        { status: 404 }
      );
    }

    const updateData: any = {
      status: parsedData.data.status,
    };

    if (parsedData.data.status === 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (parsedData.data.status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = parsedData.data.cancellationReason;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            userProfile: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking status updated successfully',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}