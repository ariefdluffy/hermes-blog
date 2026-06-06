<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer class="border-t border-[var(--dark-border)] py-5 mt-auto">
	<div class="mx-auto max-w-3xl px-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
		<p>&copy; {currentYear} Miftahul Arif</p>
		<div class="flex gap-4">
			<a href="https://github.com/ariefdluffy" target="_blank" rel="noopener noreferrer" class="hover:text-[var(--text)] transition-colors">GitHub</a>
			<a href="/about" class="hover:text-[var(--text)] transition-colors">Tentang &amp; Kontak</a>
		</div>
	</div>
</footer>
