import { json } from "@sveltejs/kit";
import { z } from "zod";
import prisma from "$lib/server/db";
import { hashPassword } from "$lib/server/auth";
import { sendVerificationEmail } from "$lib/server/email";
import { sanitizeInput } from "$lib/server/security";
import type { RequestHandler } from "./$types";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens",
    ),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { username, email, password } = parsed.data;
    const cleanUsername = sanitizeInput(username);
    const cleanEmail = email.toLowerCase().trim();

    // Check uniqueness
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanEmail }],
      },
    });

    if (existingUser) {
      if (existingUser.username === cleanUsername) {
        return json({ error: "Username already taken" }, { status: 409 });
      }
      return json({ error: "Email already registered" }, { status: 409 });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const verifyToken = crypto.randomUUID();

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        role: "AUTHOR",
        emailVerified: false,
        emailVerifyToken: verifyToken,
        emailVerifyTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    // Fire and forget — don't block registration on email sending
    sendVerificationEmail(cleanEmail, verifyToken).catch(() => {
      // Log in production; avoid crashing on email failure
      console.error(`Failed to send verification email to ${cleanEmail}`);
    });

    return json(user, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
