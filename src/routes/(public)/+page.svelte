<script lang="ts">
	import SeoHead from '$lib/components/blog/SeoHead.svelte';
	import type { ArticleResponse } from '$lib/types';
	import { APP_NAME } from '$lib/constants';

	interface PageData {
		featured: ArticleResponse | null;
		articles: ArticleResponse[];
		totalArticles: number;
		page: number;
		totalPages: number;
		categories: { slug: string; name: string; count: number }[];
		tags: { id: string; name: string; slug: string; articleCount: number }[];
	}

	let props: { data: PageData } = $props();

	let articles = $derived(props.data.articles.slice(0, 6));
	let categories = $derived(props.data.categories);
	let allCount = $derived(categories.reduce((s, c) => s + c.count, 0));

	type CatConfig = { paths: string[]; colorHex: string; count: number; description: string };
	let catMap: Record<string, CatConfig> = {
		ai: { paths: ['M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2', 'M6.453 15h11.094', 'M8.5 2h7'], colorHex: '#6366f1', count: 0, description: 'Ringkasan paper arXiv & Semantic Scholar setiap hari' },
		technology: { paths: ['M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z', 'M20 2v4', 'M22 4h-4', 'M4 20a2 2 0 1 0 4 0a2 2 0 0 0-4 0'], colorHex: '#a855f7', count: 0, description: 'Berita AI terkini dan artikel teknologi mendalam' },
		'us-stocks': { paths: ['M3 3v18h18', 'M3 7l7 7l4-4l7 7'], colorHex: '#10b981', count: 0, description: 'Analisis pasar saham Amerika Serikat' },
		'id-stocks': { paths: ['M12 2v20', 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'], colorHex: '#f97316', count: 0, description: 'Analisis pasar modal Indonesia' },
	};

	let sortedCats = $derived(
		categories
			.filter(c => catMap[c.slug])
			.map(c => {
				catMap[c.slug] = { ...catMap[c.slug], count: c.count };
				return c;
			})
			.sort((a, b) => catMap[b.slug].count - catMap[a.slug].count)
	);
</script>

<SeoHead
	title="Home"
	description="Blog pribadi Miftahul Arif — AI research digests, tech tutorials, dan jurnal harian. Konten di-generate otomatis oleh Hermes Agent."
	url="/"
/>

<div class="mx-auto max-w-3xl px-5 py-8">
	<!-- Author Intro -->
	<section class="mb-10">
		<div class="rounded-xl bg-gradient-to-br from-indigo-500/8 via-transparent to-purple-500/8 border border-indigo-500/10 p-6 sm:p-8">
			<div class="flex items-start justify-between gap-4 mb-4">
				<div>
					<h1 class="text-3xl font-extrabold tracking-tight text-slate-100 mb-2">Miftahul Arif</h1>
					<p class="text-sm text-slate-400">AI Researcher &bull; Developer &bull; Writer</p>
				</div>
				<a href="/rss.xml" class="flex-shrink-0 mt-1 text-xs px-3 py-1.5 rounded-full border border-slate-700 text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-colors flex items-center gap-1.5">
					<svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
					RSS
				</a>
			</div>
			<p class="text-sm text-slate-400 leading-relaxed max-w-xl mb-6">
				Blog pribadi berisi daily AI research digests, tech tutorials, dan jurnal harian.
				Konten di-generate otomatis setiap hari pukul 08:00 WIB oleh Hermes Agent.
			</p>
			<div class="flex flex-wrap gap-3">
				<div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
					<svg class="w-3.5 h-3.5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/></svg>
					<span class="text-xs font-semibold text-slate-200">{categories.find(c => c.slug === 'ai')?.count ?? 0}</span>
					<span class="text-xs text-slate-500">Research Digests</span>
				</div>
				<div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
					<svg class="w-3.5 h-3.5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
					<span class="text-xs font-semibold text-slate-200">{categories.find(c => c.slug === 'technology')?.count ?? 0}</span>
					<span class="text-xs text-slate-500">Artikel Teknologi</span>
				</div>
				<div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
					<svg class="w-3.5 h-3.5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
					<span class="text-xs font-semibold text-slate-200">{allCount}</span>
					<span class="text-xs text-slate-500">Total Posts</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Navigation Cards -->
	<section class="mb-10">
		<div class="flex items-center gap-2 mb-4">
			<svg class="w-4 h-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="M8 11h8"/><path d="M8 7h6"/></svg>
			<h2 class="text-sm font-bold text-indigo-400">Navigasi</h2>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{#each sortedCats as cat (cat.slug)}
				{@const cfg = catMap[cat.slug]}
				{#if cfg}
					<a
						href="/category/{cat.slug}"
						class="group block rounded-lg border border-slate-800 p-4 hover:bg-slate-900/50 transition-all"
						style="border-left: 2px solid {cfg.colorHex}"
					>
						<div class="flex items-start gap-3 mb-2">
							<div class="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style="background-color: {cfg.colorHex}1a">
								<svg class="w-3.5 h-3.5" style="color: {cfg.colorHex}" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									{#each cfg.paths as d}
										<path {d} />
									{/each}
								</svg>
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-center justify-between mb-1">
									<h3 class="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{cat.name}</h3>
									<span class="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded flex-shrink-0">{cfg.count} artikel</span>
								</div>
								<p class="text-xs text-slate-500 leading-relaxed">{cfg.description}</p>
							</div>
						</div>
					</a>
				{/if}
			{/each}
		</div>
	</section>

	<!-- Recent Articles -->
	{#if articles.length > 0}
		<section class="mb-10">
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center gap-2">
					<svg class="w-4 h-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
					<h2 class="text-sm font-bold text-indigo-400">Artikel Terbaru</h2>
				</div>
				<a href="/blog" class="text-xs text-indigo-400 hover:underline flex items-center gap-1">
					Lihat semua
					<svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
				</a>
			</div>
			<div class="space-y-2">
				{#each articles as article, i (article.id)}
					<a
						href="/blog/{article.slug}"
						class="group flex items-center gap-3 rounded-lg border border-slate-800 border-l-2 border-l-indigo-500/60 p-3 hover:border-indigo-500/40 hover:bg-slate-900/50 transition-all"
					>
						<span class="text-xs text-slate-600 font-mono w-6 flex-shrink-0 text-center">{String(i + 1).padStart(2, '0')}</span>
						<span class="text-sm font-medium text-slate-200 group-hover:text-indigo-400 transition-colors min-w-0 flex-1 truncate">{article.title}</span>
						<svg class="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Tags Cloud -->
	{#if props.data.tags.length > 0}
		<section class="mb-10">
			<div class="flex items-center gap-2 mb-4">
				<svg class="w-4 h-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/></svg>
				<h2 class="text-sm font-bold text-indigo-400">Topik Populer</h2>
			</div>
			<div class="flex flex-wrap gap-2">
				{#each props.data.tags.slice(0, 12) as tag (tag.id)}
					<a
						href="/tags/{tag.slug}"
						class="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-800 text-slate-400 hover:border-indigo-500/30 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
					>
						{tag.name}
						<span class="ml-1 text-slate-600">({tag.articleCount})</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>
