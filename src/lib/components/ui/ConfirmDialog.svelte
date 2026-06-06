<script lang="ts">
	import { confirm } from '$lib/stores/confirm.svelte';
	import type { ConfirmOptions } from '$lib/stores/confirm.svelte';

	let loading = $state(false);

	async function handleConfirm() {
		loading = true;
		try {
			await confirm.confirm();
		} finally {
			loading = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') confirm.cancel();
	}

	const variantIcons: Record<NonNullable<ConfirmOptions['variant']>, string> = {
		danger: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.934-2.907l-1.67-.212a28.342 28.342 0 00-6.13 0l-1.67.212M11.475 2.605L10.69 5.745M13.31 5.745l-.776-3.14M14.25 5.745h-4.5m4.5 0l1.304 3.907m-1.304-3.907L10.69 2.605a1.124 1.124 0 00-1.107.752L8.25 5.745',
		warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
		default: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
	};

	const variantColors: Record<NonNullable<ConfirmOptions['variant']>, { iconBg: string; iconText: string; btnBg: string; btnHover: string; ring: string }> = {
		danger: { iconBg: 'bg-red-500/10', iconText: 'text-red-400', btnBg: 'bg-red-600', btnHover: 'hover:bg-red-500', ring: 'ring-red-500/30' },
		warning: { iconBg: 'bg-yellow-500/10', iconText: 'text-yellow-400', btnBg: 'bg-yellow-600', btnHover: 'hover:bg-yellow-500', ring: 'ring-yellow-500/30' },
		default: { iconBg: 'bg-blue-500/10', iconText: 'text-blue-400', btnBg: 'bg-blue-600', btnHover: 'hover:bg-blue-500', ring: 'ring-blue-500/30' }
	};
</script>

<svelte:window onkeydown={handleKeydown} />

{#if confirm.isOpen && confirm.opts}
	{@const opts = confirm.opts}
	{@const variant = opts.variant ?? 'default'}
	{@const colors = variantColors[variant]}
	{@const iconPath = variantIcons[variant]}
	{@const confirmLabel = opts.confirmLabel ?? 'Confirm'}
	{@const cancelLabel = opts.cancelLabel ?? 'Cancel'}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 fade-in"
		onclick={confirm.cancel}
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-title"
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="w-full max-w-md rounded-xl border border-slate-700/50 bg-slate-800 p-6 shadow-2xl scale-in"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Icon -->
			<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full {colors.iconBg}">
				<svg class="h-6 w-6 {colors.iconText}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d={iconPath} />
				</svg>
			</div>

			<!-- Title -->
			<h2 id="confirm-title" class="text-center text-lg font-semibold text-white">{opts.title}</h2>

			<!-- Message -->
			<p class="mt-2 text-center text-sm text-slate-400">{opts.message}</p>

			<!-- Buttons -->
			<div class="mt-6 flex gap-3">
				<button
					type="button"
					class="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600"
					onclick={confirm.cancel}
				>
					{cancelLabel}
				</button>
				<button
					type="button"
					class="flex-1 rounded-lg {colors.btnBg} px-4 py-2.5 text-sm font-medium text-white transition-colors {colors.btnHover} focus:outline-none focus:ring-2 {colors.ring} flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					onclick={handleConfirm}
					disabled={loading}
				>
					{#if loading}
						<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
							<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25" />
							<path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="opacity-75" />
						</svg>
					{/if}
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.fade-in {
		animation: fade-in 0.15s ease-out;
	}
	.scale-in {
		animation: scale-in 0.15s ease-out;
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes scale-in {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}
</style>
