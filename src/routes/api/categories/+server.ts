import { json } from "@sveltejs/kit";
import prisma from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { articles: { where: { status: "PUBLISHED" } } },
        },
      },
      orderBy: { name: "asc" },
    });

    return json({
      data: categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        icon: c.icon,
        count: c._count.articles,
      })),
    });
  } catch (err) {
    console.error("Categories API error:", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
