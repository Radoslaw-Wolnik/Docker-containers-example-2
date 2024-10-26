import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { BadRequestError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user not found for security
      return NextResponse.json({
        message: 'If an account exists, a password reset link has been sent',
      });
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 12);

    // Save token
    await prisma.token.create({
      data: {
        userId: user.id,
        token: hashedToken,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    // Send email
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return NextResponse.json({
      message: 'If an account exists, a password reset link has been sent',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      throw new BadRequestError('Invalid request');
    }

    // Find valid token
    const resetToken = await prisma.token.findFirst({
      where: {
        type: 'PASSWORD_RESET',
        expiresAt: { gt: new Date() },
        isActive: true,
      },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Verify token
    const isValid = await bcrypt.compare(token, resetToken.token);
    if (!isValid) {
      throw new BadRequestError('Invalid reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and invalidate token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.token.update({
        where: { id: resetToken.id },
        data: { isActive: false },
      }),
    ]);

    return NextResponse.json({
      message: 'Password reset successful',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset password' },
      { status: error instanceof BadRequestError ? 400 : 500 }
    );
  }
}