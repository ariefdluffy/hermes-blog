<script lang="ts">
	interface Props {
		title: string;
		type: 'line' | 'bar' | 'pie';
	}

	let { title, type }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-800/30 p-8 text-center">
	<div class="mb-4 rounded-full bg-slate-700/50 p-4">
		{#if type === 'line'}
			<svg class="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.63-1.256M15.75 6a2.25 2.25 0 00-2.25 2.25v.75a2.25 2.25 0 002.25 2.25h.75a2.25 2.25 0 002.25-2.25V8.25a2.25 2.25 0 00-2.25-2.25h-.75z" />
			</svg>
		{:else if type === 'bar'}
			<svg class="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
			</svg>
		{:else}
			<svg class="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
				<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
			</svg>
		{/if}
	</div>
	<h3 class="text-sm font-semibold text-slate-300">{title}</h3>
	<p class="mt-1 text-xs text-slate-500">Chart visualization coming soon</p>
</div>