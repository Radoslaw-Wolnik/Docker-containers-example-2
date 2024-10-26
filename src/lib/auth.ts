import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import { UnauthorizedError } from './errors';
import logger from './logger';
import prisma from './prisma';
import { UserRole, SessionUser, PublicUser, SafeUser } from '../types/global';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

declare module "next-auth" {
  interface User extends Omit<AuthUser, 'id'> {
    id: string;
  }
  
  interface Session {
    user: SessionUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    username: string;
  }
}


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.username || !credentials?.password) {
          throw new UnauthorizedError("Invalid credentials");
        }

        try {
          const user = await authenticateUser(credentials.username, credentials.password);
          return {
            id: user.id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          logger.warn('Login attempt failed', { username: credentials.username, error: error instanceof Error ? error.message : String(error) });
          throw new UnauthorizedError("Invalid credentials");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: parseInt(token.id),
        username: token.username,
        email: session.user.email,
        role: token.role,
      } as SessionUser;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export async function authenticateUser(username: string, password: string): Promise<AuthUser> {
  if (!username || !password) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const user = await prisma.user.findUnique({
    where: { username }
  });

  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  logger.info('User authenticated', { userId: user.id });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) }
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role as UserRole,
    profilePicture: user.profilePicture,
  };
}