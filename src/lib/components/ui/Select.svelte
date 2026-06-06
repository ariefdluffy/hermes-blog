<script lang="ts">
	interface Props {
		name?: string;
		label?: string;
		options?: { value: string; label: string }[];
		value?: string;
		error?: string;
		disabled?: boolean;
		onchange?: (e: Event) => void;
	}

	let {
		name = '',
		label = '',
		options = [],
		value = $bindable(''),
		error = '',
		disabled = false,
		onchange
	}: Props = $props();
</script>

<div class="w-full">
	{#if label}
		<label for={name} class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
			{label}
		</label>
	{/if}
	<select
		{name}
		id={name}
		bind:value
		{disabled}
		onchange={onchange}
		class="w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 transition-colors
			focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
			dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:focus:border-blue-500
			disabled:opacity-50 disabled:cursor-not-allowed
			{error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300'}"
	>
		{#each options as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
	{#if error}
		<p class="mt-1 text-sm text-red-500">{error}</p>
	{/if}
</div>