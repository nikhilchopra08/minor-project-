// app/api/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/middleware';
import { DatabaseService } from '@/lib/prisma';
import { z } from 'zod';

// Query parameter validation schema
const AvailabilityQuerySchema = z.object({
  dealerId: z.string().uuid('Invalid dealer ID format'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format (YYYY-MM-DD)'),
});

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication if you want to restrict access
    // const user = await authMiddleware(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    
    // Extract and validate query parameters
    const queryParams = {
      dealerId: searchParams.get('dealerId'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    };

    // Validate query parameters
    const validatedQuery = AvailabilityQuerySchema.parse(queryParams);

    // Parse dates
    // const startDate = new Date(validatedQuery.startDate);
    // const endDate = new Date(validatedQuery.endDate);


    const startDate = new Date();
const endDate = new Date(); // 2 hours later

    // Validate date ranges
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    // Check if dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      );
    }

    // Limit date range to 3 months for performance
    const maxEndDate = new Date(startDate);
    maxEndDate.setMonth(maxEndDate.getMonth() + 3);
    if (endDate > maxEndDate) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 3 months' },
        { status: 400 }
      );
    }

    // Fetch availability from database
    const availability = await DatabaseService.getDealerAvailability(
      validatedQuery.dealerId,
      startDate,
      endDate
    );

    // Transform the data to match the frontend expectations
    const availabilityData = availability.map(avail => ({
      date: avail.date.toISOString().split('T')[0],
      isAvailable: avail.isAvailable,
    }));

    // For dates that don't have an explicit availability record, assume available
    // You might want to change this logic based on your business rules
    const allDates: { date: string; isAvailable: boolean }[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingAvailability = availabilityData.find(avail => avail.date === dateStr);
      
      allDates.push({
        date: dateStr,
        isAvailable: existingAvailability ? existingAvailability.isAvailable : true, // Default to available if not set
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      success: true,
      availability: true,
      meta: {
        dealerId: validatedQuery.dealerId,
        startDate: validatedQuery.startDate,
        endDate: validatedQuery.endDate,
        totalDays: allDates.length,
        availableDays: allDates.filter(d => d.isAvailable).length,
        unavailableDays: allDates.filter(d => !d.isAvailable).length,
      },
    });

  } catch (error) {
    console.error('Error fetching availability:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
        //   details: error.errors.map(err => ({
        //     field: err.path.join('.'),
        //     message: err.message
        //   }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add support for checking specific date availability
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const CheckAvailabilitySchema = z.object({
      dealerId: z.string().uuid('Invalid dealer ID format'),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    });

    const validatedData = CheckAvailabilitySchema.parse(body);

    const date = new Date(validatedData.date);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return NextResponse.json(
        { 
          success: true,
          available: false,
          reason: 'Date is in the past'
        },
        { status: 200 }
      );
    }

    const isAvailable = await DatabaseService.checkDealerAvailability(
      validatedData.dealerId,
      date
    );

    return NextResponse.json({
      success: true,
      available: isAvailable,
      date: validatedData.date,
      dealerId: validatedData.dealerId,
    });

  } catch (error) {
    console.error('Error checking availability:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
        //   details: error.errors.map(err => ({
        //     field: err.path.join('.'),
        //     message: err.message
        //   }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}