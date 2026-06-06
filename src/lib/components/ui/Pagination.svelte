<script lang="ts">
	interface Props {
		page: number;
		totalItems: number;
		perPage?: number;
		onchange?: (page: number) => void;
	}

	let { page, totalItems, perPage = 10, onchange }: Props = $props();

	let totalPages = $derived(Math.max(1, Math.ceil(totalItems / perPage)));
	let pages = $derived(getPages(page, totalPages));

	function getPages(current: number, total: number): (number | string)[] {
		if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
		const items: (number | string)[] = [1];
		if (current > 3) items.push('...');
		for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
			items.push(i);
		}
		if (current < total - 2) items.push('...');
		items.push(total);
		return items;
	}
</script>

{#if totalPages > 1}
	<nav class="flex items-center justify-center gap-1" aria-label="Pagination">
		<button
			class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100
				dark:text-slate-400 dark:hover:bg-slate-800
				disabled:opacity-40 disabled:cursor-not-allowed"
			disabled={page <= 1}
			onclick={() => onchange?.(page - 1)}
			aria-label="Previous page"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		{#each pages as p}
			{#if typeof p === 'string'}
				<span class="px-2 text-slate-400 dark:text-slate-600">…</span>
			{:else}
				<button
					class="rounded-lg px-3 py-2 text-sm font-medium transition-colors
						{p === page
							? 'bg-blue-500 text-white dark:bg-blue-600'
							: 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}"
					onclick={() => onchange?.(p as number)}
					aria-current={p === page ? 'page' : undefined}
				>
					{p}
				</button>
			{/if}
		{/each}

		<button
			class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100
				dark:text-slate-400 dark:hover:bg-slate-800
				disabled:opacity-40 disabled:cursor-not-allowed"
			disabled={page >= totalPages}
			onclick={() => onchange?.(page + 1)}
			aria-label="Next page"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	</nav>
{/if}