<script lang="ts">
	interface Props {
		open?: boolean;
		title?: string;
		onclose?: () => void;
		children?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
	}

	let { open = $bindable(false), title = '', onclose, children, footer }: Props = $props();

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			open = false;
			onclose?.();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
			onclose?.();
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		onkeydown={handleKeydown}
		onclick={handleBackdrop}
		role="dialog"
		aria-modal="true"
		aria-label={title}
	>
		<div
			class="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800 animate-in"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
				<button
					class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
					onclick={() => { open = false; onclose?.(); }}
					aria-label="Close"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<div class="text-slate-600 dark:text-slate-300">
				{#if children}
					{@render children()}
				{/if}
			</div>
			{#if footer}
				<div class="mt-6 flex justify-end gap-3">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.animate-in {
		animation: slideUp 0.2s ease-out;
	}
	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>