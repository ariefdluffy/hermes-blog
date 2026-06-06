<script lang="ts">
	import Navbar from '$lib/components/layouts/Navbar.svelte';
	import Footer from '$lib/components/layouts/Footer.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';

	interface Props {
		children: import('svelte').Snippet;
		data?: Record<string, unknown>;
	}

	let { children, data }: Props = $props();
</script>

<div class="flex min-h-screen flex-col bg-[var(--dark-bg)]">
	<Navbar user={null} />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>

<ConfirmDialog />
<Toast />
