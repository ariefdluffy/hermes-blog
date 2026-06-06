<script lang="ts">
	import { type Snippet } from 'svelte';
	import HermesLogo from '$lib/components/ui/HermesLogo.svelte';

	let { children }: { children: Snippet } = $props();

	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let animId = $state(0);

	interface Particle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		radius: number;
		opacity: number;
		color: string;
	}

	const COLORS = [
		'59, 130, 246',   // blue
		'139, 92, 246',   // purple
		'96, 165, 250',   // light blue
		'167, 139, 250',  // light purple
	];

	$effect(() => {
		const canvas = canvasEl;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let width = 0;
		let height = 0;

		function resize() {
			width = window.innerWidth;
			height = window.innerHeight;
			canvas!.width = width;
			canvas!.height = height;
		}

		resize();
		window.addEventListener('resize', resize);

		const particles: Particle[] = [];
		const count = 28;

		for (let i = 0; i < count; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				vx: (Math.random() - 0.5) * 0.3,
				vy: -(Math.random() * 0.3 + 0.15),
				radius: Math.random() * 2 + 2,
				opacity: Math.random() * 0.2 + 0.08,
				color: COLORS[Math.floor(Math.random() * COLORS.length)]
			});
		}

		function draw() {
			if (!ctx || !canvas) return;

			ctx.clearRect(0, 0, width, height);

			// Draw particles
			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];

				p.x += p.vx;
				p.y += p.vy;

				// Reset when off screen (top or sides)
				if (p.y < -10) {
					p.y = height + 10;
					p.x = Math.random() * width;
				}
				if (p.x < -10) p.x = width + 10;
				if (p.x > width + 10) p.x = -10;

				ctx.beginPath();
				ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
				ctx.fill();

				// Connect nearby particles with lines
				for (let j = i + 1; j < particles.length; j++) {
					const p2 = particles[j];
					const dx = p.x - p2.x;
					const dy = p.y - p2.y;
					const dist = Math.sqrt(dx * dx + dy * dy);

					if (dist < 100) {
						ctx.beginPath();
						ctx.moveTo(p.x, p.y);
						ctx.lineTo(p2.x, p2.y);
						ctx.strokeStyle = `rgba(${p.color}, ${0.04 * (1 - dist / 100)})`;
						ctx.lineWidth = 0.5;
						ctx.stroke();
					}
				}
			}

			animId = requestAnimationFrame(draw);
		}

		draw();

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener('resize', resize);
		};
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 px-4 py-8 overflow-hidden">
	<!-- Particle canvas -->
	<canvas bind:this={canvasEl} class="absolute inset-0 z-0 pointer-events-none"></canvas>

	<div class="relative z-10 w-full max-w-md">
		<!-- Logo -->
		<div class="mb-8 text-center">
			<a href="/" class="inline-flex items-center justify-center">
				<HermesLogo size="lg" />
			</a>
		</div>

		<!-- Animated border glow wrapper -->
		<div class="rounded-xl p-[1px] animate-border-rotate bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-blue-500/30 bg-[length:200%_200%]">
			<!-- Glass card -->
			<div class="rounded-xl border border-slate-700/30 bg-slate-900/80 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
				{@render children()}
			</div>
		</div>
	</div>
</div>
