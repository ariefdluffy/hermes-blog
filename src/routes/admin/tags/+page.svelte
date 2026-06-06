<script lang="ts">
	import { goto } from '$app/navigation';
	import Modal from '$lib/components/ui/Modal.svelte';
	import TagForm from '$lib/components/admin/TagForm.svelte';
	import { confirm } from '$lib/stores/confirm.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let props: Props = $props();

	let showModal = $state(false);
	let editingTag = $state<{ id: string; name: string; slug: string } | null>(null);
	let formLoading = $state(false);
	let formError = $state<string | null>(null);

	function openCreateModal() {
		editingTag = null;
		formError = null;
		showModal = true;
	}

	function openEditModal(tag: { id: string; name: string; slug: string }) {
		editingTag = tag;
		formError = null;
		showModal = true;
	}

	async function handleTagSubmit(formData: { name: string; slug: string }) {
		formLoading = true;
		formError = null;

		try {
			let res: Response;
			if (editingTag) {
				res = await fetch(`/api/admin/tags/${editingTag.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(formData)
				});
			} else {
				res = await fetch('/api/admin/tags', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(formData)
				});
			}

			if (!res.ok) {
				const result = await res.json();
				formError = result.error || 'Failed to save tag';
				return;
			}

			showModal = false;
			location.reload();
		} catch (err) {
			formError = err instanceof Error ? err.message : 'Network error';
		} finally {
			formLoading = false;
		}
	}

	async function confirmDeleteTag(id: string, name: string) {
		confirm.show({
			title: 'Delete Tag',
			message: `"${name}" will be permanently removed. Articles using this tag will be unlinked.`,
			variant: 'danger',
			confirmLabel: 'Delete',
			onConfirm: async () => {
				const res = await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' });
				if (res.ok) {
					toast.success('Deleted', `"${name}" has been deleted`);
					location.reload();
				} else {
					toast.error('Failed', 'Could not delete tag. Try again.');
				}
			}
		});
	}

	function handlePageChange(page: number) {
		const params = new URLSearchParams({ page: String(page) });
		if (props.data.search) params.set('search', props.data.search);
		goto(`/admin/tags?${params}`);
	}
</script>

<svelte:head>
	<title>Tags — Hermes Admin</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-white">Tags</h1>
		<button
			type="button"
			onclick={openCreateModal}
			class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
		>
			+ New Tag
		</button>
	</div>

	<!-- Search -->
	<div class="max-w-sm">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				const input = (e.target as HTMLFormElement).querySelector('input');
				if (input) goto(`/admin/tags?search=${encodeURIComponent(input.value)}`);
			}}
		>
			<input
				type="text"
				value={props.data.search}
				placeholder="Search tags..."
				class="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			/>
		</form>
	</div>

	<!-- Tags Table -->
	<div class="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/50">
		<table class="w-full text-left text-sm">
			<thead>
				<tr class="border-b border-slate-700/50">
					<th class="px-4 py-3 font-semibold text-slate-300">Name</th>
					<th class="px-4 py-3 font-semibold text-slate-300">Slug</th>
					<th class="px-4 py-3 font-semibold text-slate-300">Articles</th>
					<th class="px-4 py-3 font-semibold text-slate-300 text-right">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-700/30">
				{#if props.data.tags.length === 0}
					<tr>
						<td colspan="4" class="px-4 py-12 text-center text-slate-500">No tags found</td>
					</tr>
				{:else}
					{#each props.data.tags as tag}
						<tr class="transition-colors hover:bg-slate-700/30">
							<td class="px-4 py-3 font-medium text-white">{tag.name}</td>
							<td class="px-4 py-3 text-slate-400">{tag.slug}</td>
							<td class="px-4 py-3 text-slate-400">{tag.articleCount}</td>
							<td class="px-4 py-3 text-right">
								<div class="flex items-center justify-end gap-2">
									<button
										type="button"
										class="rounded px-2 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-colors"
										onclick={() => openEditModal(tag)}
									>
										Edit
									</button>
									<button
										type="button"
										class="rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
										onclick={() => confirmDeleteTag(tag.id, tag.name)}
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
			<p>Total: {props.data.total} tags</p>
			<div class="flex items-center gap-1">
				<button
					class="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-700 disabled:opacity-40"
					disabled={props.data.page <= 1}
					onclick={() => handlePageChange(props.data.page - 1)}
				>
					Previous
				</button>
				<button
					class="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-700 disabled:opacity-40"
					disabled={props.data.page >= props.data.totalPages}
					onclick={() => handlePageChange(props.data.page + 1)}
				>
					Next
				</button>
			</div>
		</div>
	{/if}
</div>

<!-- Create/Edit Tag Modal -->
<Modal bind:open={showModal} title={editingTag ? 'Edit Tag' : 'Create Tag'} onclose={() => (showModal = false)}>
	{#if formError}
		<div class="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
			{formError}
		</div>
	{/if}
	<TagForm tag={editingTag} onsubmit={handleTagSubmit} loading={formLoading} />
</Modal>