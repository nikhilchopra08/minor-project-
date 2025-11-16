import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { authMiddleware, roleMiddleware } from '../../../../../lib/middleware';
import { QuoteRevisionSchema } from '../../../../../lib/schemas';

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
    const parsedData = QuoteRevisionSchema.safeParse(body);

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
        id,
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

    if (!['RESPONDED', 'REVISED'].includes(existingQuote.status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Quote cannot be revised in its current status',
        },
        { status: 400 }
      );
    }

    // Create revision history
    const revisionHistory = Array.isArray(existingQuote.revisions) 
      ? [...existingQuote.revisions]
      : [];

    revisionHistory.push({
      timestamp: new Date().toISOString(),
      proposedServices: existingQuote.proposedServices,
      totalAmount: existingQuote.totalAmount,
      breakdown: existingQuote.breakdown,
      timeline: existingQuote.timeline,
      warranty: existingQuote.warranty,
      notes: existingQuote.notes,
    });

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: {
        ...parsedData.data,
        revisions: revisionHistory,
        status: 'REVISED',
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
      message: 'Quote revised successfully',
      data: updatedQuote,
    });
  } catch (error) {
    console.error('Revise quote error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}