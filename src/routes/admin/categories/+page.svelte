<script lang="ts">
	import AdminLayout from '$lib/components/layouts/AdminLayout.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { confirm } from '$lib/stores/confirm.svelte';

	interface Category {
		id: string;
		name: string;
		slug: string;
		description: string | null;
		icon: string | null;
		articleCount: number;
	}

	let categories = $state<Category[]>([]);
	let loading = $state(true);
	let showModal = $state(false);
	let editingCategory = $state<Category | null>(null);
	let formName = $state('');
	let formDesc = $state('');
	let formIcon = $state('');
	let saving = $state(false);

	async function loadCategories() {
		loading = true;
		try {
			const res = await fetch('/api/admin/categories');
			if (res.ok) {
				const data = await res.json();
				categories = data.data ?? [];
			}
		} catch (e) {
			console.error('Failed to load categories', e);
		} finally {
			loading = false;
		}
	}

	function openCreate() {
		editingCategory = null;
		formName = '';
		formDesc = '';
		formIcon = '';
		showModal = true;
	}

	function openEdit(cat: Category) {
		editingCategory = cat;
		formName = cat.name;
		formDesc = cat.description ?? '';
		formIcon = cat.icon ?? '';
		showModal = true;
	}

	async function save() {
		saving = true;
		try {
			const url = editingCategory
				? `/api/admin/categories/${editingCategory.id}`
				: '/api/admin/categories';
			const method = editingCategory ? 'PATCH' : 'POST';

			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formName,
					description: formDesc || null,
					icon: formIcon || null
				})
			});

			if (res.ok) {
				toast.success(editingCategory ? 'Category updated' : 'Category created');
				showModal = false;
				await loadCategories();
			} else {
				const err = await res.json();
				toast.error(err.error ?? 'Failed to save category');
			}
		} catch (e) {
			toast.error('Network error');
		} finally {
			saving = false;
		}
	}

	async function handleDelete(cat: Category) {
		const confirmed = await confirm(`Delete "${cat.name}"?`, `This will unlink ${cat.articleCount} article(s) from this category.`);
		if (!confirmed) return;

		try {
			const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' });
			if (res.ok) {
				toast.success('Category deleted');
				await loadCategories();
			} else {
				toast.error('Failed to delete category');
			}
		} catch {
			toast.error('Network error');
		}
	}

	$effect(() => { loadCategories(); });
</script>

<AdminLayout>
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold text-slate-900 dark:text-white">Categories</h1>
				<p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
					Manage blog content categories
				</p>
			</div>
			<Button onclick={openCreate}>+ New Category</Button>
		</div>

		{#if loading}
			<div class="flex justify-center py-12">
				<Spinner />
			</div>
		{:else if categories.length === 0}
			<div class="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 p-12 text-center">
				<p class="text-slate-500 dark:text-slate-400">No categories yet. Create one to organize your articles.</p>
			</div>
		{:else}
			<div class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
				<table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
					<thead class="bg-slate-50 dark:bg-slate-800">
						<tr>
							<th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Icon</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Name</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Slug</th>
							<th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Articles</th>
							<th class="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200 dark:divide-slate-700">
						{#each categories as cat (cat.id)}
							<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
								<td class="px-4 py-3 text-lg">{cat.icon ?? '—'}</td>
								<td class="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{cat.name}</td>
								<td class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{cat.slug}</td>
								<td class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{cat.articleCount}</td>
								<td class="px-4 py-3 text-right">
									<div class="flex justify-end gap-2">
										<Button variant="ghost" size="sm" onclick={() => openEdit(cat)}>Edit</Button>
										<Button variant="danger" size="sm" onclick={() => handleDelete(cat)}>Delete</Button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</AdminLayout>

<Modal bind:open={showModal} title={editingCategory ? 'Edit Category' : 'New Category'}>
	<h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">
		{editingCategory ? 'Edit Category' : 'New Category'}
	</h2>

	<div class="space-y-4">
		<Input
			label="Category Name"
			bind:value={formName}
			placeholder="e.g. Teknologi & AI"
			required
		/>
		<div>
			<label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
			<textarea
				bind:value={formDesc}
				placeholder="Brief description of this category"
				class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
				rows="2"
			></textarea>
		</div>
		<Input
			label="Icon (emoji)"
			bind:value={formIcon}
			placeholder="e.g. 🔬, 💻, 📖, 📚"
			maxlength={10}
		/>
	</div>

	<div class="mt-6 flex justify-end gap-3">
		<Button variant="ghost" onclick={() => { showModal = false; }}>Cancel</Button>
		<Button onclick={save} disabled={!formName || saving}>
			{saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
		</Button>
	</div>
</Modal>
