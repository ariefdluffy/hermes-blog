<script lang="ts">
	import SeoHead from '$lib/components/blog/SeoHead.svelte';

	interface Props {
		data: { articles: any[] };
	}

	let { data }: Props = $props();
</script>

<SeoHead title="Teknologi & AI" description="Berita AI terkini, artikel teknologi, dan tren industri." url="/tech" />

<div class="mx-auto max-w-3xl px-5 py-8">
	<div class="flex items-center gap-2 mb-6">
		<svg class="w-5 h-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><path d="M4 20a2 2 0 1 0 4 0a2 2 0 0 0-4 0"/></svg>
		<h1 class="text-xl font-bold text-slate-200">Teknologi & AI</h1>
	</div>

	<p class="text-sm text-slate-400 mb-6 leading-relaxed">
		Berita terkini seputar perkembangan AI, software engineering, hardware, startup, dan tren
		industri teknologi global.
	</p>

	{#if data.articles.length > 0}
		<div class="space-y-2">
			{#each data.articles as article, i (article.id)}
				<a href="/blog/{article.slug}" class="group flex items-center gap-3 rounded-lg border border-slate-800 border-l-2 border-l-purple-500/60 p-3 hover:border-purple-500/40 hover:bg-slate-900/50 transition-all">
					<span class="text-xs text-slate-600 font-mono w-6 flex-shrink-0 text-center">{String(i + 1).padStart(2, '0')}</span>
					<div class="min-w-0 flex-1">
						<h3 class="text-sm font-medium text-slate-200 group-hover:text-purple-400 transition-colors truncate">{article.title}</h3>
						<p class="text-xs text-slate-500 mt-0.5 line-clamp-1">{article.excerpt}</p>
					</div>
					<div class="flex items-center gap-3 flex-shrink-0">
						<span class="text-xs text-slate-600">{new Date(article.publishedAt ?? article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
						<svg class="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 transition-colors" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="py-16 text-center">
			<svg class="w-12 h-12 mx-auto text-slate-600 mb-4" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/></svg>
			<p class="text-sm text-slate-500">Belum ada artikel teknologi. Segera hadir!</p>
		</div>
	{/if}
</div>
