<script lang="ts">
    import { browser } from "$app/environment";

    interface TopArticle {
        id: string;
        title: string;
        views: number;
        slug: string;
        author?: { id: string; username: string };
    }

    interface Props {
        initialArticles?: TopArticle[];
    }

    let { initialArticles = [] }: Props = $props();

    let period = $state(30);
    let articles = $state<TopArticle[]>(initialArticles);
    let loading = $state(false);

    async function loadData(days: number) {
        loading = true;
        try {
            const res = await fetch(
                `/api/admin/analytics?trending=true&days=${days}&limit=5`,
            );
            if (res.ok) {
                const json = await res.json();
                articles = json.data ?? [];
            }
        } catch {
            // swallow
        } finally {
            loading = false;
        }
    }

    function changePeriod(days: number) {
        if (days === period) return;
        period = days;
        if (browser) loadData(days);
    }

    let periods = [
        { label: "24h", value: 1 },
        { label: "7 Days", value: 7 },
        { label: "30 Days", value: 30 },
    ];

    let maxViews = $derived(Math.max(...articles.map((a) => a.views), 1));

    const barColors = [
        "from-indigo-500 to-purple-500",
        "from-purple-500 to-fuchsia-500",
        "from-fuchsia-500 to-pink-500",
        "from-pink-500 to-rose-500",
        "from-rose-500 to-red-500",
    ];

    const rankColors = [
        "text-yellow-400",
        "text-slate-300",
        "text-amber-600",
        "text-slate-400",
        "text-slate-500",
    ];

    function truncate(title: string, max = 32) {
        return title.length > max ? title.slice(0, max) + "..." : title;
    }
</script>

<div
    class="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 transition-colors"
>
    <div class="mb-4 flex items-center justify-between">
        <div>
            <h3 class="text-sm font-semibold text-slate-300">Top Articles</h3>
            {#if !loading && articles.length > 0}
                <p class="text-xs text-slate-500">Most viewed in this period</p>
            {/if}
        </div>

        <!-- Period filter -->
        <div class="flex gap-1 rounded-lg bg-slate-900 p-0.5">
            {#each periods as p}
                <button
                    onclick={() => changePeriod(p.value)}
                    class="rounded-md px-3 py-1 text-xs font-medium transition-all
						{p.value === period
                        ? 'bg-indigo-500/20 text-indigo-300 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'}"
                >
                    {p.label}
                </button>
            {/each}
        </div>
    </div>

    {#if loading}
        <div class="flex items-center justify-center py-20">
            <div
                class="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"
            ></div>
        </div>
    {:else if articles.length === 0}
        <div class="flex items-center justify-center py-16">
            <p class="text-sm text-slate-500">No article views yet</p>
        </div>
    {:else}
        <div class="space-y-2.5">
            {#each articles as article, i}
                {@const pct =
                    maxViews > 0 ? (article.views / maxViews) * 100 : 0}
                <a
                    href="/admin/articles/{article.id}/edit"
                    class="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-700/20"
                >
                    <!-- Rank badge -->
                    <div
                        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700/50 text-xs font-bold {rankColors[
                            i
                        ]}"
                    >
                        {i + 1}
                    </div>

                    <!-- Bar + label -->
                    <div class="flex-1 min-w-0">
                        <div
                            class="relative h-8 overflow-hidden rounded-md bg-slate-700/30"
                        >
                            <!-- Animated bar -->
                            <div
                                class="h-full rounded-md bg-gradient-to-r {barColors[
                                    i
                                ]} opacity-40 transition-all duration-500 group-hover:opacity-60"
                                style="width: {Math.max(pct, 3)}%"
                            ></div>
                            <!-- Label overlay -->
                            <div
                                class="absolute inset-y-0 left-3 right-3 flex items-center justify-between"
                            >
                                <span
                                    class="truncate text-sm font-medium text-slate-200 group-hover:text-white"
                                >
                                    {truncate(article.title)}
                                </span>
                                <span
                                    class="ml-2 shrink-0 text-xs font-semibold text-indigo-300"
                                >
                                    {article.views} views
                                </span>
                            </div>
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    {/if}
</div>
