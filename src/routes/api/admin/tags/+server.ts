import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db";
import { canAction } from "$lib/server/auth/permissions";
import { slugify } from "$lib/utils";
import { z } from "zod";

const createTagSchema = z.object({
  name: z.string().min(1).max(100),
});

export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canAction(locals.user.role, "MANAGE_TAGS")) {
    return json({ error: "Forbidden" }, { status: 403 });
  }

  const search = url.searchParams.get("search") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const perPage = Math.min(
    50,
    Math.max(1, Number(url.searchParams.get("perPage")) || 50),
  );

  const where = search
    ? {
        OR: [{ name: { contains: search } }, { slug: { contains: search } }],
      }
    : {};

  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        _count: {
          select: { articles: { where: { article: { status: "PUBLISHED" } } } },
        },
      },
    }),
    prisma.tag.count({ where }),
  ]);

  return json({
    data: tags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      articleCount: t._count.articles,
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  });
};

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canAction(locals.user.role, "MANAGE_TAGS")) {
    return json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createTagSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name } = parsed.data;
  const slug = slugify(name);

  const existing = await prisma.tag.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) {
    return json(
      { error: "Tag with this name or slug already exists" },
      { status: 409 },
    );
  }

  const tag = await prisma.tag.create({
    data: { name, slug },
  });

  return json(tag, { status: 201 });
};
