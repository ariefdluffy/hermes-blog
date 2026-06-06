import { json } from "@sveltejs/kit";
import { z } from "zod";
import prisma from "$lib/server/db";
import { hashPassword } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { token, password } = parsed.data;

    const user = await prisma.user.findFirst({
      where: { resetToken: token },
    });

    if (!user) {
      return json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    // Check token expiry
    if (user.resetTokenExpiresAt && new Date() > user.resetTokenExpiresAt) {
      return json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
      },
    });

    return json({ message: "Password reset successful" }, { status: 200 });
  } catch (err) {
    console.error("Reset password error:", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
