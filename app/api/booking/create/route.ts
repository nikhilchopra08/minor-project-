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

    const { serviceId, scheduledDate, startTime, estimatedHours, specialNotes, location, contactPhone, contactEmail } = parsedData.data;

    // Verify service exists and is active
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        isActive: true,
      },
      include: {
        dealer: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          message: 'Service not found or not available',
        },
        { status: 404 }
      );
    }

    // Check dealer availability
    const isAvailable = await prisma.dealerAvailability.findFirst({
      where: {
        dealerId: service.dealerId,
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
        dealerId: service.dealerId,
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

    // Create booking - FIXED: Use correct field names from your Prisma schema
const booking = await prisma.booking.create({
  data: {
    serviceId: service.id,
    quoteId: crypto.randomUUID(), // or your actual quote ID
    userId: user.id,
    dealerId: service.dealerId,

    scheduledDate: new Date(scheduledDate),
    startTime,
    estimatedHours,
    endTime: calculateEndTime(startTime, estimatedHours),

    // Must be valid JSON (your schema says Json)
    services: [
      {
        id: service.id,
        name: service.name,
        price: service.price,
        category: service.category,
        duration: service.duration,
      },
    ],

    totalAmount: service.price ?? 0,
    specialNotes: specialNotes || "",

    location: location || "",
    contactPhone: contactPhone || "",
    contactEmail: contactEmail || "",

    status: "SCHEDULED",
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
    quote: true, // you have this relation
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