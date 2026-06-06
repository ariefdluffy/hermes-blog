import { json } from "@sveltejs/kit";
import prisma from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { articles: { where: { article: { status: "PUBLISHED" } } } },
        },
      },
      orderBy: { name: "asc" },
    });

    return json({
      data: tags.map((t) => ({
        slug: t.slug,
        name: t.name,
        count: t._count.articles,
      })),
    });
  } catch (err) {
    console.error("Categories API error:", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
