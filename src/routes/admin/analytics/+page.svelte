<script lang="ts">
    import StatsCard from "$lib/components/admin/StatsCard.svelte";
    import TrafficChart from "$lib/components/admin/TrafficChart.svelte";
    import TopArticlesChart from "$lib/components/admin/TopArticlesChart.svelte";
    import DeviceChart from "$lib/components/admin/DeviceChart.svelte";
    import SourcesChart from "$lib/components/admin/SourcesChart.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    // PageData type union omits devices/sources
    let pd = $derived.by(() => data as any);
</script>

<svelte:head>
    <title>Analytics — Hermes Admin</title>
</svelte:head>

<div class="space-y-6">
    <h1 class="text-2xl font-bold text-white">Analytics</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
            title="Total Views"
            value={data.stats?.totalViews ?? 0}
            icon="views"
        />
        <StatsCard
            title="Total Articles"
            value={data.stats?.totalArticles ?? 0}
            icon="articles"
        />
        <StatsCard
            title="Visitors Today"
            value={data.stats?.visitorsToday ?? 0}
            icon="visitors"
        />
        <StatsCard
            title="AI Draft Queue"
            value={data.stats?.aiDraftQueue ?? 0}
            icon="queue"
        />
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TrafficChart initialData={data.stats?.dailyViews ?? []} />
        <TopArticlesChart initialArticles={data.trending ?? []} />
    </div>

    <!-- Charts Row 2 -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DeviceChart data={pd.devices ?? []} />
        <SourcesChart data={pd.sources ?? []} />
    </div>

    <!-- Top Articles Table -->
    {#if data.articles && data.articles.length > 0}
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
            <div class="mb-5 flex items-center justify-between">
                <div>
                    <h2 class="text-lg font-semibold text-white">
                        All Articles
                    </h2>
                    <p class="text-xs text-slate-500">
                        {data.stats?.totalArticles ?? 0} total articles
                    </p>
                </div>
                <a
                    href="/admin/articles"
                    class="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-600 transition-colors"
                >
                    View All
                </a>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead>
                        <tr class="border-b border-slate-700/50">
                            <th
                                class="pb-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wider"
                                >Title</th
                            >
                            <th
                                class="pb-3 px-4 font-semibold text-slate-400 text-xs uppercase tracking-wider"
                                >Status</th
                            >
                            <th
                                class="pb-3 px-4 font-semibold text-slate-400 text-xs uppercase tracking-wider"
                                >Views</th
                            >
                            <th
                                class="pb-3 px-4 font-semibold text-slate-400 text-xs uppercase tracking-wider"
                                >Read</th
                            >
                            <th
                                class="pb-3 pl-4 font-semibold text-slate-400 text-xs uppercase tracking-wider"
                                >Published</th
                            >
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700/30">
                        {#each data.articles as article}
                            <tr
                                class="group hover:bg-slate-700/20 transition-colors"
                            >
                                <td class="py-3.5 pr-4">
                                    <a
                                        href="/admin/articles/{article.id}/edit"
                                        class="font-medium text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-1"
                                    >
                                        {article.title}
                                    </a>
                                </td>
                                <td class="py-3.5 px-4">
                                    <span
                                        class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            article.status === "PUBLISHED"
                                                ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                                                : article.status === "REVIEW"
                                                  ? "bg-yellow-500/10 text-yellow-400 ring-1 ring-inset ring-yellow-500/20"
                                                  : article.status === "DRAFT"
                                                    ? "bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20"
                                                    : "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20"
                                        }`}
                                    >
                                        {article.status.toLowerCase()}
                                    </span>
                                </td>
                                <td
                                    class="py-3.5 px-4 tabular-nums text-slate-400"
                                    >{article.views}</td
                                >
                                <td class="py-3.5 px-4 text-slate-400"
                                    >{article.readTime ?? "—"}m</td
                                >
                                <td class="py-3.5 pl-4 text-slate-500">
                                    {article.publishedAt
                                        ? new Date(
                                              article.publishedAt,
                                          ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                          })
                                        : "—"}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}
</div>
