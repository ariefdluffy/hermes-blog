import { json } from "@sveltejs/kit";
import { z } from "zod";
import prisma from "$lib/server/db";
import { sendResetPasswordEmail } from "$lib/server/email";
import type { RequestHandler } from "./$types";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Always return 200 to avoid leaking user existence
    if (!user) {
      return json(
        { message: "If the email exists, a reset link has been sent" },
        { status: 200 },
      );
    }

    // Generate reset token (1 hour expiry)
    const resetToken = crypto.randomUUID();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Fire and forget — don't block response on email sending
    // In development, also log the reset link so it can be used directly
    sendResetPasswordEmail(cleanEmail, resetToken).catch(() => {
      console.error(`Failed to send reset password email to ${cleanEmail}`);
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `\n[DEV] Password reset link: ${process.env.PUBLIC_APP_URL ?? "http://localhost:5173"}/auth/reset-password?token=${resetToken}\n`,
        );
      }
    });

    return json(
      { message: "If the email exists, a reset link has been sent" },
      { status: 200 },
    );
  } catch (err) {
    console.error("Forgot password error:", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
