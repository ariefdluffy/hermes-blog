import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db";
import { requireRole } from "$lib/server/auth/utils";
import { z } from "zod";
import { ROLES } from "$lib/constants";

const updateUserSchema = z.object({
  role: z.enum([ROLES.SUPERADMIN, ROLES.EDITOR, ROLES.AUTHOR]).optional(),
});

export const GET: RequestHandler = async ({ locals, params }) => {
  requireRole(locals, ["SUPERADMIN"]);

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { articles: true } },
    },
  });

  if (!user) {
    return json({ error: "User not found" }, { status: 404 });
  }

  return json({
    ...user,
    articleCount: user._count.articles,
  });
};

export const PUT: RequestHandler = async ({ locals, params, request }) => {
  requireRole(locals, ["SUPERADMIN"]);

  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { role } = parsed.data;
  if (!role) {
    return json({ error: "No fields to update" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing) {
    return json({ error: "User not found" }, { status: 404 });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return json(user);
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
  requireRole(locals, ["SUPERADMIN"]);

  if (locals.user!.id === params.id) {
    return json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) {
    return json({ error: "User not found" }, { status: 404 });
  }

  if (user.role === "SUPERADMIN") {
    return json({ error: "Cannot delete a SUPERADMIN" }, { status: 400 });
  }

  // Delete user's articles' tags, analytics, then articles, then user
  await prisma.$transaction([
    prisma.articleTag.deleteMany({
      where: { article: { authorId: params.id } },
    }),
    prisma.analytics.deleteMany({
      where: { article: { authorId: params.id } },
    }),
    prisma.article.deleteMany({
      where: { authorId: params.id },
    }),
    prisma.user.delete({
      where: { id: params.id },
    }),
  ]);

  return json({ success: true });
};
