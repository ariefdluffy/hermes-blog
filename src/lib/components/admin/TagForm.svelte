<script lang="ts">
	import { slugify } from '$lib/utils';

	interface TagData {
		id?: string;
		name: string;
		slug: string;
	}

	interface Props {
		tag?: TagData | null;
		onsubmit: (data: { name: string; slug: string }) => void;
		loading?: boolean;
	}

	let { tag = null, onsubmit, loading = false }: Props = $props();

	let name = $state(tag?.name ?? '');
	let slugPreview = $derived(slugify(name || ''));

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name.trim()) return;
		onsubmit({ name: name.trim(), slug: slugPreview });
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<div>
		<label for="tagName" class="mb-1.5 block text-sm font-medium text-slate-300">Tag Name</label>
		<input
			id="tagName"
			type="text"
			bind:value={name}
			required
			placeholder="e.g. Artificial Intelligence"
			class="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
		/>
	</div>

	<div>
		<label class="mb-1.5 block text-sm font-medium text-slate-400">Slug Preview</label>
		<p class="rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-300">
			{slugPreview || '—'}
		</p>
	</div>

	<button
		type="submit"
		disabled={loading || !name.trim()}
		class="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
	>
		{#if loading}
			<svg class="mr-2 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
			</svg>
			Saving...
		{:else}
			{tag?.id ? 'Update Tag' : 'Create Tag'}
		{/if}
	</button>
</form>