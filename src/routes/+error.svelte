<script lang="ts">
	import { page } from '$app/stores';
	import { APP_NAME } from '$lib/constants';

	let status = $derived($page.status);
	let errorMsg = $derived($page.error?.message ?? '');

	let heading = $derived.by(() => {
		if (status === 404) return 'Halaman Tidak Ditemukan';
		if (status === 403) return 'Akses Ditolak';
		if (status === 500) return 'Kesalahan Server';
		return 'Terjadi Kesalahan';
	});

	let subtext = $derived.by(() => {
		if (status === 404) return 'Halaman yang kamu cari mungkin telah dipindahkan, dihapus, atau tidak pernah ada.';
		if (status === 403) return 'Kamu tidak memiliki izin untuk mengakses halaman ini.';
		if (status === 500) return 'Maaf, terjadi kesalahan di server kami. Silakan coba lagi nanti.';
		return 'Silakan coba lagi atau hubungi administrator.';
	});
</script>

<svelte:head>
	<title>{status} | {APP_NAME}</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-[var(--dark-bg)]">
	<!-- Minimal nav -->
	<header class="sticky top-0 z-40 border-b border-[var(--dark-border)] bg-[var(--dark-bg)]/80 backdrop-blur-md">
		<div class="mx-auto max-w-3xl flex items-center justify-between px-5 py-3">
			<a href="/" class="text-base font-bold tracking-tight text-[var(--text)]">{APP_NAME}</a>
			<nav class="flex items-center gap-3">
				<a href="/" class="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Beranda</a>
				<a href="/research" class="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Riset</a>
				<a href="/tech" class="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Teknologi</a>
			</nav>
		</div>
	</header>

	<!-- Error content -->
	<main class="flex-1 flex items-center justify-center px-5 py-20">
		<div class="max-w-lg w-full text-center">
			<!-- Status code large -->
			<div class="mb-6">
				<span class="text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-600 select-none">
					{status}
				</span>
			</div>

			<!-- Icon -->
			<div class="mb-6 flex justify-center">
				{#if status === 404}
					<svg class="w-16 h-16 text-indigo-500/40" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="11" cy="11" r="8"/>
						<path d="m21 21-4.3-4.3"/>
						<path d="M8 11h6"/>
					</svg>
				{:else if status === 403}
					<svg class="w-16 h-16 text-red-500/40" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
						<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
						<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
					</svg>
				{:else}
					<svg class="w-16 h-16 text-amber-500/40" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
						<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
						<line x1="12" y1="9" x2="12" y2="13"/>
						<line x1="12" y1="17" x2="12.01" y2="17"/>
					</svg>
				{/if}
			</div>

			<h1 class="text-2xl font-bold text-[var(--text)] mb-3">{heading}</h1>
			<p class="text-sm text-[var(--text-muted)] mb-8 leading-relaxed">{subtext}</p>

			{#if errorMsg && status !== 404}
				<div class="mb-8 px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/10">
					<p class="text-xs text-red-400/80 font-mono break-all">{errorMsg}</p>
				</div>
			{/if}

			<!-- Actions -->
			<div class="flex flex-col sm:flex-row items-center justify-center gap-3">
				<a
					href="/"
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
				>
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
					Kembali ke Beranda
				</a>
				<button
					type="button"
					onclick={() => history.back()}
					class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--dark-border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--dark-bg-alt)] text-sm font-medium transition-colors"
				>
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
					Kembali ke Halaman Sebelumnya
				</button>
			</div>
		</div>
	</main>

	<!-- Footer -->
	<footer class="border-t border-[var(--dark-border)] py-6">
		<div class="mx-auto max-w-3xl px-5 flex flex-col sm:flex-row items-center justify-between gap-2">
			<p class="text-xs text-[var(--text-muted)]">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
			<div class="flex items-center gap-4">
				<a href="/about" class="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Tentang</a>
				<a href="/rss.xml" class="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">RSS</a>
			</div>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		background-color: var(--dark-bg);
		color: var(--text);
	}
</style>
