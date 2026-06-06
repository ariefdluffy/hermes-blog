<script lang="ts">
    import { toast } from "$lib/stores/toast.svelte";

    let username = $state("");
    let email = $state("");
    let password = $state("");
    let confirmPassword = $state("");
    let showPassword = $state(false);
    let showConfirm = $state(false);
    let error = $state("");
    let fieldErrors = $state<Record<string, string>>({});
    let loading = $state(false);
    let success = $state(false);

    $effect(() => {
        if (username) fieldErrors = { ...fieldErrors, username: undefined };
    });
    $effect(() => {
        if (email) fieldErrors = { ...fieldErrors, email: undefined };
    });
    $effect(() => {
        if (password) fieldErrors = { ...fieldErrors, password: undefined };
    });
    $effect(() => {
        if (confirmPassword)
            fieldErrors = { ...fieldErrors, confirmPassword: undefined };
    });

    function validate(): boolean {
        const e: Record<string, string> = {};
        if (!username.trim()) e.username = "Username is required";
        else if (username.length < 3) e.username = "At least 3 characters";
        else if (!/^[a-zA-Z0-9_-]+$/.test(username))
            e.username = "Only letters, numbers, _, -";

        if (!email.trim()) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            e.email = "Invalid email format";

        if (!password) e.password = "Password is required";
        else if (password.length < 8) e.password = "At least 8 characters";

        if (password !== confirmPassword)
            e.confirmPassword = "Passwords do not match";

        fieldErrors = e;
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();
        error = "";
        if (!validate()) return;

        loading = true;

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username.trim(),
                    email: email.trim(),
                    password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.details) {
                    toast.error(
                        "Registration failed",
                        Object.values(data.details).flat().join(" "),
                    );
                } else {
                    toast.error(
                        "Registration failed",
                        data.error || "Please try again",
                    );
                }
                return;
            }

            toast.success(
                "Account created!",
                "Please check your email to verify",
            );
            success = true;
        } catch {
            toast.error(
                "Connection error",
                "Please check your internet connection",
            );
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Register — Hermes Blog</title>
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
        <h1 class="mb-2 text-2xl font-bold text-white">Check your email</h1>
        <p class="mb-6 text-sm text-slate-400">
            We've sent a verification link to <span class="text-white"
                >{email}</span
            >. Please check your inbox to verify your account.
        </p>
        <a
            href="/auth/login"
            class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
            Go to login
        </a>
    </div>
{:else}
    <div>
        <h1 class="mb-1 text-2xl font-bold text-white">Create account</h1>
        <p class="mb-6 text-sm text-slate-400">Join Hermes Blog as an author</p>

        {#if error}
            <div
                class="mb-4 rounded-lg border border-red-800/50 bg-red-950/50 px-4 py-3 text-sm text-red-400"
                role="alert"
            >
                {error}
            </div>
        {/if}

        <form onsubmit={handleSubmit} class="space-y-4" novalidate>
            <!-- Username -->
            <div>
                <label
                    for="reg-username"
                    class="mb-1.5 block text-sm font-medium text-slate-300"
                    >Username</label
                >
                <input
                    id="reg-username"
                    type="text"
                    bind:value={username}
                    required
                    autocomplete="username"
                    placeholder="johndoe"
                    aria-invalid={fieldErrors.username ? "true" : undefined}
                    aria-describedby={fieldErrors.username
                        ? "reg-username-error"
                        : undefined}
                    class="w-full rounded-lg border px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-1 {fieldErrors.username
                        ? 'border-red-500 bg-red-950/20 focus:border-red-400'
                        : 'border-slate-700 bg-slate-800 focus:border-blue-500'}"
                />
                {#if fieldErrors.username}
                    <p
                        id="reg-username-error"
                        class="mt-1 text-xs text-red-400"
                    >
                        {fieldErrors.username}
                    </p>
                {:else}
                    <p class="mt-1 text-xs text-slate-500">
                        3-30 characters, letters, numbers, _, -
                    </p>
                {/if}
            </div>

            <!-- Email -->
            <div>
                <label
                    for="reg-email"
                    class="mb-1.5 block text-sm font-medium text-slate-300"
                    >Email</label
                >
                <input
                    id="reg-email"
                    type="email"
                    bind:value={email}
                    required
                    autocomplete="email"
                    inputmode="email"
                    placeholder="you@example.com"
                    aria-invalid={fieldErrors.email ? "true" : undefined}
                    aria-describedby={fieldErrors.email
                        ? "reg-email-error"
                        : undefined}
                    class="w-full rounded-lg border px-4 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-1 {fieldErrors.email
                        ? 'border-red-500 bg-red-950/20 focus:border-red-400'
                        : 'border-slate-700 bg-slate-800 focus:border-blue-500'}"
                />
                {#if fieldErrors.email}
                    <p id="reg-email-error" class="mt-1 text-xs text-red-400">
                        {fieldErrors.email}
                    </p>
                {/if}
            </div>

            <!-- Password -->
            <div>
                <label
                    for="reg-password"
                    class="mb-1.5 block text-sm font-medium text-slate-300"
                    >Password</label
                >
                <div class="relative">
                    <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        bind:value={password}
                        required
                        autocomplete="new-password"
                        placeholder="••••••••"
                        aria-invalid={fieldErrors.password ? "true" : undefined}
                        aria-describedby={fieldErrors.password
                            ? "reg-password-error"
                            : undefined}
                        class="w-full rounded-lg border px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-1 {fieldErrors.password
                            ? 'border-red-500 bg-red-950/20 focus:border-red-400'
                            : 'border-slate-700 bg-slate-800 focus:border-blue-500'}"
                    />
                    <button
                        type="button"
                        onclick={() => {
                            showPassword = !showPassword;
                        }}
                        class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-200"
                        aria-label={showPassword
                            ? "Hide password"
                            : "Show password"}
                    >
                        {#if showPassword}
                            <svg
                                class="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                            </svg>
                        {:else}
                            <svg
                                class="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        {/if}
                    </button>
                </div>
                {#if fieldErrors.password}
                    <p
                        id="reg-password-error"
                        class="mt-1 text-xs text-red-400"
                    >
                        {fieldErrors.password}
                    </p>
                {:else}
                    <p class="mt-1 text-xs text-slate-500">
                        Minimum 8 characters
                    </p>
                {/if}
            </div>

            <!-- Confirm password -->
            <div>
                <label
                    for="reg-confirm"
                    class="mb-1.5 block text-sm font-medium text-slate-300"
                    >Confirm password</label
                >
                <div class="relative">
                    <input
                        id="reg-confirm"
                        type={showConfirm ? "text" : "password"}
                        bind:value={confirmPassword}
                        required
                        autocomplete="new-password"
                        placeholder="••••••••"
                        aria-invalid={fieldErrors.confirmPassword
                            ? "true"
                            : undefined}
                        aria-describedby={fieldErrors.confirmPassword
                            ? "reg-confirm-error"
                            : undefined}
                        class="w-full rounded-lg border px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-1 {fieldErrors.confirmPassword
                            ? 'border-red-500 bg-red-950/20 focus:border-red-400'
                            : 'border-slate-700 bg-slate-800 focus:border-blue-500'}"
                    />
                    <button
                        type="button"
                        onclick={() => {
                            showConfirm = !showConfirm;
                        }}
                        class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-200"
                        aria-label={showConfirm
                            ? "Hide password"
                            : "Show password"}
                    >
                        {#if showConfirm}
                            <svg
                                class="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                />
                            </svg>
                        {:else}
                            <svg
                                class="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                            </svg>
                        {/if}
                    </button>
                </div>
                {#if fieldErrors.confirmPassword}
                    <p id="reg-confirm-error" class="mt-1 text-xs text-red-400">
                        {fieldErrors.confirmPassword}
                    </p>
                {/if}
            </div>

            <button
                type="submit"
                disabled={loading}
                class="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {#if loading}
                    <span class="inline-flex items-center gap-2 justify-center">
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
                                opacity="0.25"
                            />
                            <path
                                d="M4 12a8 8 0 018-8"
                                stroke="currentColor"
                                stroke-width="3"
                                stroke-linecap="round"
                                opacity="0.75"
                            />
                        </svg>
                        Creating account...
                    </span>
                {:else}
                    Create account
                {/if}
            </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-400">
            Already have an account?
            <a
                href="/auth/login"
                class="text-blue-400 hover:text-blue-300 transition-colors"
                >Sign in</a
            >
        </p>
    </div>
{/if}
