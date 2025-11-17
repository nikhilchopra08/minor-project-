import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware, roleMiddleware } from '@/lib/middleware';
import { UpdateUserProfileSchema } from '@/lib/schemas';

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

    // Allow both USER and DEALER roles to access their profiles
    if (!roleMiddleware(['USER', 'DEALER'])(user)) {
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
        userProfile: true,
        dealerProfile: true, // Include dealer profile if exists
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

    // Prepare response data based on user role
    let responseData;
    
    if (userData.role === 'DEALER') {
      responseData = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        profile: userData.dealerProfile, // Use dealer profile for dealers
        userProfile: userData.userProfile, // Also include user profile if needed
      };
    } else {
      responseData = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        profile: userData.userProfile, // Use user profile for regular users
        dealerProfile: userData.dealerProfile, // Also include dealer profile if exists
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: responseData,
    });
  } catch (error) {
    console.error('Get profile error:', error);
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

    // Allow both USER and DEALER to update their profiles
    if (!roleMiddleware(['USER', 'DEALER'])(user)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Forbidden',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsedData = UpdateUserProfileSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
        },
        { status: 400 }
      );
    }

    // Update different profiles based on user role
    let updatedUser;
    
    if (user.role === 'DEALER') {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          dealerProfile: {
            update: parsedData.data,
          },
        },
        include: {
          userProfile: true,
          dealerProfile: true,
        },
      });
    } else {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          userProfile: {
            update: parsedData.data,
          },
        },
        include: {
          userProfile: true,
          dealerProfile: true,
        },
      });
    }

    // Prepare response data based on user role
    let responseData;
    
    if (updatedUser.role === 'DEALER') {
      responseData = {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.dealerProfile,
        userProfile: updatedUser.userProfile,
      };
    } else {
      responseData = {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.userProfile,
        dealerProfile: updatedUser.dealerProfile,
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: responseData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}