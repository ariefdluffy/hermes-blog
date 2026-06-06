<script lang="ts">
	interface Props {
		variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
		size?: 'sm' | 'md';
		children?: import('svelte').Snippet;
	}

	let { variant = 'default', size = 'md', children }: Props = $props();

	const variantClasses: Record<string, string> = {
		default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
		success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
		warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
		danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
		info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
	};

	const sizeClasses: Record<string, string> = {
		sm: 'px-2 py-0.5 text-xs',
		md: 'px-2.5 py-1 text-sm'
	};

	let classes = $derived(
		`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`
	);
</script>

<span class={classes}>
	{#if children}
		{@render children()}
	{/if}
</span>