import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { authMiddleware, roleMiddleware } from '../../../../../lib/middleware';
import { QuoteResponseSchema } from '../../../../../lib/schemas';

interface Context {
  params: {
    id: string;  // Changed from quoteId to id
  };
}

export async function POST(req: NextRequest, context: Context) {
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

    const { id } = context.params;  // Changed from quoteId to id
    const body = await req.json();
    const parsedData = QuoteResponseSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
        },
        { status: 400 }
      );
    }

    // Verify quote exists and belongs to this dealer
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id: id,  // Use id directly
        dealerId: dealer.id,
      },
    });

    if (!existingQuote) {
      return NextResponse.json(
        {
          success: false,
          message: 'Quote not found or access denied',
        },
        { status: 404 }
      );
    }

    if (existingQuote.status !== 'PENDING') {
      return NextResponse.json(
        {
          success: false,
          message: 'Quote already responded to',
        },
        { status: 400 }
      );
    }

    const updatedQuote = await prisma.quote.update({
      where: { id: id },
      data: {
        proposedServices: parsedData.data.proposedServices,
        totalAmount: parsedData.data.totalAmount,
        breakdown: parsedData.data.breakdown,
        timeline: parsedData.data.timeline,
        warranty: parsedData.data.warranty,
        notes: parsedData.data.notes,
        status: 'RESPONDED',
      },
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
      message: 'Quote response submitted successfully',
      data: updatedQuote,
    });
  } catch (error) {
    console.error('Respond to quote error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}