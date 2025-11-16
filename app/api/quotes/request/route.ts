import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { authMiddleware } from '../../../../lib/middleware';
import { QuoteRequestSchema } from '../../../../lib/schemas';

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
    const parsedData = QuoteRequestSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
        },
        { status: 400 }
      );
    }

    // Verify dealer exists and is actually a dealer
    const dealer = await prisma.user.findFirst({
      where: {
        id: parsedData.data.dealerId,
        role: 'DEALER',
      },
    });

    if (!dealer) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dealer not found',
        },
        { status: 404 }
      );
    }

    const quote = await prisma.quote.create({
      data: {
        userId: user.id,
        dealerId: parsedData.data.dealerId,
        location: parsedData.data.location,
        currentSetup: parsedData.data.currentSetup,
        powerUsage: parsedData.data.powerUsage,
        renovationType: parsedData.data.renovationType,
        description: parsedData.data.description,
        images: parsedData.data.images || [],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      include: {
        dealer: {
          include: {
            dealerProfile: {
              select: {
                businessName: true,
                city: true,
                state: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Quote request submitted successfully',
        data: quote,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create quote error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}