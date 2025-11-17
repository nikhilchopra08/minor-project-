import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '../../../../lib/middleware';
import { DatabaseService } from '../../../../lib/prisma';
import { BookingQuerySchema } from '../../../../lib/schemas';

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

    // Check if user is a dealer
    if (user.role !== 'DEALER') {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden - Dealers only',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    
    // Parse query parameters with proper defaults and filtering
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      status: searchParams.get('status') || undefined, // Use undefined instead of null
      month: searchParams.get('month') || undefined,
      year: searchParams.get('year') || undefined,
    };

    // Remove undefined values to avoid Zod validation issues
    const filteredParams = Object.fromEntries(
      Object.entries(queryParams).filter(([_, value]) => value !== undefined)
    );

    const validatedQuery = BookingQuerySchema.parse(filteredParams);

    const { page, limit, status, month, year } = validatedQuery;

    // Use DatabaseService to get dealer bookings
    const bookingsData = await DatabaseService.findDealerBookings(user.id, {
      page,
      limit,
      status,
      month,
      year
    });

    // Get booking statistics for dealer
    const stats = await DatabaseService.getBookingStats(user.id);

    const today = new Date();
    const upcomingBookings = await DatabaseService.findDealerBookings(user.id, {
      status: 'SCHEDULED',
      page: 1,
      limit: 100 // Get all upcoming bookings for count
    });

    return NextResponse.json({
      success: true,
      message: 'Dealer bookings retrieved successfully',
      data: {
        bookings: bookingsData.bookings,
        stats: {
          totalBookings: stats.total,
          totalRevenue: stats.totalRevenue,
          upcomingBookings: upcomingBookings.totalCount,
          scheduled: stats.scheduled,
          inProgress: stats.inProgress,
          completed: stats.completed,
          cancelled: stats.cancelled,
          completionRate: stats.completionRate
        },
        pagination: {
          page: bookingsData.page,
          limit: bookingsData.limit,
          total: bookingsData.totalCount,
          pages: bookingsData.totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Get dealer bookings error:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid query parameters',
          errors: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}