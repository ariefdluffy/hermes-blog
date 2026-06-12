import { prisma } from "$lib/server/db";
import type { Article } from "@prisma/client";
import crypto from "crypto";

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export async function trackView(
  articleId: string,
  request: Request,
  clientIp?: string,
): Promise<void> {
  const ip =
    clientIp ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const ipHash = hashIp(ip);
  const userAgent = request.headers.get("user-agent") ?? null;
  const referrer = request.headers.get("referer") ?? null;

  // Check for duplicate view within 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const existing = await prisma.analytics.findFirst({
    where: {
      articleId,
      ipHash,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (existing) return;

  await prisma.analytics.create({
    data: {
      articleId,
      ipHash,
      userAgent,
      referrer,
    },
  });

  // Increment view count on article
  await prisma.article.update({
    where: { id: articleId },
    data: { views: { increment: 1 } },
  });
}

export async function getArticleStats(articleId: string): Promise<{
  views: number;
  uniqueVisitors: number;
}> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { views: true },
  });

  if (!article) {
    return { views: 0, uniqueVisitors: 0 };
  }

  const uniqueVisitors = await prisma.analytics.groupBy({
    by: ["ipHash"],
    where: { articleId },
    _count: true,
  });

  return {
    views: article.views,
    uniqueVisitors: uniqueVisitors.length,
  };
}

export async function getTrendingArticles(
  days: number = 7,
  limit: number = 10,
): Promise<Article[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const trending = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { gte: since },
    },
    orderBy: { views: "desc" },
    take: limit,
    include: {
      author: { select: { id: true, username: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: {
        include: { tag: { select: { id: true, name: true, slug: true } } },
      },
    },
  });

  return trending;
}

export async function getDailyViews(
  days: number = 30,
): Promise<{ date: string; views: number }[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const records = await prisma.analytics.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const dailyMap = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dailyMap.set(d.toISOString().split("T")[0], 0);
  }

  for (const record of records) {
    const key = record.createdAt.toISOString().split("T")[0];
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
  }

  return Array.from(dailyMap.entries()).map(([date, views]) => ({
    date,
    views,
  }));
}

function categorizeDevice(ua: string | null): string {
  if (!ua) return "Unknown";
  const u = ua.toLowerCase();
  if (
    u.includes("mobile") ||
    u.includes("android") ||
    u.includes("iphone") ||
    u.includes("ipod") ||
    u.includes("blackberry")
  )
    return "Mobile";
  if (u.includes("tablet") || u.includes("ipad") || u.includes("playbook"))
    return "Tablet";
  return "Desktop";
}

function categorizeReferrer(ref: string | null): string {
  if (!ref || ref === "") return "Direct";
  const r = ref.toLowerCase();
  if (r.includes("google.")) return "Google";
  if (r.includes("twitter.com") || r.includes("x.com") || r.includes("t.co"))
    return "Twitter/X";
  if (r.includes("facebook.com") || r.includes("fb.com")) return "Facebook";
  if (r.includes("github.com")) return "GitHub";
  if (r.includes("linkedin.com")) return "LinkedIn";
  if (r.includes("instagram.com")) return "Instagram";
  if (r.includes("reddit.com")) return "Reddit";
  if (r.includes("telegram") || r.includes("t.me")) return "Telegram";
  if (r.includes("whatsapp") || r.includes("wa.me")) return "WhatsApp";
  return "Other";
}

function roundTo(n: number, decimals: number): number {
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export async function getDeviceBreakdown(
  days: number = 30,
): Promise<{ label: string; count: number; percentage: number }[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const records = await prisma.analytics.findMany({
    where: { createdAt: { gte: since } },
    select: { userAgent: true },
  });

  const counts: Record<string, number> = {};
  for (const r of records) {
    const device = categorizeDevice(r.userAgent);
    counts[device] = (counts[device] ?? 0) + 1;
  }

  const total = records.length || 1;
  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      percentage: roundTo((count / total) * 100, 1),
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getTrafficSources(
  days: number = 30,
): Promise<{ label: string; count: number; percentage: number }[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const records = await prisma.analytics.findMany({
    where: { createdAt: { gte: since } },
    select: { referrer: true },
  });

  const counts: Record<string, number> = {};
  for (const r of records) {
    const source = categorizeReferrer(r.referrer);
    counts[source] = (counts[source] ?? 0) + 1;
  }

  const total = records.length || 1;
  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      percentage: roundTo((count / total) * 100, 1),
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getDashboardStats(days: number = 30): Promise<{
  totalViews: number;
  totalArticles: number;
  visitorsToday: number;
  aiDraftQueue: number;
  dailyViews: { date: string; views: number }[];
}> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalViewsResult,
    totalArticlesResult,
    visitorsTodayResult,
    aiDraftQueueResult,
  ] = await Promise.all([
    prisma.article.aggregate({ _sum: { views: true } }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.analytics.groupBy({
      by: ["ipHash"],
      where: { createdAt: { gte: todayStart } },
      _count: true,
    }),
    prisma.article.count({ where: { status: "DRAFT" } }),
  ]);

  const dailyViews = await getDailyViews(days);

  return {
    totalViews: totalViewsResult._sum.views ?? 0,
    totalArticles: totalArticlesResult,
    visitorsToday: visitorsTodayResult.length,
    aiDraftQueue: aiDraftQueueResult,
    dailyViews,
  };
}
