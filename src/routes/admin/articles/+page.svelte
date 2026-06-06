<script lang="ts">
	import { goto } from '$app/navigation';
	import Badge from '$lib/components/ui/Badge.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import { confirm } from '$lib/stores/confirm.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let props: Props = $props();

	let statusFilter = $state(props.data.status ?? '');
	let searchTerm = $state(props.data.search ?? '');

	const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
		DRAFT: 'default',
		REVIEW: 'warning',
		PUBLISHED: 'success',
		ARCHIVED: 'danger'
	};

	const columns = [
		{ key: 'title', label: 'Title', sortable: true },
		{ key: 'author.username', label: 'Author' },
		{ key: 'status', label: 'Status' },
		{ key: 'views', label: 'Views', sortable: true },
		{ key: 'createdAt', label: 'Date', sortable: true },
		{ key: 'actions', label: 'Actions' }
	];

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function applyFilter() {
		const params = new URLSearchParams();
		if (statusFilter) params.set('status', statusFilter);
		if (searchTerm) params.set('search', searchTerm);
		goto(`/admin/articles?${params}`);
	}

	function handleSort(key: string, direction: 'asc' | 'desc') {
		// Client-side sort could be implemented; for now, rely on server default
	}

	function handlePageChange(page: number) {
		const params = new URLSearchParams();
		params.set('page', String(page));
		if (statusFilter) params.set('status', statusFilter);
		if (searchTerm) params.set('search', searchTerm);
		goto(`/admin/articles?${params}`);
	}

	async function deleteArticle(id: string, title: string) {
		confirm.show({
			title: 'Delete Article',
			message: `"${title}" will be permanently removed. This action cannot be undone.`,
			variant: 'danger',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
				if (res.ok) {
					toast.success('Deleted', `"${title}" has been deleted`);
					location.reload();
				} else {
					toast.error('Failed', 'Could not delete article. Try again.');
				}
			}
		});
	}
</script>

<svelte:head>
	<title>Articles — Hermes Admin</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-white">Articles</h1>
		<a
			href="/admin/articles/create"
			class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
		>
			+ New Article
		</a>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-3">
		<div class="flex-1 min-w-[200px]">
			<input
				type="text"
				bind:value={searchTerm}
				placeholder="Search articles..."
				class="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
				onkeydown={(e) => { if (e.key === 'Enter') applyFilter(); }}
			/>
		</div>

		<select
			bind:value={statusFilter}
			class="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
		>
			<option value="">All Statuses</option>
			<option value="DRAFT">Draft</option>
			<option value="REVIEW">Review</option>
			<option value="PUBLISHED">Published</option>
			<option value="ARCHIVED">Archived</option>
		</select>

		<button
			type="button"
			onclick={applyFilter}
			class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
		>
			Filter
		</button>
	</div>

	<!-- Articles Table -->
	<div class="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/50">
		<table class="w-full min-w-[800px] text-left text-sm">
			<thead>
				<tr class="border-b border-slate-700/50">
					<th class="px-4 py-3 font-semibold text-slate-300">Title</th>
					<th class="px-4 py-3 font-semibold text-slate-300">Author</th>
					<th class="px-4 py-3 font-semibold text-slate-300">Status</th>
					<th class="px-4 py-3 font-semibold text-slate-300">Views</th>
					<th class="px-4 py-3 font-semibold text-slate-300">Date</th>
					<th class="px-4 py-3 font-semibold text-slate-300 text-right">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-700/30">
				{#if props.data.articles.length === 0}
					<tr>
						<td colspan="6" class="px-4 py-12 text-center text-slate-500">No articles found</td>
					</tr>
				{:else}
					{#each props.data.articles as article}
						<tr class="transition-colors hover:bg-slate-700/30">
							<td class="px-4 py-3">
								<a href="/admin/articles/{article.id}/edit" class="font-medium text-white hover:text-blue-400 transition-colors">
									{article.title}
								</a>
							</td>
							<td class="px-4 py-3 text-slate-400">{article.author?.username ?? '—'}</td>
							<td class="px-4 py-3">
								<Badge variant={statusVariant[article.status] ?? 'default'} size="sm">
									{article.status}
								</Badge>
							</td>
							<td class="px-4 py-3 text-slate-400">{article.views}</td>
							<td class="px-4 py-3 text-slate-400">{formatDate(article.createdAt)}</td>
							<td class="px-4 py-3 text-right">
								<div class="flex items-center justify-end gap-2">
									<a
										href="/admin/articles/{article.id}/edit"
										class="rounded px-2 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-colors"
									>
										Edit
									</a>
									<button
										type="button"
										class="rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
										onclick={() => deleteArticle(article.id, article.title)}
									>
										Delete
									</button>
								</div>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if props.data.totalPages > 1}
		<div class="flex items-center justify-between text-sm text-slate-400">
			<p>
				Showing {(props.data.page - 1) * props.data.perPage + 1}&ndash;{Math.min(props.data.page * props.data.perPage, props.data.total)}
				of {props.data.total} articles
			</p>
			<div class="flex items-center gap-1">
				<button
					class="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={props.data.page <= 1}
					onclick={() => handlePageChange(props.data.page - 1)}
				>
					Previous
				</button>
				{#each Array(props.data.totalPages) as _, i}
					<button
						class="rounded-lg px-3 py-1.5 transition-colors {i + 1 === props.data.page ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}"
						onclick={() => handlePageChange(i + 1)}
					>
						{i + 1}
					</button>
				{/each}
				<button
					class="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={props.data.page >= props.data.totalPages}
					onclick={() => handlePageChange(props.data.page + 1)}
				>
					Next
				</button>
			</div>
		</div>
	{/if}
</div>