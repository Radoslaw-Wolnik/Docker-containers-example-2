import { UnauthorizedError } from './errors';
import prisma from './prisma';
import logger from './logger';
import { BadRequestError } from './errors';

export async function checkUserBanStatus(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true, banExpiresAt: true },
  });

  if (user?.isBanned) {
    if (user.banExpiresAt && user.banExpiresAt <= new Date()) {
      await prisma.user.update({
        where: { id: userId },
        data: { isBanned: false, banExpiresAt: null },
      });
    } else {
      throw new UnauthorizedError('User is banned');
    }
  }
}

export async function addStrike(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { strikes: true },
  });

  if (!user) {
    throw new BadRequestError('User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { strikes: { increment: 1 } },
  });

  logger.info(`Strike added to user`, { userId, newStrikeCount: updatedUser.strikes });

  if (updatedUser.strikes >= 3) {
    await banUser(userId, 7); // Ban for 7 days after 3 strikes
  }

  return updatedUser.strikes;
}

async function banUser(userId: number, days: number) {
  const banExpiresAt = new Date();
  banExpiresAt.setDate(banExpiresAt.getDate() + days);

  await prisma.user.update({
    where: { id: userId },
    data: { 
      isBanned: true, 
      banExpiresAt,
    },
  });

  logger.info(`User banned`, { userId, banExpiresAt });
}