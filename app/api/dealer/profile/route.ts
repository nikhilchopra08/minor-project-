import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware, roleMiddleware } from '@/lib/middleware';
import { UpdateDealerProfileSchema } from '@/lib/schemas';

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

    if (!roleMiddleware(['DEALER'])(user)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden',
        },
        { status: 403 }
      );
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        dealerProfile: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    const responseData = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      profile: userData.dealerProfile,
    };

    return NextResponse.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: responseData,
    });
  } catch (error) {
    console.error('Get dealer profile error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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

    if (!roleMiddleware(['DEALER'])(user)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsedData = UpdateDealerProfileSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
        },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        dealerProfile: {
          update: parsedData.data,
        },
      },
      include: {
        dealerProfile: true,
      },
    });

    const responseData = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      profile: updatedUser.dealerProfile,
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: responseData,
    });
  } catch (error) {
    console.error('Update dealer profile error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}