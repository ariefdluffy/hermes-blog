<script lang="ts">
	import AdminLayout from '$lib/components/layouts/AdminLayout.svelte';
	import type { PageData } from './$types';

	interface Props {
		children: import('svelte').Snippet;
		data: PageData;
	}

	let { children, data }: Props = $props();
</script>

<AdminLayout user={data.user}>
	{@render children()}
</AdminLayout>