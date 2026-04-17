import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User } from '@/models/User';
import { verifyPassword } from '@/lib/auth-helpers';
import connectToDatabase from '@/lib/mongoose';
import { IUser } from '@/types';

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password required');
          }

          await connectToDatabase();

          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
            isDeleted: { $ne: true },
          }).select('+passwordHash');

          if (!user) {
            throw new Error('User not found');
          }

          if (!user.passwordHash) {
            throw new Error('Invalid credentials');
          }

          const isPasswordValid = await verifyPassword(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }

          // Update last login
          user.lastLoginAt = new Date();
          await user.save();

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            preferredCurrency: user.preferredCurrency,
            preferredLanguage: user.preferredLanguage,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.avatar = (user as any).avatar;
        token.preferredCurrency = (user as any).preferredCurrency;
        token.preferredLanguage = (user as any).preferredLanguage;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.avatar = token.avatar as string;
        session.user.preferredCurrency = token.preferredCurrency as string;
        session.user.preferredLanguage = token.preferredLanguage as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} as any;

const authInstance = NextAuth(authConfig);

export const handlers = authInstance.handlers;
export const auth = authInstance.auth;
export const signIn = authInstance.signIn;
export const signOut = authInstance.signOut;

// This type ensures that TypeScript knows the correct properties
declare module 'next-auth' {
  interface User {
    role: string;
    avatar?: string;
    preferredCurrency: string;
    preferredLanguage: string;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
      avatar?: string;
      preferredCurrency: string;
      preferredLanguage: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    avatar?: string;
    preferredCurrency: string;
    preferredLanguage: string;
  }
}
