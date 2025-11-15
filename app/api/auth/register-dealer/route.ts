import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { RegisterDealerSchema } from '../../../../lib/schemas';
import { hash } from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = RegisterDealerSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input',
        },
        { status: 400 }
      );
    }

    const { email, password, businessName, businessEmail, phone, gstNumber, address, city, state, description } = parsedData.data;

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

    // Create dealer and profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'DEALER',
        dealerProfile: {
          create: {
            businessName,
            businessEmail,
            phone,
            gstNumber,
            address,
            city,
            state,
            description,
          },
        },
      },
      include: {
        dealerProfile: true,
      },
    });

    const responseData = {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.dealerProfile,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Dealer registered successfully',
        data: responseData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Dealer registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}