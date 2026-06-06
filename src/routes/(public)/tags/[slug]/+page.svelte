<script lang="ts">
	import ArticleGrid from '$lib/components/blog/ArticleGrid.svelte';
	import SeoHead from '$lib/components/blog/SeoHead.svelte';
	import type { ArticleResponse } from '$lib/types';

	interface PageData {
		tag: { id: string; name: string; slug: string } | null;
		articles: ArticleResponse[];
	}

	let props: { data: PageData } = $props();
</script>

{#if props.data.tag}
	<SeoHead
		title="{props.data.tag.name} Articles"
		description="Browse articles tagged with {props.data.tag.name}"
		url="/tags/{props.data.tag.slug}"
		tags={[props.data.tag.name]}
	/>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<a href="/tags" class="text-sm text-indigo-400 hover:text-indigo-300 transition-colors mb-2 inline-flex items-center gap-1">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
				</svg>
				All Tags
			</a>
			<h1 class="text-3xl md:text-4xl font-bold text-white mt-2">
				<span class="text-indigo-400">#</span>{props.data.tag.name}
			</h1>
			<p class="text-gray-400 mt-2">
				{props.data.articles.length} article{props.data.articles.length !== 1 ? 's' : ''} tagged with <span class="text-white font-medium">{props.data.tag.name}</span>
			</p>
		</div>

		<!-- Articles -->
		{#if props.data.articles.length > 0}
			<ArticleGrid articles={props.data.articles} columns={3} />
		{:else}
			<div class="py-20 text-center">
				<svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
				</svg>
				<h2 class="text-xl font-semibold text-white mb-2">No articles yet</h2>
				<p class="text-gray-400">No articles have been tagged with this topic yet.</p>
			</div>
		{/if}
	</div>
{:else}
	<SeoHead title="Tag Not Found" description="The requested tag could not be found." url="/tags/404" />

	<div class="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
		<h1 class="text-3xl font-bold text-white mb-4">Tag Not Found</h1>
		<p class="text-gray-400 mb-8">The tag you're looking for doesn't exist.</p>
		<a
			href="/tags"
			class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-indigo-500 text-white hover:bg-indigo-400 transition-colors"
		>
			Browse All Tags
		</a>
	</div>
{/if}
