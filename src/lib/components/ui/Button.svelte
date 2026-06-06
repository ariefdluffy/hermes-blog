<script lang="ts">
	import Spinner from './Spinner.svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		type?: 'button' | 'submit';
		disabled?: boolean;
		loading?: boolean;
		onclick?: (e: MouseEvent) => void;
		children?: import('svelte').Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		type = 'button',
		disabled = false,
		loading = false,
		onclick,
		children
	}: Props = $props();

	const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

	const variantClasses: Record<string, string> = {
		primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
		secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
		danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700',
		ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-500 dark:text-slate-300 dark:hover:bg-slate-800'
	};

	const sizeClasses: Record<string, string> = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base'
	};

	let classes = $derived(
		`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`
	);
</script>

<button
	{type}
	class={classes}
	{disabled}
	onclick={onclick}
	aria-busy={loading}
>
	{#if loading}
		<Spinner size="sm" />
		<span class="ml-2">Loading...</span>
	{:else if children}
		{@render children()}
	{/if}
</button>