import { json } from "@sveltejs/kit";
import { prisma } from "$lib/server/db";
import { trackView } from "$lib/server/analytics";
import type { RequestHandler } from "./$types";
import type { ArticleResponse } from "$lib/types";

export const GET: RequestHandler = async ({
  params,
  request,
  getClientAddress,
}) => {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: {
      author: { select: { id: true, username: true } },
      tags: {
        include: { tag: { select: { id: true, name: true, slug: true } } },
      },
    },
  });

  if (!article) {
    return json({ error: "Article not found" }, { status: 404 });
  }

  let clientIp: string | undefined;
  try {
    clientIp = getClientAddress();
  } catch {
    // Dev mode: getClientAddress may fail; fallback to x-forwarded-for in trackView
  }
  await trackView(article.id, request, clientIp);

  return json({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    contentType: article.contentType,
    seoTitle: article.seoTitle,
    seoDescription: article.seoDescription,
    coverImage: article.coverImage,
    views: article.views,
    readTime: article.readTime,
    status: article.status,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    author: article.author,
    tags: article.tags.map((at) => at.tag),
  } satisfies ArticleResponse);
};
