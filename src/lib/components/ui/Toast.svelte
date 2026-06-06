<script lang="ts">
	import { toast } from '$lib/stores/toast.svelte';

	const variantClasses: Record<string, { bg: string; border: string; icon: string; text: string }> = {
		success: {
			bg: 'bg-emerald-500/10',
			border: 'border-emerald-500/30',
			icon: 'text-emerald-400',
			text: 'text-emerald-400'
		},
		error: {
			bg: 'bg-red-500/10',
			border: 'border-red-500/30',
			icon: 'text-red-400',
			text: 'text-red-400'
		},
		warning: {
			bg: 'bg-yellow-500/10',
			border: 'border-yellow-500/30',
			icon: 'text-yellow-400',
			text: 'text-yellow-400'
		},
		info: {
			bg: 'bg-blue-500/10',
			border: 'border-blue-500/30',
			icon: 'text-blue-400',
			text: 'text-blue-400'
		}
	};
</script>

{#if toast.items.length > 0}
	<div class="pointer-events-none fixed right-4 top-4 z-[200] flex flex-col gap-2" role="status" aria-live="polite">
		{#each toast.items as item (item.id)}
			{@const v = variantClasses[item.variant] ?? variantClasses.info}
			<div
				class="pointer-events-auto flex items-start gap-3 rounded-xl border {v.border} {v.bg} px-4 py-3 shadow-lg backdrop-blur-md slide-in-right"
			>
				<!-- Icon -->
				<div class="mt-0.5 shrink-0">
					{#if item.variant === 'success'}
						<svg class="h-5 w-5 {v.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					{:else if item.variant === 'error'}
						<svg class="h-5 w-5 {v.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					{:else if item.variant === 'warning'}
						<svg class="h-5 w-5 {v.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					{:else}
						<svg class="h-5 w-5 {v.icon}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					{/if}
				</div>

				<!-- Content -->
				<div class="flex-1 min-w-0">
					<p class="text-sm font-semibold text-white">{item.title}</p>
					{#if item.message}
						<p class="mt-0.5 text-xs text-slate-400">{item.message}</p>
					{/if}
				</div>

				<!-- Close -->
				<button
					type="button"
					class="shrink-0 rounded-lg p-1 text-slate-500 hover:text-slate-300 transition-colors"
					onclick={() => toast.remove(item.id)}
					aria-label="Close notification"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	.slide-in-right {
		animation: slide-in-right 0.25s ease-out;
	}

	@keyframes slide-in-right {
		from {
			opacity: 0;
			transform: translateX(100%);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
