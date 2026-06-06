export async function load({
  fetch,
}: {
  fetch: (info: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}) {
  const res = await fetch("/api/admin/analytics");
  const stats = (res.ok ? await res.json() : null) as {
    totalViews: number;
    totalArticles: number;
    visitorsToday: number;
    aiDraftQueue: number;
    dailyViews: { date: string; views: number }[];
  } | null;

  const trendingRes = await fetch(
    "/api/admin/analytics?trending=true&days=30&limit=10",
  );
  const trending: {
    id: string;
    title: string;
    views: number;
    slug: string;
    author?: { id: string; username: string };
  }[] = trendingRes.ok ? ((await trendingRes.json()).data ?? []) : [];

  const devicesRes = await fetch("/api/admin/analytics?devices=true&days=30");
  const devices: { label: string; count: number; percentage: number }[] =
    devicesRes.ok ? ((await devicesRes.json()).data ?? []) : [];

  const sourcesRes = await fetch("/api/admin/analytics?sources=true&days=30");
  const sources: { label: string; count: number; percentage: number }[] =
    sourcesRes.ok ? ((await sourcesRes.json()).data ?? []) : [];

  const articlesRes = await fetch("/api/admin/articles?perPage=10");
  const articles: {
    id: string;
    title: string;
    status: string;
    views: number;
    readTime: number | null;
    publishedAt: string | null;
  }[] = articlesRes.ok ? ((await articlesRes.json()).data ?? []) : [];

  return { stats, trending, devices, sources, articles };
}
