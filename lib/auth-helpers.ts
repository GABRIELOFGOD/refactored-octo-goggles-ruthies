
import { ApiResponse, IUser, JwtPayload } from '@/types';
import { hash, compare } from 'bcryptjs';
import { sign, verify } from "jsonwebtoken";
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';
import { NextRequest } from 'next/server';

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(5, '0');
  return `RA-${year}${month}${day}-${random}`;
}

export function generateBookingNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(5, '0');
  return `RB-${year}${month}-${random}`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateSKU(productSlug: string, variantIndex: number): string {
  const base = productSlug.substring(0, 3).toUpperCase();
  const date = Date.now().toString().slice(-4);
  const index = String(variantIndex + 1).padStart(2, '0');
  return `${base}-${date}-${index}`;
}

export const signToken = (payload: JwtPayload) => {
  return sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d"
  });
};

export const verifyToken = (token: string) => {
  return verify(token, process.env.JWT_SECRET!);
}

export const authenticateUser = async (request: NextRequest): Promise<IUser> => {
  try {
    const tokenHeader = request.headers.get("authorization");
    if (!tokenHeader) throw new Error("Please please login");

    const splitHeader = tokenHeader.split(" ");
    if (splitHeader[0] !== "Bearer") throw new Error("Please send a Bearer token")

    const decodedToken = verifyToken(splitHeader[1]) as JwtPayload;

    await connectToDatabase()
    const user = await User.findById(decodedToken.id);
    if (!user || user.isDeleted) throw new Error("User not found");
    return user;
  } catch (error) {
    throw error;
  }
}
