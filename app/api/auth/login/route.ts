import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { LoginSchema } from '../../../../lib/schemas';
import { compare } from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../../../../lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = LoginSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
        },
        { status: 400 }
      );
    }

    const { email, password } = parsedData.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userProfile: true,
        dealerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Prepare user data
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.role === 'USER' ? user.userProfile : user.dealerProfile,
    };

    const responseData = {
      user: userData,
      accessToken,
      refreshToken,
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: responseData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}