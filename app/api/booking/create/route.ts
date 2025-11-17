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
    const dealerAvailability = await prisma.dealerAvailability.findFirst({
      where: {
        dealerId: service.dealerId,
        date: new Date(scheduledDate),
        isAvailable: true,
      },
    });

    if (!dealerAvailability) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dealer is not available on the selected date',
        },
        { status: 400 }
      );
    }

    // Calculate end time for overlap checking
    const endTime = calculateEndTime(startTime, estimatedHours);

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
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
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
        serviceId: service.id,
        userId: user.id,
        dealerId: service.dealerId,

        scheduledDate: new Date(scheduledDate),
        startTime,
        estimatedHours,
        endTime,

        // Service details as JSON
        services: [
          {
            id: service.id,
            name: service.name,
            price: service.price,
            category: service.category,
            duration: service.duration,
            description: service.description,
          },
        ],
        

        totalAmount: service.price ?? 0,
        specialNotes: specialNotes || "",

        location: location || "",
        contactPhone: contactPhone || "",
        contactEmail: contactEmail || user.email || "",

        status: "SCHEDULED",
      },
      include: {
        service: {
          select: {
            name: true,
            description: true,
            category: true,
            duration: true,
          },
        },
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

// Improved helper function to calculate end time
function calculateEndTime(startTime: string, hours: number): string {
  const [hoursStr, minutesStr] = startTime.split(':');
  const startDate = new Date();
  startDate.setHours(parseInt(hoursStr), parseInt(minutesStr), 0, 0);
  
  const endDate = new Date(startDate.getTime() + (hours * 60 * 60 * 1000));
  
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
}