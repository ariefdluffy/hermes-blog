<script lang="ts">
    import { browser } from "$app/environment";

    interface DailyView {
        date: string;
        views: number;
    }

    interface Props {
        initialData?: DailyView[];
    }

    let { initialData = [] }: Props = $props();

    let period = $state(30);
    let data = $state<DailyView[]>(initialData);
    let loading = $state(false);

    async function loadData(days: number) {
        loading = true;
        try {
            const res = await fetch(`/api/admin/analytics?days=${days}`);
            if (res.ok) {
                const json = await res.json();
                data = json.dailyViews ?? [];
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

    // Chart dimensions — tighter margins, taller viewBox to reduce letterboxing
    const margin = { top: 6, right: 16, bottom: 22, left: 60 };
    const W = 800;
    const H = 340;
    const plotW = W - margin.left - margin.right;
    const plotH = H - margin.top - margin.bottom;

    let maxViews = $derived(Math.max(...data.map((d) => d.views), 1));
    let totalViews = $derived(data.reduce((s, d) => s + d.views, 0));
    let avgViews = $derived(
        data.length > 0 ? Math.round(totalViews / data.length) : 0,
    );

    type Point = { x: number; y: number };

    let points = $derived<Point[]>(
        data.map((d, i) => ({
            x: margin.left + (i / Math.max(data.length - 1, 1)) * plotW,
            y: margin.top + plotH - (d.views / maxViews) * plotH,
        })),
    );

    // Catmull-Rom → cubic bezier (smooth curve through points)
    function smoothPath(pts: Point[]): string {
        if (pts.length < 2) return "";
        let d = `M${pts[0].x},${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(0, i - 1)];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[Math.min(i + 2, pts.length - 1)];
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
        }
        return d;
    }

    let linePath = $derived(smoothPath(points));
    let areaPath = $derived(
        points.length > 1
            ? `${linePath} L${points[points.length - 1].x},${margin.top + plotH} L${points[0].x},${margin.top + plotH} Z`
            : "",
    );

    // Clean Y-axis ticks (round numbers)
    let yTicks = $derived.by(() => {
        const steps = 4;
        const rawStep = maxViews / steps;
        // Round step up to nice number
        let niceStep = 1;
        const mag = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
        const norm = rawStep / mag;
        if (norm <= 1.5) niceStep = 1 * mag;
        else if (norm <= 3.5) niceStep = 2 * mag;
        else if (norm <= 7) niceStep = 5 * mag;
        else niceStep = 10 * mag;

        const maxNice = Math.ceil(maxViews / niceStep) * niceStep;
        const ticks: { value: number; y: number }[] = [];
        for (let v = 0; v <= maxNice + 0.01; v += niceStep) {
            const y = margin.top + plotH - (v / maxViews) * plotH;
            ticks.push({ value: v, y });
        }
        return ticks;
    });

    // X-axis labels
    let xLabels = $derived(
        data.map((d, i) => {
            const dt = new Date(d.date + "T00:00:00");
            let show = false;
            if (period >= 30) {
                show = dt.getDate() === 1 || i === data.length - 1;
            } else if (period >= 7) {
                show =
                    i % Math.ceil(data.length / 5) === 0 ||
                    i === data.length - 1;
            } else {
                show = i === 0 || i === data.length - 1;
            }
            return {
                label: show
                    ? dt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                      })
                    : "",
                x: points[i]?.x ?? 0,
            };
        }),
    );
</script>

<div
    class="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 transition-colors"
>
    <div class="mb-4 flex items-center justify-between">
        <div>
            <h3 class="text-sm font-semibold text-slate-300">
                Traffic Overview
            </h3>
            {#if !loading && data.length > 0}
                <p class="text-xs text-slate-500">
                    {totalViews} total views · avg {avgViews}/day
                </p>
            {/if}
        </div>
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
    {:else if data.length === 0}
        <div class="flex items-center justify-center py-16">
            <p class="text-sm text-slate-500">No data yet</p>
        </div>
    {:else}
        <div class="h-72">
            <svg
                viewBox="0 0 800 340"
                class="h-full w-full"
                preserveAspectRatio="xMidYMid meet"
            >
                <!-- Y-axis grid lines + labels -->
                {#each yTicks as tick}
                    <line
                        x1={margin.left}
                        y1={tick.y}
                        x2={W - margin.right}
                        y2={tick.y}
                        stroke="rgba(148,163,184,0.12)"
                        stroke-width="1"
                    />
                    <text
                        x={margin.left - 10}
                        y={tick.y + 7}
                        text-anchor="end"
                        fill="#94a3b8"
                        font-size="22"
                        font-weight="500"
                        font-family="ui-sans-serif, sans-serif"
                    >
                        {tick.value}
                    </text>
                {/each}

                <!-- Area gradient fill -->
                {#if areaPath}
                    <path d={areaPath} fill="url(#areaGrad)" />
                {/if}

                <!-- Line glow -->
                {#if linePath}
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#818cf8"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        opacity="0.15"
                        filter="url(#glow)"
                    />
                {/if}

                <!-- Main line -->
                {#if linePath}
                    <path
                        d={linePath}
                        fill="none"
                        stroke="url(#lineGrad)"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                {/if}

                <!-- Data dots hover area (invisible wider path for easier hover) -->

                <!-- End dot highlight -->
                {#if points.length > 0}
                    {@const last = points[points.length - 1]}
                    <circle
                        cx={last.x}
                        cy={last.y}
                        r="5"
                        fill="#818cf8"
                        stroke="#1e293b"
                        stroke-width="2"
                    />
                    <circle
                        cx={last.x}
                        cy={last.y}
                        r="10"
                        fill="#818cf8"
                        opacity="0.15"
                    />
                {/if}

                <!-- X-axis labels -->
                {#each xLabels as lb}
                    {#if lb.label}
                        <text
                            x={lb.x}
                            y={H - 5}
                            text-anchor="middle"
                            fill="#94a3b8"
                            font-size="20"
                            font-weight="500"
                            font-family="ui-sans-serif, sans-serif"
                        >
                            {lb.label}
                        </text>
                    {/if}
                {/each}

                <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#6366f1" />
                        <stop offset="100%" stop-color="#a855f7" />
                    </linearGradient>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="0%"
                            stop-color="#6366f1"
                            stop-opacity="0.25"
                        />
                        <stop
                            offset="100%"
                            stop-color="#6366f1"
                            stop-opacity="0.02"
                        />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" />
                    </filter>
                </defs>
            </svg>
        </div>
    {/if}
</div>
