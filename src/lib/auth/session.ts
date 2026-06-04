import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

type JwtPayload = {
  sub: string; // userId
  role: Role;
  language: string;
  email: string;
  iat?: number;
  exp?: number;
};

const COOKIE_NAME = process.env.COOKIE_NAME || "sbsa_session";
const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_SECONDS = Number(process.env.JWT_EXPIRES_SECONDS || "86400");

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signSessionToken(payload: Omit<JwtPayload, "iat" | "exp">) {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: JWT_EXPIRES_SECONDS });
}

export function verifySessionToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const decoded = verifySessionToken(token);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    select: { id: true, email: true, name: true, role: true, language: true },
  });
  return user;
}

export async function getCurrentUserOrThrow() {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error("Unauthorized");
    (err as any).statusCode = 401;
    throw err;
  }
  return user;
}

