<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg' | 'xl';
		showText?: boolean;
		class?: string;
	}

	let { size = 'md', showText = true, class: className = '' }: Props = $props();

	const sizes: Record<string, string> = {
		sm: 'h-6 w-6',
		md: 'h-8 w-8',
		lg: 'h-10 w-10',
		xl: 'h-14 w-14'
	};

	const textSizes: Record<string, string> = {
		sm: 'text-sm',
		md: 'text-xl',
		lg: 'text-2xl',
		xl: 'text-3xl'
	};
</script>

<div class="inline-flex items-center gap-2 {className}">
	<svg
		class="{sizes[size]} flex-shrink-0"
		viewBox="0 0 48 48"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<!-- Outer glow ring -->
		<circle cx="24" cy="24" r="22" stroke="url(#hermesGlow)" stroke-width="0.5" opacity="0.3" />

		<!-- Background disc -->
		<defs>
			<linearGradient id="hermesBg" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
				<stop stop-color="#1e3a5f" />
				<stop offset="1" stop-color="#0f172a" />
			</linearGradient>
			<linearGradient id="hermesAccent" x1="14" y1="8" x2="34" y2="40" gradientUnits="userSpaceOnUse">
				<stop stop-color="#3b82f6" />
				<stop offset="1" stop-color="#8b5cf6" />
			</linearGradient>
			<linearGradient id="hermesGlow" x1="2" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
				<stop stop-color="#3b82f6" />
				<stop offset="1" stop-color="#8b5cf6" />
			</linearGradient>
			<linearGradient id="hermesWing" x1="12" y1="4" x2="36" y2="20" gradientUnits="userSpaceOnUse">
				<stop stop-color="#60a5fa" />
				<stop offset="1" stop-color="#3b82f6" />
			</linearGradient>
			<linearGradient id="hermesStaff" x1="22" y1="6" x2="26" y2="46" gradientUnits="userSpaceOnUse">
				<stop stop-color="#c084fc" />
				<stop offset="1" stop-color="#8b5cf6" />
			</linearGradient>
		</defs>

		<!-- Rounded square background -->
		<rect x="4" y="4" width="40" height="40" rx="10" fill="url(#hermesBg)" stroke="url(#hermesGlow)" stroke-width="1.5" />

		<!-- Left wing -->
		<path
			d="M6 18 C6 10, 12 5, 18 8 C14 10, 10 13, 12 18"
			fill="url(#hermesWing)"
			opacity="0.85"
		/>
		<path
			d="M7 20 C7 14, 13 10, 17 12 C14 14, 11 16, 12 20"
			fill="url(#hermesWing)"
			opacity="0.6"
		/>

		<!-- Right wing -->
		<path
			d="M42 18 C42 10, 36 5, 30 8 C34 10, 38 13, 36 18"
			fill="url(#hermesWing)"
			opacity="0.85"
		/>
		<path
			d="M41 20 C41 14, 35 10, 31 12 C34 14, 37 16, 36 20"
			fill="url(#hermesWing)"
			opacity="0.6"
		/>

		<!-- Central staff (caduceus) -->
		<rect x="23" y="8" width="2.5" rx="1" fill="url(#hermesStaff)" />

		<!-- Ball on top -->
		<circle cx="24.25" cy="7.5" r="3" fill="#3b82f6" />
		<circle cx="24.25" cy="7.5" r="1.8" fill="#60a5fa" opacity="0.6" />
		<circle cx="23.6" cy="6.8" r="0.6" fill="white" opacity="0.4" />

		<!-- Left snake -->
		<path
			d="M20 12 C16 14, 14 18, 19 21 C22 23, 26 23, 23 27 C21 29, 25 32, 29 30 C33 28, 32 24, 28 22"
			fill="none"
			stroke="#a5b4fc"
			stroke-width="1.6"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>

		<!-- Right snake -->
		<path
			d="M28 12 C32 14, 34 18, 29 21 C26 23, 22 23, 25 27 C27 29, 23 32, 19 30 C15 28, 16 24, 20 22"
			fill="none"
			stroke="#c4b5fd"
			stroke-width="1.6"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>

		<!-- Snake heads (left) -->
		<ellipse cx="28" cy="22" rx="2.2" ry="1.5" fill="#a5b4fc" transform="rotate(-20, 28, 22)" />
		<circle cx="28.6" cy="21.5" r="0.5" fill="#1e3a5f" />

		<!-- Snake heads (right) -->
		<ellipse cx="20" cy="22" rx="2.2" ry="1.5" fill="#c4b5fd" transform="rotate(20, 20, 22)" />
		<circle cx="19.4" cy="21.5" r="0.5" fill="#1e3a5f" />

		<!-- Small decorative dots along staff -->
		<circle cx="24.25" cy="15" r="1" fill="#fbbf24" opacity="0.8" />
		<circle cx="24.25" cy="22" r="1" fill="#fbbf24" opacity="0.6" />
		<circle cx="24.25" cy="29" r="1" fill="#fbbf24" opacity="0.8" />

		<!-- Bottom glow -->
		<ellipse cx="24" cy="44" rx="8" ry="2" fill="#3b82f6" opacity="0.2" />
	</svg>

	{#if showText}
		<span class="{textSizes[size]} font-extrabold tracking-tight">
			<span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Hermes</span>
			<span class="text-slate-400 dark:text-slate-500">Blog</span>
		</span>
	{/if}
</div>
