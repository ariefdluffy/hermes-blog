import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { requireAuth } from "$lib/server/auth/utils";
import { canAction } from "$lib/server/auth/permissions";
import {
  getDashboardStats,
  getArticleStats,
  getTrendingArticles,
  getDeviceBreakdown,
  getTrafficSources,
} from "$lib/server/analytics";

export const GET: RequestHandler = async ({ locals, url }) => {
  requireAuth(locals);
  if (!canAction(locals.user!.role, "VIEW_ANALYTICS")) {
    return json({ error: "Forbidden" }, { status: 403 });
  }

  const articleId = url.searchParams.get("articleId");
  const trending = url.searchParams.get("trending");
  const devices = url.searchParams.get("devices");
  const sources = url.searchParams.get("sources");
  const days = Number(url.searchParams.get("days")) || 30;

  // Article-specific stats
  if (articleId) {
    const stats = await getArticleStats(articleId);
    return json(stats);
  }

  // Trending articles
  if (trending === "true") {
    const limit = Number(url.searchParams.get("limit")) || 10;
    const articles = await getTrendingArticles(days, limit);
    return json({ data: articles });
  }

  // Device breakdown
  if (devices === "true") {
    const data = await getDeviceBreakdown(days);
    return json({ data });
  }

  // Traffic sources
  if (sources === "true") {
    const data = await getTrafficSources(days);
    return json({ data });
  }

  // Dashboard stats (default)
  const stats = await getDashboardStats(days);
  return json(stats);
};
