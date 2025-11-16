import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { authMiddleware } from '../../../../../lib/middleware';

interface Context {
  params: {
    id: string;
  };
}

export async function PUT(req: NextRequest, context: Context) {
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

    const { id } = context.params;

    // Verify quote exists and belongs to this user
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id,
        userId: user.id,
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
          message: 'Quote cannot be accepted in its current status',
        },
        { status: 400 }
      );
    }

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
      },
      include: {
        dealer: {
          include: {
            dealerProfile: {
              select: {
                businessName: true,
                businessEmail: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Quote accepted successfully',
      data: updatedQuote,
    });
  } catch (error) {
    console.error('Accept quote error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}