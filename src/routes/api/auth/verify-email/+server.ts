import { json } from "@sveltejs/kit";
import prisma from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const token = url.searchParams.get("token");

  if (!token) {
    return json({ error: "Verification token is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      return json(
        { error: "Invalid or expired verification token" },
        { status: 400 },
      );
    }

    // Check token expiry
    if (
      user.emailVerifyTokenExpiresAt &&
      new Date() > user.emailVerifyTokenExpiresAt
    ) {
      return json(
        { error: "Verification token has expired. Please register again." },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
      },
    });

    return json({ message: "Email verified successfully" }, { status: 200 });
  } catch (err) {
    console.error("Verify email error:", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
