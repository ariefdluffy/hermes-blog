<script lang="ts">
    import { page } from "$app/state";

    let status: "loading" | "success" | "error" = $state("loading");
    let message = $state("");

    $effect(() => {
        const token = page.url.searchParams.get("token");
        if (!token) {
            status = "error";
            message =
                "No verification token provided. Please check your email for the correct link.";
            return;
        }

        fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
            .then(async (res) => {
                const data = await res.json();
                if (res.ok) {
                    status = "success";
                    message = data.message || "Email verified successfully!";
                } else {
                    status = "error";
                    message =
                        data.error ||
                        "Verification failed. The link may have expired.";
                }
            })
            .catch(() => {
                status = "error";
                message = "Network error. Please try again.";
            });
    });
</script>

<svelte:head>
    <title>Verify Email — Hermes Blog</title>
</svelte:head>

<div class="text-center">
    {#if status === "loading"}
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <svg
                class="h-8 w-8 animate-spin text-blue-400"
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
        </div>
        <h1 class="mb-2 text-2xl font-bold text-white">Verifying your email</h1>
        <p class="text-sm text-slate-400">Please wait...</p>
    {:else if status === "success"}
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
        <h1 class="mb-2 text-2xl font-bold text-white">Email verified!</h1>
        <p class="mb-6 text-sm text-slate-400">{message}</p>
        <a
            href="/auth/login"
            class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
            Sign in to your account
        </a>
    {:else}
        <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-950/50 border border-red-900/50"
        >
            <svg
                class="h-8 w-8 text-red-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        </div>
        <h1 class="mb-2 text-2xl font-bold text-white">Verification failed</h1>
        <p class="mb-6 text-sm text-slate-400">{message}</p>
        <a
            href="/auth/login"
            class="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
            Back to login
        </a>
    {/if}
</div>
