// File: src/lib/userModeration.ts

import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';
import { BadRequestError, ForbiddenError } from '@/lib/errors';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

export async function flagUser(userId: number, reason: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new BadRequestError('User not found');
  }

  await prisma.userFlag.create({
    data: {
      userId,
      reason,
    },
  });

  logger.info('User flagged', { userId, reason });
}

export async function addStrike(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new BadRequestError('User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { strikes: { increment: 1 } },
  });

  if (updatedUser.strikes >= 2) {
    await banUser(userId, 7);
  }

  logger.info('Strike added to user', { userId, totalStrikes: updatedUser.strikes });
}

export async function banUser(userId: number, days: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new BadRequestError('User not found');
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      isBanned: true,
      banExpiresAt: addDays(new Date(), days),
    },
  });

  logger.info('User banned', { userId, banDuration: days });
}

export async function checkUserBanStatus(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new BadRequestError('User not found');
  }

  if (user.isBanned) {
    if (user.banExpiresAt && user.banExpiresAt <= new Date()) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: false,
          banExpiresAt: null,
        },
      });
      logger.info('User ban expired', { userId });
    } else {
      throw new ForbiddenError('User is banned');
    }
  }
}