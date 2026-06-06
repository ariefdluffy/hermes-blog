<script lang="ts">
    import { toast } from "$lib/stores/toast.svelte";

    let email = $state("");
    let error = $state("");
    let loading = $state(false);
    let success = $state(false);

    async function handleSubmit(e: Event) {
        e.preventDefault();
        error = "";
        loading = true;

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error("Failed", data.error || "Something went wrong");
                return;
            }

            toast.success("Email sent", "Check your inbox for reset link");
            success = true;
        } catch {
            toast.error("Network error", "Please try again");
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Forgot Password — Hermes Blog</title>
</svelte:head>

{#if success}
    <div class="text-center">
        <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-950/50 border border-blue-900/50"
        >
            <svg
                class="h-8 w-8 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                />
                <polyline points="22,6 12,13 2,6" />
            </svg>
        </div>
        <h1 class="mb-2 text-2xl font-bold text-white">Check your email</h1>
        <p class="mb-6 text-sm text-slate-400">
            If an account exists for <span class="text-white">{email}</span>,
            you will receive a password reset link shortly.
        </p>
        <a
            href="/auth/login"
            class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
            Back to login
        </a>
    </div>
{:else}
    <div>
        <h1 class="mb-2 text-2xl font-bold text-white">Forgot password?</h1>
        <p class="mb-6 text-sm text-slate-400">
            Enter your email and we'll send you a reset link.
        </p>

        {#if error}
            <div
                class="mb-4 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-400"
            >
                {error}
            </div>
        {/if}

        <form onsubmit={handleSubmit} class="space-y-4">
            <div>
                <label
                    for="fp-email"
                    class="mb-1.5 block text-sm font-medium text-slate-300"
                    >Email address</label
                >
                <input
                    id="fp-email"
                    type="email"
                    bind:value={email}
                    required
                    autocomplete="email"
                    placeholder="you@example.com"
                    class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {#if loading}
                    <span class="inline-flex items-center gap-2">
                        <svg
                            class="h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="3"
                                class="opacity-25"
                            />
                            <path
                                d="M4 12a8 8 0 018-8"
                                stroke="currentColor"
                                stroke-width="3"
                                stroke-linecap="round"
                                class="opacity-75"
                            />
                        </svg>
                        Sending...
                    </span>
                {:else}
                    Send reset link
                {/if}
            </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-400">
            Remember your password?
            <a
                href="/auth/login"
                class="text-blue-400 hover:text-blue-300 transition-colors"
                >Sign in</a
            >
        </p>
    </div>
{/if}
