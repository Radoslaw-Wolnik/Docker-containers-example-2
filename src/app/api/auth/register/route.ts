// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { validateUser } from '@/utils/validation';
import { BadRequestError } from '@/lib/errors';
import { ApiResponse, RegisterFormData, UserCreateInput } from '@/types/global';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body: RegisterFormData = await req.json();
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
    const userData: UserCreateInput = {
      username,
      email,
      password: hashedPassword,
      role: 'USER',
    };

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    logger.info('New user registered', { userId: user.id });

    const response: ApiResponse = {
      message: 'Registration successful',
      data: user,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Registration error:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Registration failed',
      },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}