<script lang="ts">
	import { CATEGORIES, CATEGORY_SLUGS } from '$lib/constants';

	interface Props {
		onsubmit: (data: { source: string; category: string }) => void;
		loading?: boolean;
	}

	let { onsubmit, loading = false }: Props = $props();

	let source = $state('');
	let categoryKey = $state<keyof typeof CATEGORIES>('RISET');
	let showError = $state(false);

	const categoryOptions = Object.entries(CATEGORIES) as [keyof typeof CATEGORIES, string][];

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!source.trim()) {
			showError = true;
			return;
		}
		showError = false;
		onsubmit({ source: source.trim(), category: CATEGORY_SLUGS[categoryKey] });
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<div>
		<label for="source" class="mb-1.5 block text-sm font-medium text-slate-300">News Source / Topic</label>
		<input
			id="source"
			type="text"
			bind:value={source}
			placeholder="Enter a URL or topic to generate from"
			class="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 {showError && !source.trim() ? 'border-red-500' : ''}"
		/>
		{#if showError && !source.trim()}
			<p class="mt-1 text-xs text-red-400">Please enter a source URL or topic</p>
		{/if}
	</div>

	<div>
		<label for="category" class="mb-1.5 block text-sm font-medium text-slate-300">Category</label>
		<select
			id="category"
			bind:value={categoryKey}
			class="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
		>
			{#each categoryOptions as [key, label]}
				<option value={key}>{label}</option>
			{/each}
		</select>
	</div>

	<div class="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
		<h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Trusted Sources</h4>
		<div class="space-y-1.5">
			{#each categoryOptions as [key, label]}
				<div class="flex items-start gap-2">
					<span class="text-xs font-medium text-slate-500 shrink-0 w-36">{label}</span>
				</div>
			{/each}
		</div>
	</div>

	<button
		type="submit"
		disabled={loading}
		class="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
	>
		{#if loading}
			<svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
			</svg>
			Generating Article...
		{:else}
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
			</svg>
			Generate with AI
		{/if}
	</button>
</form>