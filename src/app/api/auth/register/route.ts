import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { validateUser } from '@/utils/validation';
import { BadRequestError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    // Validate input
    const validation = validateUser({ username, email, password });
    if (!validation.isValid) {
      throw new BadRequestError(Object.values(validation.errors)[0]);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new BadRequestError(
        existingUser.email === email
          ? 'Email already registered'
          : 'Username already taken'
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: 'Registration successful',
      user,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Registration failed',
      },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}