import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db";
import { canAction } from "$lib/server/auth/permissions";
import { slugify } from "$lib/utils";
import { z } from "zod";

const updateTagSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const GET: RequestHandler = async ({ locals, params }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const tag = await prisma.tag.findUnique({
    where: { id: params.id },
  });
  if (!tag) {
    return json({ error: "Tag not found" }, { status: 404 });
  }

  return json({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  });
};

export const PUT: RequestHandler = async ({ locals, params, request }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canAction(locals.user.role, "MANAGE_TAGS")) {
    return json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateTagSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name } = parsed.data;
  if (!name) {
    return json({ error: "No fields to update" }, { status: 400 });
  }

  const existing = await prisma.tag.findUnique({ where: { id: params.id } });
  if (!existing) {
    return json({ error: "Tag not found" }, { status: 404 });
  }

  const slug = slugify(name);
  const conflict = await prisma.tag.findFirst({
    where: { OR: [{ name }, { slug }], NOT: { id: params.id } },
  });
  if (conflict) {
    return json({ error: "Tag name or slug already in use" }, { status: 409 });
  }

  const tag = await prisma.tag.update({
    where: { id: params.id },
    data: { name, slug },
  });

  return json(tag);
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  if (locals.user.role !== "SUPERADMIN") {
    return json({ error: "Forbidden" }, { status: 403 });
  }

  const tag = await prisma.tag.findUnique({
    where: { id: params.id },
  });
  if (!tag) {
    return json({ error: "Tag not found" }, { status: 404 });
  }

  // Disassociate all articles then delete
  await prisma.articleTag.deleteMany({ where: { tagId: params.id } });

  await prisma.tag.delete({ where: { id: params.id } });
  return json({ success: true });
};
