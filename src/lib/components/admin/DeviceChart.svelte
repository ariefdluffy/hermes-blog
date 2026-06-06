<script lang="ts">
    interface DeviceData {
        label: string;
        count: number;
        percentage: number;
    }

    interface Props {
        data?: DeviceData[];
    }

    let { data = [] }: Props = $props();

    let total = $derived(data.reduce((s, d) => s + d.count, 0));

    const colors = [
        "#6366f1",
        "#a855f7",
        "#ec4899",
        "#f43f5e",
        "#f97316",
        "#eab308",
    ];

    // SVG donut calculations
    const cx = 100;
    const cy = 100;
    const r = 80;
    const strokeW = 28;
    const adjustedR = r - strokeW / 2;
    const circ = 2 * Math.PI * adjustedR;

    let segments = $derived.by(() => {
        let offset = 0;
        return data.map((d, i) => {
            const pct = total > 0 ? d.count / total : 0;
            const len = pct * circ;
            const seg = {
                ...d,
                offset,
                len,
                color: colors[i % colors.length],
            };
            offset += len;
            return seg;
        });
    });

    function deviceSvg(label: string): string {
        if (label === "Desktop") {
            return `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"/></svg>`;
        }
        if (label === "Mobile") {
            return `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/></svg>`;
        }
        if (label === "Tablet") {
            return `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/></svg>`;
        }
        return `<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/></svg>`;
    }
</script>

<div
    class="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5 transition-colors"
>
    <h3 class="mb-3 text-sm font-semibold text-slate-300">
        Device Distribution
    </h3>

    {#if data.length === 0}
        <div class="flex items-center justify-center py-12">
            <p class="text-sm text-slate-500">No data yet</p>
        </div>
    {:else}
        <div class="flex flex-col items-center">
            <!-- Donut SVG -->
            <div class="h-44 w-44">
                <svg viewBox="0 0 200 200" class="h-full w-full -rotate-90">
                    <!-- Background ring -->
                    <circle
                        {cx}
                        {cy}
                        r={adjustedR}
                        fill="none"
                        stroke="rgba(148,163,184,0.1)"
                        stroke-width={strokeW}
                    />
                    <!-- Segments -->
                    {#each segments as seg}
                        <circle
                            {cx}
                            {cy}
                            r={adjustedR}
                            fill="none"
                            stroke={seg.color}
                            stroke-width={strokeW}
                            stroke-dasharray={`${seg.len} ${circ - seg.len}`}
                            stroke-dashoffset={-seg.offset}
                            stroke-linecap="round"
                            opacity="0.85"
                        />
                    {/each}
                    <!-- Center text -->
                    <text
                        x={cx}
                        y={cy - 6}
                        text-anchor="middle"
                        fill="#e2e8f0"
                        font-size="28"
                        font-weight="700"
                        font-family="ui-sans-serif, sans-serif"
                    >
                        {total}
                    </text>
                    <text
                        x={cx}
                        y={cy + 14}
                        text-anchor="middle"
                        fill="#94a3b8"
                        font-size="13"
                        font-family="ui-sans-serif, sans-serif"
                    >
                        views
                    </text>
                </svg>
            </div>

            <!-- Legend with SVG icons -->
            <div class="mt-4 grid w-full grid-cols-2 gap-x-4 gap-y-2.5">
                {#each segments as seg}
                    <div class="flex items-center gap-2 text-xs">
                        <span
                            class="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                            style="background: {seg.color}20; color: {seg.color}"
                        >
                            {@html deviceSvg(seg.label)}
                        </span>
                        <span class="text-slate-400">{seg.label}</span>
                        <span class="ml-auto font-medium text-slate-200"
                            >{seg.percentage}%</span
                        >
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>
