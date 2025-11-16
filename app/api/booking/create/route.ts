import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { authMiddleware } from '../../../../lib/middleware';
import { CreateBookingSchema } from '../../../../lib/schemas';

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

    const body = await req.json();
    const parsedData = CreateBookingSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
        },
        { status: 400 }
      );
    }

    const { quoteId, scheduledDate, startTime, estimatedHours, specialNotes } = parsedData.data;

    // Verify quote exists and is accepted
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        userId: user.id,
        status: 'ACCEPTED',
      },
      include: {
        dealer: true,
      },
    });

    if (!quote) {
      return NextResponse.json(
        {
          success: false,
          message: 'Quote not found, not accepted, or access denied',
        },
        { status: 404 }
      );
    }

    // Check if booking already exists for this quote
    const existingBooking = await prisma.booking.findUnique({
      where: { quoteId },
    });

    if (existingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: 'Booking already exists for this quote',
        },
        { status: 409 }
      );
    }

    // Check dealer availability
    const isAvailable = await prisma.dealerAvailability.findFirst({
      where: {
        dealerId: quote.dealerId,
        date: new Date(scheduledDate),
        status: 'AVAILABLE',
        startTime: { lte: startTime },
        endTime: { gte: calculateEndTime(startTime, estimatedHours) },
      },
    });

    if (!isAvailable) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dealer not available at the selected time',
        },
        { status: 400 }
      );
    }

    // Check for overlapping bookings
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        dealerId: quote.dealerId,
        scheduledDate: new Date(scheduledDate),
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS', 'RESCHEDULED'],
        },
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: calculateEndTime(startTime, estimatedHours) },
            endTime: { gte: calculateEndTime(startTime, estimatedHours) },
          },
        ],
      },
    });

    if (overlappingBooking) {
      return NextResponse.json(
        {
          success: false,
          message: 'Time slot already booked',
        },
        { status: 409 }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        quoteId,
        userId: user.id,
        dealerId: quote.dealerId,
        scheduledDate: new Date(scheduledDate),
        startTime,
        estimatedHours,
        endTime: calculateEndTime(startTime, estimatedHours),
        services: quote.breakdown || [],
        totalAmount: quote.totalAmount || 0,
        specialNotes,
      },
      include: {
        dealer: {
          include: {
            dealerProfile: {
              select: {
                businessName: true,
                phone: true,
                address: true,
              },
            },
          },
        },
        quote: {
          select: {
            renovationType: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully',
        data: booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate end time
function calculateEndTime(startTime: string, hours: number): string {
  const [hoursStr, minutesStr] = startTime.split(':');
  let totalHours = parseInt(hoursStr) + hours;
  let endHours = totalHours % 24;
  return `${endHours.toString().padStart(2, '0')}:${minutesStr}`;
}