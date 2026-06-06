<script lang="ts">
    import { page } from "$app/state";
    import { toast } from "$lib/stores/toast.svelte";

    let password = $state("");
    let confirmPassword = $state("");
    let error = $state("");
    let loading = $state(false);
    let success = $state(false);

    let token = $derived(page.url.searchParams.get("token"));

    async function handleSubmit(e: Event) {
        e.preventDefault();
        error = "";

        if (!token) {
            error = "Missing reset token. Please use the link from your email.";
            return;
        }

        if (password !== confirmPassword) {
            error = "Passwords do not match";
            return;
        }

        if (password.length < 8) {
            error = "Password must be at least 8 characters";
            return;
        }

        loading = true;

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(
                    "Reset failed",
                    data.error || "The link may have expired",
                );
                return;
            }

            toast.success(
                "Password reset",
                "You can now sign in with your new password",
            );
            success = true;
        } catch {
            toast.error("Network error", "Please try again");
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Reset Password — Hermes Blog</title>
</svelte:head>

{#if success}
    <div class="text-center">
        <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-950/50 border border-green-900/50"
        >
            <svg
                class="h-8 w-8 text-green-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        </div>
        <h1 class="mb-2 text-2xl font-bold text-white">Password reset!</h1>
        <p class="mb-6 text-sm text-slate-400">
            Your password has been reset successfully. You can now sign in with
            your new password.
        </p>
        <a
            href="/auth/login"
            class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
            Sign in
        </a>
    </div>
{:else}
    <div>
        <h1 class="mb-2 text-2xl font-bold text-white">Reset your password</h1>
        <p class="mb-6 text-sm text-slate-400">
            Enter your new password below.
        </p>

        {#if !token}
            <div
                class="mb-4 rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-400"
            >
                Invalid or missing reset token. Please request a new password
                reset link.
            </div>
            <a
                href="/auth/forgot-password"
                class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
                Request new link
            </a>
        {:else}
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
                        for="rp-password"
                        class="mb-1.5 block text-sm font-medium text-slate-300"
                        >New password</label
                    >
                    <input
                        id="rp-password"
                        type="password"
                        bind:value={password}
                        required
                        autocomplete="new-password"
                        placeholder="••••••••"
                        class="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <p class="mt-1 text-xs text-slate-500">
                        Minimum 8 characters
                    </p>
                </div>

                <div>
                    <label
                        for="rp-confirm"
                        class="mb-1.5 block text-sm font-medium text-slate-300"
                        >Confirm new password</label
                    >
                    <input
                        id="rp-confirm"
                        type="password"
                        bind:value={confirmPassword}
                        required
                        autocomplete="new-password"
                        placeholder="••••••••"
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
                            Resetting...
                        </span>
                    {:else}
                        Reset password
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
        {/if}
    </div>
{/if}
