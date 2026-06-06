<script lang="ts">
	import SeoHead from '$lib/components/blog/SeoHead.svelte';
	import { APP_NAME } from '$lib/constants';

	interface PageData {
		tags: { id: string; name: string; slug: string; articleCount: number }[];
	}

	let props: { data: PageData } = $props();

	// Categorize tags by first letter for alphabetical grouping
	let groupedTags = $derived(() => {
		const groups: Record<string, typeof props.data.tags> = {};
		for (const tag of props.data.tags) {
			const letter = tag.name.charAt(0).toUpperCase();
			if (!groups[letter]) groups[letter] = [];
			groups[letter].push(tag);
		}
		return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
	});
</script>

<SeoHead
	title="Tags"
	description="Browse all tags on {APP_NAME}"
	url="/tags"
/>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-white mb-2">Tags</h1>
		<p class="text-gray-400">Browse articles by topic.</p>
	</div>

	{#if props.data.tags.length > 0}
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
			{#each props.data.tags as tag (tag.id)}
				<a
					href="/tags/{tag.slug}"
					class="group flex flex-col items-center justify-center gap-2 p-5 rounded-xl
						bg-gray-800/80 border border-gray-700/50
						transition-all duration-200 hover:scale-[1.03] hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5"
				>
					<span class="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
						{tag.name}
					</span>
					<span class="text-sm text-gray-500">
						{tag.articleCount} {tag.articleCount === 1 ? 'article' : 'articles'}
					</span>
				</a>
			{/each}
		</div>
	{:else}
		<div class="py-20 text-center">
			<svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
			</svg>
			<h2 class="text-xl font-semibold text-white mb-2">No tags yet</h2>
			<p class="text-gray-400">Tags will appear here as articles are published.</p>
		</div>
	{/if}
</div>