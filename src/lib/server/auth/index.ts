import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { JWT_SECRET } from "$env/static/private";
export const TOKEN_EXPIRY = "7d" as const;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export interface JwtPayload {
  id: string;
  username: string;
  email?: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function createAccessToken(user: {
  id: string;
  username: string;
  email: string;
  role: string;
}): string {
  return signToken({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
}
