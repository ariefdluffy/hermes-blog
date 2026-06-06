<script lang="ts">
	interface Column {
		key: string;
		label: string;
		sortable?: boolean;
	}

	interface PaginationInfo {
		page: number;
		totalItems: number;
		perPage: number;
		onchange: (page: number) => void;
	}

	interface Props {
		columns: Column[];
		data: any[];
		loading?: boolean;
		pagination?: PaginationInfo;
		onsort?: (key: string, direction: 'asc' | 'desc') => void;
		emptyMessage?: string;
	}

	let { columns, data, loading = false, pagination, onsort, emptyMessage = 'No data found' }: Props = $props();

	let sortKey = $state<string>('');
	let sortDirection = $state<'asc' | 'desc'>('asc');

	function handleSort(key: string) {
		if (!onsort) return;
		if (sortKey === key) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDirection = 'asc';
		}
		onsort(key, sortDirection);
	}

	function formatCell(row: any, key: string): string {
		const val = key.split('.').reduce((obj: any, k: string) => obj?.[k], row);
		if (val instanceof Date) return val.toLocaleDateString();
		if (typeof val === 'boolean') return val ? 'Yes' : 'No';
		return String(val ?? '');
	}

	let totalPages = $derived(
		pagination ? Math.ceil(pagination.totalItems / pagination.perPage) : 1
	);

	let pageNumbers = $derived.by(() => {
		if (!pagination) return [];
		const pages: number[] = [];
		const current = pagination.page;
		const total = totalPages;
		const start = Math.max(1, current - 2);
		const end = Math.min(total, current + 2);
		for (let i = start; i <= end; i++) pages.push(i);
		return pages;
	});
</script>

<div class="w-full overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/50">
	<table class="w-full min-w-[600px] text-left text-sm">
		<thead>
			<tr class="border-b border-slate-700/50">
				{#each columns as col}
					<th class="px-4 py-3 font-semibold text-slate-300 whitespace-nowrap">
						{#if col.sortable && onsort}
							<button
								class="inline-flex items-center gap-1 hover:text-white transition-colors"
								onclick={() => handleSort(col.key)}
							>
								{col.label}
								{#if sortKey === col.key}
									<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
										{#if sortDirection === 'asc'}
											<path d="M5.293 9.707l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 7.414l-3.293 3.293a1 1 0 01-1.414-1.414z" />
										{:else}
											<path d="M14.707 10.293l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 12.586l3.293-3.293a1 1 0 111.414 1.414z" />
										{/if}
									</svg>
								{:else}
									<svg class="h-3 w-3 opacity-30" fill="currentColor" viewBox="0 0 20 20">
										<path d="M5.293 7.707l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 5.414l-3.293 3.293a1 1 0 01-1.414-1.414zM14.707 12.293l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 14.586l3.293-3.293a1 1 0 111.414 1.414z" />
									</svg>
								{/if}
							</button>
						{:else}
							{col.label}
						{/if}
					</th>
				{/each}
			</tr>
		</thead>

		<tbody class="divide-y divide-slate-700/30">
			{#if loading}
				{#each Array(5) as _}
					<tr class="animate-pulse">
						{#each columns as col}
							<td class="px-4 py-3">
								<div class="h-4 w-3/4 rounded bg-slate-700/50"></div>
							</td>
						{/each}
					</tr>
				{/each}
			{:else if data.length === 0}
				<tr>
					<td colspan={columns.length} class="px-4 py-12 text-center text-slate-500">
						<svg class="mx-auto h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
						</svg>
						<p>{emptyMessage}</p>
					</td>
				</tr>
			{:else}
				{#each data as row, i}
					<tr class="transition-colors hover:bg-slate-700/30">
						{#each columns as col}
							<td class="px-4 py-3 text-slate-300">
								{formatCell(row, col.key)}
							</td>
						{/each}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

{#if pagination && !loading && data.length > 0}
	<div class="mt-4 flex items-center justify-between text-sm text-slate-400">
		<p>Showing {(pagination.page - 1) * pagination.perPage + 1}&ndash;{Math.min(pagination.page * pagination.perPage, pagination.totalItems)} of {pagination.totalItems}</p>

		<div class="flex items-center gap-1">
			<button
				class="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
				disabled={pagination.page <= 1}
				onclick={() => pagination.onchange(pagination.page - 1)}
			>
				Previous
			</button>

			{#each pageNumbers as p}
				<button
					class="rounded-lg px-3 py-1.5 transition-colors {p === pagination.page ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}"
					onclick={() => pagination.onchange(p)}
				>
					{p}
				</button>
			{/each}

			<button
				class="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
				disabled={pagination.page >= totalPages}
				onclick={() => pagination.onchange(pagination.page + 1)}
			>
				Next
			</button>
		</div>
	</div>
{/if}