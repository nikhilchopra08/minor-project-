import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { authMiddleware, roleMiddleware } from '../../../../lib/middleware';
import { AvailabilityQuerySchema, CreateAvailabilitySchema } from '../../../../lib/schemas';

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const queryParams = AvailabilityQuerySchema.parse(Object.fromEntries(searchParams));

    const { startDate, endDate } = queryParams;

    const availability = await prisma.dealerAvailability.findMany({
      where: {
        dealerId: dealer.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get booked slots for the period
    const bookings = await prisma.booking.findMany({
      where: {
        dealerId: dealer.id,
        scheduledDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS', 'RESCHEDULED'],
        },
      },
      select: {
        scheduledDate: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Availability retrieved successfully',
      data: {
        availability,
        bookings,
      },
    });
  } catch (error) {
    console.error('Get availability error:', error);
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

    const body = await req.json();
    const parsedData = CreateAvailabilitySchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
        },
        { status: 400 }
      );
    }

    const { date, startTime, endTime, slotDuration, maxBookings } = parsedData.data;

    // Check if availability already exists for this date
    const existingAvailability = await prisma.dealerAvailability.findFirst({
      where: {
        dealerId: dealer.id,
        date: new Date(date),
      },
    });

    if (existingAvailability) {
      return NextResponse.json(
        {
          success: false,
          message: 'Availability already set for this date',
        },
        { status: 409 }
      );
    }

    const availability = await prisma.dealerAvailability.create({
      data: {
        dealerId: dealer.id,
        date: new Date(date),
        startTime,
        endTime,
        slotDuration,
        maxBookings,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Availability created successfully',
        data: availability,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create availability error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}