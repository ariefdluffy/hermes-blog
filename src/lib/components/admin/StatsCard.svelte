<script lang="ts">
    interface Trend {
        value: number;
        positive: boolean;
    }

    interface Props {
        title: string;
        value: number;
        icon: "views" | "articles" | "visitors" | "queue";
        trend?: Trend;
    }

    let { title, value, icon, trend }: Props = $props();

    const colorMap = {
        views: {
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            text: "text-blue-400",
            icon: "text-blue-500",
        },
        articles: {
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            text: "text-emerald-400",
            icon: "text-emerald-500",
        },
        visitors: {
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            text: "text-purple-400",
            icon: "text-purple-500",
        },
        queue: {
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
            text: "text-orange-400",
            icon: "text-orange-500",
        },
    };

    let colors = $derived(colorMap[icon]);

    function fmt(n: number): string {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
        if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
        return n.toLocaleString();
    }
</script>

<div
    class="group rounded-xl border {colors.border} {colors.bg} p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
>
    <div class="flex items-center justify-between">
        <div class="space-y-1.5">
            <p
                class="text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
                {title}
            </p>
            <p
                class="text-3xl font-bold tabular-nums tracking-tight {colors.text}"
            >
                {fmt(value)}
            </p>
        </div>

        <div
            class="rounded-xl {colors.bg} p-3 ring-1 ring-inset {colors.border} transition-transform group-hover:scale-110 group-hover:-rotate-3"
        >
            {#if icon === "views"}
                <svg
                    class="h-6 w-6 {colors.icon}"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z"
                    />
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            {:else if icon === "articles"}
                <svg
                    class="h-6 w-6 {colors.icon}"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                </svg>
            {:else if icon === "visitors"}
                <svg
                    class="h-6 w-6 {colors.icon}"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.659-2.088-1.625-2.467M12 21c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm0-11a3 3 0 100 6 3 3 0 000-6z"
                    />
                </svg>
            {:else}
                <svg
                    class="h-6 w-6 {colors.icon}"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                    />
                </svg>
            {/if}
        </div>
    </div>

    {#if trend}
        <div class="mt-3 flex items-center gap-1 text-sm">
            {#if trend.positive}
                <svg
                    class="h-4 w-4 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                    />
                </svg>
                <span class="text-emerald-400 font-medium">+{trend.value}%</span
                >
            {:else}
                <svg
                    class="h-4 w-4 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M4.5 4.5l15 15m0 0H8.25m11.25 0V8.25"
                    />
                </svg>
                <span class="text-red-400 font-medium">{trend.value}%</span>
            {/if}
            <span class="text-slate-500">vs last period</span>
        </div>
    {/if}
</div>
