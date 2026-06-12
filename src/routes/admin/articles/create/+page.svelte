<script lang="ts">
	import { goto } from '$app/navigation';
	import ArticleForm from '$lib/components/admin/ArticleForm.svelte';
	import type { ArticleFormData } from '$lib/types';

	let loading = $state(false);
	let error = $state<string | null>(null);
	let categories = $state<{ id: string; name: string; slug: string }[]>([]);

	async function loadCategories() {
		try {
			const res = await fetch('/api/admin/categories');
			if (res.ok) {
				const d = await res.json();
				categories = d.data ?? [];
			}
		} catch {}
	}

	$effect(() => { loadCategories(); });

	async function handleSubmit(formData: ArticleFormData) {
		loading = true;
		error = null;

		try {
			const res = await fetch('/api/admin/articles', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (!res.ok) {
				const data = await res.json();
				error = data.error || 'Failed to create article';
				return;
			}

			goto('/admin/articles');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Network error';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Create Article — Hermes Admin</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
	<div class="flex items-center gap-4">
		<a
			href="/admin/articles"
			class="rounded-lg p-2 text-slate-400 hover:bg-slate-700 transition-colors"
			aria-label="Back to articles"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
		</a>
		<h1 class="text-2xl font-bold text-white">Create Article</h1>
	</div>

	{#if error}
		<div class="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
			{error}
		</div>
	{/if}

	<div class="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
		<ArticleForm {categories} onsubmit={handleSubmit} {loading} />
	</div>
</div>