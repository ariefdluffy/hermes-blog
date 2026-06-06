import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch("/api/admin/analytics");
  if (!res.ok) {
    return {
      stats: null,
      trending: [],
      articles: [],
      articlesTotal: 0,
      aiQueue: [],
      aiQueueTotal: 0,
    };
  }
  const stats = await res.json();

  // Fetch trending articles for Top Articles chart
  const trendingRes = await fetch(
    "/api/admin/analytics?trending=true&days=30&limit=5",
  );
  const trendingData = trendingRes.ok ? await trendingRes.json() : { data: [] };

  // Also fetch recent articles for the dashboard
  const articlesRes = await fetch("/api/admin/articles?perPage=5");
  const articlesData = articlesRes.ok
    ? await articlesRes.json()
    : { data: [], total: 0 };

  // Fetch AI draft queue
  const queueRes = await fetch("/api/admin/ai/queue?perPage=5");
  const queueData = queueRes.ok
    ? await queueRes.json()
    : { data: [], total: 0 };

  return {
    stats,
    trending: trendingData.data ?? [],
    articles: articlesData.data ?? [],
    articlesTotal: articlesData.total ?? 0,
    aiQueue: queueData.data ?? [],
    aiQueueTotal: queueData.total ?? 0,
  };
};
