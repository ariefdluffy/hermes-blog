<script lang="ts">
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import SeoHead from '$lib/components/blog/SeoHead.svelte';
	import { goto } from '$app/navigation';
	import { APP_NAME, CATEGORY_META } from '$lib/constants';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let props: Props = $props();

	let articles = $derived(props.data.articles);
	let category = $derived(props.data.category);
	let meta = $derived(category ? (CATEGORY_META[category.slug] ?? null) : null);

	function handlePageChange(page: number) {
		goto(`/category/${props.data.slug}?page=${page}`);
	}
</script>

<SeoHead
	title={category ? category.name : 'Category'}
	description={category ? (category.description ?? `Articles in "${category.name}" on ${APP_NAME}`) : ''}
	url={`/category/${props.data.slug}`}
/>

<div class="mx-auto max-w-3xl px-5 py-8">
	{#if !category}
		<div class="py-20 text-center">
			<svg class="mx-auto mb-6 h-12 w-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
			</svg>
			<h1 class="mb-3 text-2xl font-bold text-slate-200">Category not found</h1>
			<p class="text-slate-500">The category you're looking for doesn't exist.</p>
			<a href="/" class="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
				Back to home
			</a>
		</div>
	{:else}
		<!-- Header -->
		<div class="flex items-center gap-2 mb-6">
			<span class="text-xl">{meta?.icon ?? '📂'}</span>
			<h1 class="text-xl font-bold text-slate-200">{category.name}</h1>
			<span class="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">{props.data.totalArticles} artikel</span>
		</div>

		{#if meta?.description}
			<p class="text-sm text-slate-400 mb-6">{meta.description}</p>
		{/if}

		{#if articles.length > 0}
			<div class="space-y-4">
				{#each articles as article, i (article.id)}
					{@const dt = new Date(article.publishedAt ?? article.createdAt)}
					<a
						href="/blog/{article.slug}"
						class="group block rounded-xl border border-slate-800/80 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-4 sm:p-5 hover:border-indigo-500/40 hover:from-slate-900/80 hover:to-slate-900/40 transition-all duration-300"
					>
						<div class="flex items-start gap-3 sm:gap-4">
							<div class="hidden sm:flex w-9 h-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/60 text-xs font-mono font-bold text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
								{String(i + 1 + (props.data.page - 1) * 12).padStart(2, '0')}
							</div>
							<div class="min-w-0 flex-1">
								<h3 class="text-base font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">
									{article.title}
								</h3>
								<p class="mt-2 text-sm text-slate-400 leading-relaxed line-clamp-2 group-hover:text-slate-300 transition-colors">
									{article.excerpt}
								</p>
								<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
									<span class="flex items-center gap-1.5">
										<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/></svg>
										{dt.getDate()} {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'][dt.getMonth()]} {dt.getFullYear()}
									</span>
									{#if article.readTime}
										<span class="flex items-center gap-1.5">
											<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
											{article.readTime} menit baca
										</span>
									{/if}
								</div>
							</div>
							<svg class="hidden sm:block w-4 h-4 shrink-0 mt-1 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all duration-300" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
						</div>
					</a>
				{/each}
			</div>

			{#if props.data.totalPages > 1}
				<div class="mt-8">
					<Pagination
						page={props.data.page}
						totalItems={props.data.totalArticles}
						perPage={12}
						onchange={handlePageChange}
					/>
				</div>
			{/if}
		{:else}
			<div class="py-16 text-center">
				<p class="text-sm text-slate-500">No articles in this category yet.</p>
			</div>
		{/if}
	{/if}
</div>
