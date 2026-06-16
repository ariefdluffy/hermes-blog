<script lang="ts">
	import SeoHead from '$lib/components/blog/SeoHead.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import { goto } from '$app/navigation';
	import { APP_NAME } from '$lib/constants';

	interface PageData {
		query: string;
		articles: any[];
		totalArticles: number;
		page: number;
		totalPages: number;
	}

	let props: { data: PageData } = $props();

	let searchValue = $state(props.data.query ?? '');

	function handleSearch() {
		if (searchValue.trim()) {
			goto(`/search?q=${encodeURIComponent(searchValue.trim())}`);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleSearch();
	}

	function handlePageChange(page: number) {
		goto(`/search?q=${encodeURIComponent(props.data.query)}&page=${page}`);
	}
</script>

<SeoHead
	title={props.data.query ? `Search: ${props.data.query}` : 'Search'}
	description={props.data.query ? `Search results for "${props.data.query}" on ${APP_NAME}` : `Search articles on ${APP_NAME}`}
	url="/search"
/>

<div class="mx-auto max-w-3xl px-5 py-8">
	<!-- Header -->
	<div class="mb-6">
		<div class="flex items-center gap-2 mb-4">
			<svg class="w-4 h-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
			<h1 class="text-sm font-bold text-indigo-400">Search</h1>
		</div>
		<div class="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 focus-within:border-indigo-500/50 transition-colors">
			<svg class="w-4 h-4 text-slate-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
			<input
				type="text"
				bind:value={searchValue}
				onkeydown={handleKeydown}
				placeholder="Cari artikel..."
				class="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
			/>
			{#if searchValue}
				<button type="button" onclick={handleSearch} class="text-xs text-indigo-400 hover:underline">Cari</button>
			{/if}
		</div>
	</div>

	{#if props.data.query}
		<!-- Results info -->
		<div class="mb-6">
			<p class="text-xs text-slate-500">
				{props.data.totalArticles} hasil untuk
				<span class="text-slate-300 font-medium">"{props.data.query}"</span>
			</p>
		</div>

		{#if props.data.articles.length > 0}
			<div class="space-y-4">
				{#each props.data.articles as article, i (article.id)}
					{@const dt = new Date(article.publishedAt ?? article.createdAt)}
					<a href="/blog/{article.slug}" class="group block rounded-xl border border-slate-800/80 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-4 sm:p-5 hover:border-indigo-500/40 hover:from-slate-900/80 hover:to-slate-900/40 transition-all duration-300">
						<div class="flex items-start gap-3 sm:gap-4">
							<div class="hidden sm:flex w-9 h-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/60 text-xs font-mono font-bold text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
								{String(i + 1 + (props.data.page - 1) * 12).padStart(2, '0')}
							</div>
							<div class="min-w-0 flex-1">
								<h3 class="text-base font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2">{article.title}</h3>
								<p class="mt-2 text-sm text-slate-400 leading-relaxed line-clamp-2 group-hover:text-slate-300 transition-colors">{article.excerpt}</p>
								<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
									<span class="flex items-center gap-1.5">
										<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
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
				<svg class="w-12 h-12 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<h2 class="text-lg font-semibold text-slate-300 mb-2">Tidak ada hasil</h2>
				<p class="text-sm text-slate-500 mb-4">Tidak ada artikel yang cocok dengan "{props.data.query}".</p>
				<div class="space-y-1 text-xs text-slate-600">
					<p>Coba:</p>
					<ul class="list-disc list-inside space-y-0.5">
						<li>Gunakan kata kunci berbeda</li>
						<li>Periksa ejaan</li>
					</ul>
				</div>
			</div>
		{/if}
	{:else}
		<div class="py-16 text-center">
			<svg class="w-12 h-12 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<h2 class="text-lg font-semibold text-slate-300 mb-2">Cari Artikel</h2>
			<p class="text-sm text-slate-500 max-w-md mx-auto">
				Temukan artikel tentang AI, teknologi, pasar saham, dan lainnya.
			</p>
		</div>
	{/if}
</div>
