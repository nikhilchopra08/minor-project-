// app/api/dealer/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/middleware';
import { DatabaseService } from '@/lib/prisma';
import {
  CreateAvailabilitySchema,
  UpdateAvailabilitySchema,
  BulkAvailabilitySchema,
  AvailabilityQuerySchema,
  CheckAvailabilitySchema,
} from '@/lib/schemas';
import { z } from 'zod';

// GET - Get dealer availability for a date range
export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a dealer
    if (user.role !== 'DEALER') {
      return NextResponse.json(
        { error: 'Only dealers can manage availability' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    };

    // Validate query parameters
    const validatedQuery = AvailabilityQuerySchema.parse(queryParams);

    const startDate = new Date(validatedQuery.startDate);
    const endDate = new Date(validatedQuery.endDate);

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Check if start date is before end date
    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    const availability = await DatabaseService.getDealerAvailability(
      user.id,
      startDate,
      endDate
    );

    return NextResponse.json({
      success: true,
      data: availability,
      meta: {
        startDate: validatedQuery.startDate,
        endDate: validatedQuery.endDate,
        total: availability.length,
      },
    });
  } catch (error) {
    console.error('Error fetching dealer availability:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: error.errors 
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

// POST - Create or update dealer availability
export async function POST(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a dealer
    if (user.role !== 'DEALER') {
      return NextResponse.json(
        { error: 'Only dealers can manage availability' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Check if it's a bulk update
    if (body.availabilities && Array.isArray(body.availabilities)) {
      return await handleBulkAvailability(user.id, body);
    }

    // Single availability creation/update
    return await handleSingleAvailability(user.id, body);
  } catch (error) {
    console.error('Error managing dealer availability:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
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

// PUT - Update specific availability
export async function PUT(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a dealer
    if (user.role !== 'DEALER') {
      return NextResponse.json(
        { error: 'Only dealers can manage availability' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateAvailabilitySchema.parse(body);

    // Check if we have an ID for specific availability update
    const { searchParams } = new URL(request.url);
    const availabilityId = searchParams.get('id');

    if (availabilityId) {
      // Prepare update data with proper Date conversion
      const updateData: { isAvailable?: boolean; date?: Date } = {};
      
      if (validatedData.isAvailable !== undefined) {
        updateData.isAvailable = validatedData.isAvailable;
      }
      
      if (validatedData.date) {
        const date = new Date(validatedData.date);
        if (isNaN(date.getTime())) {
          return NextResponse.json(
            { error: 'Invalid date format' },
            { status: 400 }
          );
        }
        updateData.date = date;
      }

      // Update specific availability by ID
      const updatedAvailability = await DatabaseService.updateDealerAvailability(
        availabilityId,
        updateData
      );

      return NextResponse.json({
        success: true,
        data: updatedAvailability,
        message: 'Availability updated successfully',
      });
    }

    // If no ID, use date-based update
    if (!validatedData.date) {
      return NextResponse.json(
        { error: 'Date is required for availability update' },
        { status: 400 }
      );
    }

    const date = new Date(validatedData.date);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const updatedAvailability = await DatabaseService.setDealerAvailability({
      dealerId: user.id,
      date,
      isAvailable: validatedData.isAvailable ?? true,
    });

    return NextResponse.json({
      success: true,
      data: updatedAvailability,
      message: 'Availability updated successfully',
    });
  } catch (error) {
    console.error('Error updating dealer availability:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
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

// DELETE - Remove availability
export async function DELETE(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a dealer
    if (user.role !== 'DEALER') {
      return NextResponse.json(
        { error: 'Only dealers can manage availability' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const availabilityId = searchParams.get('id');
    const date = searchParams.get('date');

    if (availabilityId) {
      // Delete by ID
      await DatabaseService.deleteDealerAvailability(availabilityId);
      
      return NextResponse.json({
        success: true,
        message: 'Availability deleted successfully',
      });
    }

    if (date) {
      // Delete by date
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        );
      }

      const availability = await DatabaseService.getDealerAvailabilityByDate(user.id, dateObj);
      if (availability) {
        await DatabaseService.deleteDealerAvailability(availability.id);
      }

      return NextResponse.json({
        success: true,
        message: 'Availability deleted successfully',
      });
    }

    return NextResponse.json(
      { error: 'Either id or date parameter is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting dealer availability:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Check availability for specific date
export async function PATCH(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CheckAvailabilitySchema.parse(body);

    const date = new Date(validatedData.date);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    let dealerId = validatedData.dealerId;

    if (!dealerId) {
      // If no dealerId provided, use the current user's ID (if they're a dealer)
      if (user.role !== 'DEALER') {
        return NextResponse.json(
          { error: 'Dealer ID is required for non-dealer users' },
          { status: 400 }
        );
      }
      dealerId = user.id;
    } else if (user.role !== 'ADMIN' && dealerId !== user.id) {
      // Only admins can check other dealers' availability
      return NextResponse.json(
        { error: 'Not authorized to check this dealer availability' },
        { status: 403 }
      );
    }

    const isAvailable = await DatabaseService.checkDealerAvailability(dealerId, date);

    return NextResponse.json({
      success: true,
      data: {
        dealerId,
        date: validatedData.date,
        isAvailable,
      },
    });
  } catch (error) {
    console.error('Error checking dealer availability:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
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

// Helper function for single availability
// Helper function for single availability
async function handleSingleAvailability(dealerId: string, body: any) {
  // Check if required fields exist before validation
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { error: 'Request body is required' },
      { status: 400 }
    );
  }

  if (!body.date) {
    return NextResponse.json(
      { error: 'Date field is required' },
      { status: 400 }
    );
  }

  try {
    const validatedData = CreateAvailabilitySchema.parse(body);
    
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
        { error: 'Cannot set availability for past dates' },
        { status: 400 }
      );
    }

    const availability = await DatabaseService.setDealerAvailability({
      dealerId,
      date,
      isAvailable: validatedData.isAvailable,
    });

    return NextResponse.json({
      success: true,
      data: availability,
      message: 'Availability set successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const dateError = error.errors.find(e => e.path.includes('date'));
      if (dateError) {
        return NextResponse.json(
          { 
            error: 'Invalid date data',
            details: dateError.message
          },
          { status: 400 }
        );
      }
    }
    throw error; // Re-throw to be handled by the main catch block
  }
}

// Helper function for bulk availability
async function handleBulkAvailability(dealerId: string, body: any) {
  const validatedData = BulkAvailabilitySchema.parse(body);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Validate all dates and check for past dates
  const availabilityUpdates = validatedData.availabilities.map(avail => {
    const date = new Date(avail.date);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${avail.date}`);
    }
    if (date < today) {
      throw new Error(`Cannot set availability for past date: ${avail.date}`);
    }
    return {
      date,
      isAvailable: avail.isAvailable,
    };
  });

  const results = await DatabaseService.bulkUpdateDealerAvailability(
    dealerId,
    availabilityUpdates
  );

  return NextResponse.json({
    success: true,
    data: results,
    message: `Bulk availability updated for ${results.length} dates`,
  });
}