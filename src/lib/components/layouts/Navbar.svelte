<script lang="ts">
	import { theme } from '$lib/stores/theme';
	import SearchModal from '$lib/components/ui/SearchModal.svelte';

	interface Props {
		user?: { id: string; username: string; role: string } | null;
		currentPath?: string;
	}

	let { user = null, currentPath = '/' }: Props = $props();

	let menuOpen = $state(false);
	let searchOpen = $state(false);

	const navLinks = [
		{ href: '/research', label: 'Riset' },
		{ href: '/tech', label: 'Teknologi & AI' },
		{ href: '/tutorial', label: 'Tutorial' },
		{ href: '/knowledge-base', label: 'Knowledge Base' },
		{ href: '/about', label: 'Tentang' }
	];

	// Ctrl+K / Cmd+K to open search
	function handleGlobalKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault();
			searchOpen = true;
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<header class="sticky top-0 z-40 border-b border-[var(--dark-border)] bg-[var(--dark-bg)]/80 backdrop-blur-md">
	<div class="mx-auto max-w-3xl flex items-center justify-between px-5 py-3">
		<a href="/" class="text-base font-bold tracking-tight text-[var(--text)]">Hermes Blog</a>

		<!-- Desktop nav -->
		<nav class="hidden md:flex items-center gap-1">
			{#each navLinks as link}
				<a
					href={link.href}
					class="px-2.5 py-1.5 rounded text-sm transition-colors text-[var(--text-muted)] hover:text-[var(--text)]"
				>
					{link.label}
				</a>
			{/each}

			<!-- Search button -->
			<button
				type="button"
				onclick={() => { searchOpen = true; }}
				class="p-1.5 rounded hover:bg-[var(--dark-bg-alt)] transition-colors"
				aria-label="Search"
			>
				<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
			</button>

			<button
				type="button"
				onclick={() => theme.toggle()}
				class="p-1.5 rounded hover:bg-[var(--dark-bg-alt)] transition-colors"
				aria-label="Toggle theme"
			>
				{#if theme.dark}
					<!-- Sun icon -->
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
				{:else}
					<!-- Moon icon -->
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
				{/if}
			</button>
		</nav>

		<!-- Mobile -->
		<div class="flex items-center gap-2 md:hidden">
			<button type="button" onclick={() => theme.toggle()} class="p-1.5 rounded hover:bg-[var(--dark-bg-alt)]" aria-label="Toggle theme">
				{#if theme.dark}
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
				{:else}
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
				{/if}
			</button>
			<button type="button" onclick={() => { menuOpen = !menuOpen; }} class="p-1.5 rounded hover:bg-[var(--dark-bg-alt)]" aria-label="Menu">
				{#if menuOpen}
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
				{:else}
					<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
				{/if}
			</button>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if menuOpen}
		<nav class="border-t border-[var(--dark-border)] bg-[var(--dark-bg)] px-5 pb-4 pt-2 md:hidden">
			{#each navLinks as link}
				<a
					href={link.href}
					class="block rounded px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
					onclick={() => { menuOpen = false; }}
				>
					{link.label}
				</a>
			{/each}
		</nav>
	{/if}
</header>

<SearchModal open={searchOpen} onclose={() => { searchOpen = false; }} />
