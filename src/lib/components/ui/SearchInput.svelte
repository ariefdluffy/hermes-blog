<script lang="ts">
	interface Props {
		value?: string;
		placeholder?: string;
		onsearch?: (query: string) => void;
	}

	let { value = $bindable(''), placeholder = 'Search...', onsearch }: Props = $props();

	let debounceTimer: ReturnType<typeof setTimeout>;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			onsearch?.(value);
		}, 300);
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		onsearch?.(value);
	}
</script>

<form onsubmit={handleSubmit} class="relative w-full">
	<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
		<svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
	</div>
	<input
		type="search"
		{placeholder}
		bind:value
		oninput={handleInput}
		class="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900
			placeholder:text-slate-400
			focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
			dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500
			dark:focus:border-blue-500"
	/>
</form>