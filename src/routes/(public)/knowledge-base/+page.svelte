<script lang="ts">
	import SeoHead from '$lib/components/blog/SeoHead.svelte';

	interface Props {
		data: { articles: any[] };
	}

	let { data }: Props = $props();
</script>

<SeoHead title="Knowledge Base" description="Dokumentasi, referensi, dan catatan teknis." url="/knowledge-base" />

<div class="mx-auto max-w-3xl px-5 py-8">
	<div class="flex items-center gap-2 mb-6">
		<svg class="w-5 h-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="M8 11h8"/><path d="M8 7h6"/></svg>
		<h1 class="text-xl font-bold text-slate-200">Knowledge Base</h1>
	</div>

	<p class="text-sm text-slate-400 mb-6 leading-relaxed">
		Kumpulan dokumentasi, referensi teknis, command cheatsheet, dan catatan troubleshooting.
	</p>

	{#if data.articles.length > 0}
		<div class="space-y-4">
			{#each data.articles as article, i (article.id)}
				{@const dt = new Date(article.publishedAt ?? article.createdAt)}
				<a href="/blog/{article.slug}" class="group block rounded-xl border border-slate-800/80 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-4 sm:p-5 hover:border-amber-500/40 hover:from-slate-900/80 hover:to-slate-900/40 transition-all duration-300">
					<div class="flex items-start gap-3 sm:gap-4">
						<div class="hidden sm:flex w-9 h-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/60 text-xs font-mono font-bold text-slate-500 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors">
							{String(i + 1).padStart(2, '0')}
						</div>
						<div class="min-w-0 flex-1">
							<h3 class="text-base font-semibold text-slate-200 group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">{article.title}</h3>
							<p class="mt-2 text-sm text-slate-400 leading-relaxed line-clamp-2 group-hover:text-slate-300 transition-colors">{article.excerpt}</p>
							<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
								<span class="flex items-center gap-1.5">
									<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/><path d="M8 11h8"/><path d="M8 7h6"/></svg>
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
						<svg class="hidden sm:block w-4 h-4 shrink-0 mt-1 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all duration-300" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="py-16 text-center">
			<svg class="w-12 h-12 mx-auto text-slate-600 mb-4" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
			<p class="text-sm text-slate-500">Belum ada konten knowledge base. Segera hadir!</p>
		</div>
	{/if}
</div>
