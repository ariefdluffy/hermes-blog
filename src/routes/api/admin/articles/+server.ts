import { json } from "@sveltejs/kit";
import { z } from "zod";
import { prisma } from "$lib/server/db";
import { canAction } from "$lib/server/auth/permissions";
import { slugify, calculateReadTime } from "$lib/utils";
import { PAGINATION } from "$lib/constants";
import type { RequestHandler } from "./$types";
import type { ArticleResponse, PaginatedResponse } from "$lib/types";

const articleSchema = z.object({
  title: z.string().min(1).max(255),
  excerpt: z.string().min(1).max(1000),
  content: z.string().min(1),
  contentType: z.enum(["MARKDOWN", "HTML"]),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "REVIEW", "PUBLISHED"]).default("DRAFT"),
  tags: z.array(z.string()).default([]),
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
    tags: a.tags.map((at: any) => at.tag),
  };
}

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) return authError();

  const isAuthor = locals.user.role === "AUTHOR";
  if (!isAuthor && !canAction(locals.user.role, "MANAGE_ARTICLES"))
    return forbiddenError();

  const page = Math.max(
    1,
    Number(url.searchParams.get("page")) || PAGINATION.DEFAULT_PAGE,
  );
  const perPage = Math.min(
    PAGINATION.MAX_PER_PAGE,
    Math.max(
      1,
      Number(url.searchParams.get("perPage")) || PAGINATION.DEFAULT_PER_PAGE,
    ),
  );
  const status = url.searchParams.get("status");
  const authorId = url.searchParams.get("authorId");
  const search = url.searchParams.get("search")?.trim();

  const where: any = {};
  // AUTHOR hanya bisa lihat artikel sendiri
  if (isAuthor) {
    where.authorId = locals.user.id;
  } else {
    if (authorId) where.authorId = authorId;
  }
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        author: { select: { id: true, username: true } },
        tags: {
          include: { tag: { select: { id: true, name: true, slug: true } } },
        },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return json({
    data: articles.map(mapArticle),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  } satisfies PaginatedResponse<ArticleResponse>);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return authError();
  if (!canAction(locals.user.role, "CREATE_ARTICLES")) return forbiddenError();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const readTime = calculateReadTime(data.content);
  const slug = slugify(data.title);

  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    return json(
      { error: "An article with this title already exists" },
      { status: 409 },
    );
  }

  // Handle tags: connect existing or create new
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

  const article = await prisma.article.create({
    data: {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      contentType: data.contentType,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      coverImage: data.coverImage || null,
      readTime,
      status: data.status,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      authorId: locals.user.id,
      tags: {
        create: tagRecords.map((tag) => ({ tagId: tag.id })),
      },
    },
    include: {
      author: { select: { id: true, username: true } },
      tags: {
        include: { tag: { select: { id: true, name: true, slug: true } } },
      },
    },
  });

  return json(mapArticle(article), { status: 201 });
};
