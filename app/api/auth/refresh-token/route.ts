import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RefreshTokenSchema } from '@/lib/schemas';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = RefreshTokenSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
        },
        { status: 400 }
      );
    }

    const { refreshToken } = parsedData.data;

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.id,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!storedToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired refresh token',
        },
        { status: 401 }
      );
    }

    // Generate new tokens
    const tokenPayload = { 
      id: storedToken.user.id, 
      email: storedToken.user.email, 
      role: storedToken.user.role 
    };
    
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Update refresh token in database
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const responseData = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      data: responseData,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid refresh token',
      },
      { status: 401 }
    );
  }
}