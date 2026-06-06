import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db";
import { requireRole } from "$lib/server/auth/utils";
import { hashPassword } from "$lib/server/auth";
import { z } from "zod";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const PUT: RequestHandler = async ({ locals, params, request }) => {
  requireRole(locals, ["SUPERADMIN"]);

  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) {
    return json({ error: "User not found" }, { status: 404 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.update({
    where: { id: params.id },
    data: {
      passwordHash,
      resetToken: null,
    },
  });

  return json({ success: true });
};
