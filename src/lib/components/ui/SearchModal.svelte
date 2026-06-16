<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	interface Props {
		open: boolean;
		onclose: () => void;
	}

	let { open, onclose }: Props = $props();

	let query = $state('');
	let results = $state<any[]>([]);
	let loading = $state(false);
	let selectedIdx = $state(-1);
	let inputEl: HTMLInputElement | undefined = $state();
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		if (open) {
			// Focus input after modal animation
			requestAnimationFrame(() => inputEl?.focus());
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => { document.body.style.overflow = ''; };
	});

	// Keyboard shortcuts
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onclose();
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIdx = Math.min(selectedIdx + 1, results.length - 1);
			return;
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIdx = Math.max(selectedIdx - 1, -1);
			return;
		}
		if (e.key === 'Enter') {
			e.preventDefault();
			if (selectedIdx >= 0 && results[selectedIdx]) {
				goto(`/blog/${results[selectedIdx].slug}`);
				onclose();
			} else if (query.trim()) {
				goto(`/search?q=${encodeURIComponent(query.trim())}`);
				onclose();
			}
			return;
		}
	}

	// Debounced search
	function onInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		query = val;
		selectedIdx = -1;

		clearTimeout(debounceTimer);
		if (!val.trim()) {
			results = [];
			loading = false;
			return;
		}

		loading = true;
		debounceTimer = setTimeout(async () => {
			try {
				const params = new URLSearchParams({ q: val.trim(), perPage: '5' });
				const res = await fetch(`/api/search?${params}`);
				if (res.ok) {
					const data = await res.json();
					results = data.data ?? [];
				}
			} catch {
				results = [];
			} finally {
				loading = false;
			}
		}, 250);
	}

	function goSearch() {
		if (query.trim()) {
			goto(`/search?q=${encodeURIComponent(query.trim())}`);
			onclose();
		}
	}

	function goArticle(slug: string) {
		goto(`/blog/${slug}`);
		onclose();
	}

	// Highlight matching text
	function highlight(text: string, q: string) {
		if (!q.trim()) return text;
		const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
		return parts.map((part, i) =>
			part.toLowerCase() === q.toLowerCase()
				? `<mark class="bg-indigo-500/20 text-indigo-300">${part}</mark>`
				: part
		).join('');
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Backdrop -->
{#if open}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]"
		role="dialog"
		aria-modal="true"
		aria-label="Search articles"
	>
		<!-- Backdrop -->
		<div
			class="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
			onclick={onclose}
		></div>

		<!-- Modal -->
		<div
			class="relative z-10 w-full max-w-lg mx-4 animate-scale-in"
		>
			<!-- Search input -->
			<div class="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/95 px-4 py-3.5 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl input-glow">
				<svg class="w-5 h-5 shrink-0 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
				<input
					bind:this={inputEl}
					type="text"
					value={query}
					oninput={onInput}
					onkeydown={handleKeydown}
					placeholder="Cari artikel..."
					class="flex-1 bg-transparent text-base text-slate-200 placeholder-slate-500 outline-none"
				/>

				<!-- Loading spinner -->
				{#if loading}
					<svg class="w-4 h-4 shrink-0 animate-spin text-indigo-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
				{/if}

				<!-- Keyboard hint -->
				<kbd class="hidden sm:inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-xs text-slate-500 font-mono">
					<span>ESC</span>
				</kbd>
			</div>

			<!-- Results dropdown -->
			{#if query.trim() && !loading}
				{#if results.length > 0}
					<div class="mt-2 rounded-xl border border-slate-700/60 bg-slate-900/95 py-2 shadow-2xl backdrop-blur-xl overflow-hidden">
						{#each results as article, i (article.id)}
							<button
								type="button"
								onclick={() => goArticle(article.slug)}
								onmouseenter={() => { selectedIdx = i; }}
								class="w-full text-left px-4 py-3 transition-colors {i === selectedIdx ? 'bg-indigo-500/10' : 'hover:bg-slate-800/50'}"
							>
								<div class="text-sm font-medium text-slate-200 {i === selectedIdx ? 'text-indigo-300' : ''}">
									{@html highlight(article.title, query)}
								</div>
								{#if article.excerpt}
									<div class="mt-0.5 text-xs text-slate-500 line-clamp-1">
										{@html highlight(article.excerpt, query)}
									</div>
								{/if}
							</button>
						{/each}

						<!-- Footer: see all results -->
						<div class="border-t border-slate-800 px-4 py-2">
							<button
								type="button"
								onclick={goSearch}
								class="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
							>
								Lihat semua hasil untuk "{query}"
							</button>
						</div>
					</div>
				{:else if query.trim().length >= 2}
					<div class="mt-2 rounded-xl border border-slate-700/60 bg-slate-900/95 px-4 py-6 text-center shadow-2xl backdrop-blur-xl">
						<svg class="w-8 h-8 mx-auto text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<p class="text-sm text-slate-500">Tidak ada hasil untuk "{query}"</p>
					</div>
				{/if}
			{/if}

			<!-- Hint text -->
			<p class="mt-3 text-center text-xs text-slate-600">
				<kbd class="inline-flex items-center rounded border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 text-xs text-slate-500 font-mono">↑↓</kbd>
				Navigasi
				<kbd class="inline-flex items-center rounded border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 text-xs text-slate-500 font-mono ml-2">Enter</kbd>
				Pilih
				<kbd class="inline-flex items-center rounded border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 text-xs text-slate-500 font-mono ml-2">Esc</kbd>
				Tutup
			</p>
		</div>
	</div>
{/if}

<style>
	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	@keyframes scale-in {
		from { opacity: 0; transform: scale(0.95) translateY(-8px); }
		to { opacity: 1; transform: scale(1) translateY(0); }
	}
	.animate-fade-in {
		animation: fade-in 0.15s ease-out;
	}
	.animate-scale-in {
		animation: scale-in 0.2s ease-out;
	}
</style>
