<script lang="ts">
	interface Props {
		name?: string;
		label?: string;
		placeholder?: string;
		value?: string;
		error?: string;
		rows?: number;
		disabled?: boolean;
		oninput?: (e: Event) => void;
	}

	let {
		name = '',
		label = '',
		placeholder = '',
		value = $bindable(''),
		error = '',
		rows = 6,
		disabled = false,
		oninput
	}: Props = $props();
</script>

<div class="w-full">
	{#if label}
		<label for={name} class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
			{label}
		</label>
	{/if}
	<textarea
		{name}
		id={name}
		{placeholder}
		bind:value
		{rows}
		{disabled}
		oninput={oninput}
		class="w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 transition-colors
			placeholder:text-slate-400
			focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
			dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500
			dark:border-slate-600 dark:focus:border-blue-500
			disabled:opacity-50 disabled:cursor-not-allowed resize-y
			{error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300'}"
	></textarea>
	{#if error}
		<p class="mt-1 text-sm text-red-500">{error}</p>
	{/if}
</div>