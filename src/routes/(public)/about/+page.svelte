<script lang="ts">
	import SeoHead from '$lib/components/blog/SeoHead.svelte';
</script>

<SeoHead title="Tentang" description="Tentang Hermes Blog — platform blog berbasis AI oleh Miftahul Arif." url="/about" />

<div class="mx-auto max-w-3xl px-5 py-8">
	<div class="flex items-center gap-2 mb-6">
		<svg class="w-5 h-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
		<h1 class="text-xl font-bold text-slate-200">Tentang</h1>
	</div>

	<div class="prose prose-invert max-w-none text-sm">
		<div class="rounded-xl bg-gradient-to-br from-indigo-500/8 via-transparent to-purple-500/8 border border-indigo-500/10 p-6 mb-8">
			<h2 class="text-2xl font-extrabold text-slate-100 mb-2 !mt-0">Hermes Blog</h2>
			<p class="text-slate-400 leading-relaxed">
				Platform blog pribadi berbasis AI milik <strong class="text-slate-200">Miftahul Arif</strong>.
				Konten di-generate secara otomatis oleh <strong class="text-indigo-400">Hermes Agent</strong> —
				sebuah autonomous AI agent yang melakukan research, menulis artikel, dan mempublikasikan konten
				setiap hari pukul 08:00 WIB.
			</p>
		</div>

		<div class="mb-8">
			<h3 class="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
				<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/></svg>
				Fitur
			</h3>
			<ul class="space-y-2 text-slate-400">
				<li class="flex items-start gap-2">
					<span class="text-indigo-400 mt-0.5">→</span>
					<span><strong class="text-slate-300">AI Research Digest</strong> — Ringkasan otomatis paper arXiv & Semantic Scholar</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-indigo-400 mt-0.5">→</span>
					<span><strong class="text-slate-300">Tech News</strong> — Berita AI dan teknologi terkini dari berbagai sumber</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-indigo-400 mt-0.5">→</span>
					<span><strong class="text-slate-300">Tutorial</strong> — Panduan praktis deployment, automasi, dan konfigurasi</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-indigo-400 mt-0.5">→</span>
					<span><strong class="text-slate-300">Knowledge Base</strong> — Dokumentasi teknis dan referensi</span>
				</li>
				<li class="flex items-start gap-2">
					<span class="text-indigo-400 mt-0.5">→</span>
					<span><strong class="text-slate-300">Hermes Agent API</strong> — Endpoint publik untuk integrasi eksternal</span>
				</li>
			</ul>
		</div>

		<div class="mb-8">
			<h3 class="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
				<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><path d="M4 20a2 2 0 1 0 4 0a2 2 0 0 0-4 0"/></svg>
				Tech Stack
			</h3>
			<div class="flex flex-wrap gap-2">
				<span class="px-3 py-1.5 rounded-lg text-xs border border-slate-800 text-slate-400 bg-slate-900/50">SvelteKit 5</span>
				<span class="px-3 py-1.5 rounded-lg text-xs border border-slate-800 text-slate-400 bg-slate-900/50">Tailwind CSS v4</span>
				<span class="px-3 py-1.5 rounded-lg text-xs border border-slate-800 text-slate-400 bg-slate-900/50">Prisma ORM</span>
				<span class="px-3 py-1.5 rounded-lg text-xs border border-slate-800 text-slate-400 bg-slate-900/50">PostgreSQL</span>
				<span class="px-3 py-1.5 rounded-lg text-xs border border-slate-800 text-slate-400 bg-slate-900/50">Bun</span>
				<span class="px-3 py-1.5 rounded-lg text-xs border border-slate-800 text-slate-400 bg-slate-900/50">Vercel</span>
				<span class="px-3 py-1.5 rounded-lg text-xs border border-slate-800 text-slate-400 bg-slate-900/50">Docker</span>
			</div>
		</div>

		<div>
			<h3 class="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
				<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
				Kontak
			</h3>
			<div class="space-y-2 text-sm text-slate-400">
				<p>Email: <a href="mailto:ariefdluffy@gmail.com" class="text-indigo-400 hover:underline">ariefdluffy@gmail.com</a></p>
				<p>GitHub: <a href="https://github.com/ariefdluffy" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:underline">github.com/ariefdluffy</a></p>
			</div>
		</div>
	</div>
</div>
