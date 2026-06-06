<script lang="ts">
    import StatsCard from "$lib/components/admin/StatsCard.svelte";
    import TrafficChart from "$lib/components/admin/TrafficChart.svelte";
    import TopArticlesChart from "$lib/components/admin/TopArticlesChart.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import type { PageData } from "./$types";

    let props: Props = $props();

    const statusVariant: Record<
        string,
        "default" | "success" | "warning" | "danger" | "info"
    > = {
        DRAFT: "default",
        REVIEW: "warning",
        PUBLISHED: "success",
        ARCHIVED: "danger",
    };

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    interface Props {
        data: PageData;
    }
</script>

<svelte:head>
    <title>Dashboard — Hermes Admin</title>
</svelte:head>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-white">Dashboard</h1>
        <a
            href="/admin/articles/create"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
            + New Article
        </a>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
            title="Total Views"
            value={props.data.stats?.totalViews ?? 0}
            icon="views"
        />
        <StatsCard
            title="Total Articles"
            value={props.data.stats?.totalArticles ?? 0}
            icon="articles"
        />
        <StatsCard
            title="Visitors Today"
            value={props.data.stats?.visitorsToday ?? 0}
            icon="visitors"
        />
        <StatsCard
            title="AI Draft Queue"
            value={props.data.stats?.aiDraftQueue ?? 0}
            icon="queue"
        />
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TrafficChart initialData={props.data.stats?.dailyViews ?? []} />
        <TopArticlesChart initialArticles={props.data.trending ?? []} />
    </div>

    <!-- Recent Articles -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
        <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white">Recent Articles</h2>
            <a
                href="/admin/articles"
                class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
                View all →
            </a>
        </div>

        {#if props.data.articles.length === 0}
            <p class="text-center text-slate-500 py-8">
                No articles yet. Create your first article!
            </p>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead>
                        <tr class="border-b border-slate-700/50">
                            <th class="pb-3 font-semibold text-slate-300"
                                >Title</th
                            >
                            <th class="pb-3 font-semibold text-slate-300"
                                >Status</th
                            >
                            <th class="pb-3 font-semibold text-slate-300"
                                >Views</th
                            >
                            <th class="pb-3 font-semibold text-slate-300"
                                >Date</th
                            >
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700/30">
                        {#each props.data.articles as article}
                            <tr class="hover:bg-slate-700/30 transition-colors">
                                <td class="py-3">
                                    <a
                                        href="/admin/articles/{article.id}/edit"
                                        class="font-medium text-white hover:text-blue-400 transition-colors"
                                    >
                                        {article.title}
                                    </a>
                                </td>
                                <td class="py-3">
                                    <Badge
                                        variant={statusVariant[
                                            article.status
                                        ] ?? "default"}
                                        size="sm"
                                    >
                                        {article.status}
                                    </Badge>
                                </td>
                                <td class="py-3 text-slate-400"
                                    >{article.views}</td
                                >
                                <td class="py-3 text-slate-400"
                                    >{formatDate(article.createdAt)}</td
                                >
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>

    <!-- AI Queue -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
        <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-white">AI Draft Queue</h2>
            <a
                href="/admin/ai"
                class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
                View all →
            </a>
        </div>

        {#if props.data.aiQueue.length === 0}
            <p class="text-center text-slate-500 py-8">
                No AI-generated drafts in queue.
            </p>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead>
                        <tr class="border-b border-slate-700/50">
                            <th class="pb-3 font-semibold text-slate-300"
                                >Title</th
                            >
                            <th class="pb-3 font-semibold text-slate-300"
                                >Tags</th
                            >
                            <th class="pb-3 font-semibold text-slate-300"
                                >Date</th
                            >
                            <th class="pb-3 font-semibold text-slate-300"
                                >Actions</th
                            >
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700/30">
                        {#each props.data.aiQueue as item}
                            <tr class="hover:bg-slate-700/30 transition-colors">
                                <td class="py-3">
                                    <a
                                        href="/admin/articles/{item.id}/edit"
                                        class="font-medium text-white hover:text-blue-400 transition-colors"
                                    >
                                        {item.title}
                                    </a>
                                </td>
                                <td class="py-3">
                                    <div class="flex flex-wrap gap-1">
                                        {#each item.tags as tag}
                                            <span
                                                class="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300"
                                                >{tag.name}</span
                                            >
                                        {/each}
                                    </div>
                                </td>
                                <td class="py-3 text-slate-400"
                                    >{formatDate(item.createdAt)}</td
                                >
                                <td class="py-3">
                                    <a
                                        href="/admin/articles/{item.id}/edit"
                                        class="rounded px-2 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-colors"
                                    >
                                        Review
                                    </a>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>
