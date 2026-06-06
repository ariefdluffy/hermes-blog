<script lang="ts">
    interface SourceData {
        label: string;
        count: number;
        percentage: number;
    }

    interface Props {
        data?: SourceData[];
    }

    let { data = [] }: Props = $props();

    let maxCount = $derived(Math.max(...data.map((d) => d.count), 1));

    const sourceColors: Record<string, string> = {
        Direct: "#6366f1",
        Google: "#22c55e",
        "Twitter/X": "#3b82f6",
        Facebook: "#2563eb",
        GitHub: "#8b5cf6",
        LinkedIn: "#0ea5e9",
        Instagram: "#ec4899",
        Reddit: "#f97316",
        Telegram: "#06b6d4",
        WhatsApp: "#10b981",
        Other: "#64748b",
    };

    function sourceIcon(label: string): string {
        if (label === "Direct") {
            return `<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>`;
        }
        if (label === "Google") {
            return `<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/></svg>`;
        }
        if (label === "Twitter/X") {
            return `<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>`;
        }
        return `<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.79a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 006.364 6.364l1.757-1.757m-6.364-6.364l1.757-1.757"/></svg>`;
    }
</script>

<div
    class="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 transition-colors"
>
    <h3 class="mb-3 text-sm font-semibold text-slate-300">Referral Sources</h3>

    {#if data.length === 0}
        <div class="flex items-center justify-center py-12">
            <p class="text-sm text-slate-500">No data yet</p>
        </div>
    {:else}
        <div class="space-y-2.5">
            {#each data as item}
                {@const pct = (item.count / maxCount) * 100}
                <div class="flex items-center gap-2">
                    <div class="flex w-24 shrink-0 items-center gap-1.5">
                        <span
                            class="shrink-0"
                            style="color: {sourceColors[item.label] ??
                                '#64748b'}"
                        >
                            {@html sourceIcon(item.label)}
                        </span>
                        <span
                            class="truncate text-xs font-medium text-slate-400"
                        >
                            {item.label}
                        </span>
                    </div>
                    <div
                        class="relative h-6 flex-1 overflow-hidden rounded-md bg-slate-700/30"
                    >
                        <div
                            class="h-full rounded-md transition-all duration-500"
                            style="width: {Math.max(
                                pct,
                                2,
                            )}%; background: {sourceColors[item.label] ??
                                '#64748b'}"
                        ></div>
                        <div
                            class="absolute inset-y-0 left-2 right-2 flex items-center"
                        >
                            <span
                                class="ml-auto text-xs font-semibold text-slate-200 drop-shadow-sm"
                            >
                                {item.count}
                                <span class="font-normal text-slate-400"
                                    >({item.percentage}%)</span
                                >
                            </span>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
