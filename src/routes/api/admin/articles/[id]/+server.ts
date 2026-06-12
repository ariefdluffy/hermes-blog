import { json } from "@sveltejs/kit";
import { z } from "zod";
import { prisma } from "$lib/server/db";
import { canAction } from "$lib/server/auth/permissions";
import { slugify, calculateReadTime } from "$lib/utils";
import type { ArticleResponse } from "$lib/types";
import type { RequestHandler } from "./$types";

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  excerpt: z.string().min(1).max(1000).optional(),
  content: z.string().min(1).optional(),
  contentType: z.enum(["MARKDOWN", "HTML"]).optional(),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal("")).optional(),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

function authError() {
  return json({ error: "Unauthorized" }, { status: 401 });
}

function forbiddenError() {
  return json({ error: "Forbidden" }, { status: 403 });
}

function mapArticle(a: any): ArticleResponse {
  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    content: a.content,
    contentType: a.contentType,
    seoTitle: a.seoTitle,
    seoDescription: a.seoDescription,
    coverImage: a.coverImage,
    views: a.views,
    readTime: a.readTime,
    status: a.status,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    author: a.author,
    category: a.category ?? null,
    tags: a.tags.map((at: any) => at.tag),
  };
}

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return authError();

  const isAuthor = locals.user.role === "AUTHOR";
  if (!isAuthor && !canAction(locals.user.role, "MANAGE_ARTICLES"))
    return forbiddenError();

  const article = await prisma.article.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, username: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: {
        include: { tag: { select: { id: true, name: true, slug: true } } },
      },
    },
  });

  if (!article) {
    return json({ error: "Article not found" }, { status: 404 });
  }

  if (isAuthor && article.authorId !== locals.user.id) {
    return forbiddenError();
  }

  return json(mapArticle(article));
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) return authError();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const existing = await prisma.article.findUnique({
    where: { id: params.id },
    select: { id: true, authorId: true, status: true },
  });

  if (!existing) {
    return json({ error: "Article not found" }, { status: 404 });
  }

  if (
    !canAction(locals.user.role, "MANAGE_ARTICLES") &&
    !canAction(locals.user.role, "EDIT_OWN_ARTICLES")
  ) {
    return forbiddenError();
  }
  if (locals.user.role === "AUTHOR" && existing.authorId !== locals.user.id) {
    return forbiddenError();
  }

  if (data.title !== undefined) {
    const newSlug = slugify(data.title);
    const slugConflict = await prisma.article.findFirst({
      where: { slug: newSlug, NOT: { id: params.id } },
    });
    if (slugConflict) {
      return json(
        { error: "An article with this title already exists" },
        { status: 409 },
      );
    }
  }

  const updateData: any = {};
  if (data.title !== undefined) {
    updateData.title = data.title;
    updateData.slug = slugify(data.title);
  }
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
  if (data.content !== undefined) {
    updateData.content = data.content;
    updateData.readTime = calculateReadTime(data.content);
  }
  if (data.contentType !== undefined) updateData.contentType = data.contentType;
  if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle || null;
  if (data.seoDescription !== undefined)
    updateData.seoDescription = data.seoDescription || null;
  if (data.coverImage !== undefined)
    updateData.coverImage = data.coverImage || null;
  if (data.categoryId !== undefined)
    updateData.categoryId = data.categoryId || null;

  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      updateData.publishedAt = new Date();
    }
    if (data.status === "DRAFT") {
      updateData.publishedAt = null;
    }
  }

  if (data.tags !== undefined) {
    const tagRecords = await Promise.all(
      data.tags.map(async (tagName) => {
        const tagSlug = slugify(tagName);
        const existingTag = await prisma.tag.findUnique({
          where: { slug: tagSlug },
        });
        if (existingTag) return existingTag;
        return prisma.tag.create({ data: { name: tagName, slug: tagSlug } });
      }),
    );

    await prisma.articleTag.deleteMany({ where: { articleId: params.id } });
    updateData.tags = {
      create: tagRecords.map((tag) => ({ tagId: tag.id })),
    };
  }

  const article = await prisma.article.update({
    where: { id: params.id },
    data: updateData,
    include: {
      author: { select: { id: true, username: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: {
        include: { tag: { select: { id: true, name: true, slug: true } } },
      },
    },
  });

  return json(mapArticle(article));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return authError();
  if (locals.user.role !== "SUPERADMIN") return forbiddenError();

  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) {
    return json({ error: "Article not found" }, { status: 404 });
  }

  await prisma.article.delete({ where: { id: params.id } });

  return json({ success: true });
};
