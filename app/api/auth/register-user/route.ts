import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RegisterUserSchema } from '@/lib/schemas';
import { hash } from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = RegisterUserSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
        },
        { status: 400 }
      );
    }

    const { email, password, fullName, phone, city, state, address } = parsedData.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User already exists with this email',
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER',
        userProfile: {
          create: {
            fullName,
            phone,
            city,
            state,
            address,
          },
        },
      },
      include: {
        userProfile: true,
      },
    });

    const responseData = {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.userProfile,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: responseData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}