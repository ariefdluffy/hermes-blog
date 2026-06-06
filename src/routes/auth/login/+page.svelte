<script lang="ts">
    import { auth } from "$lib/stores/auth";
    import { toast } from "$lib/stores/toast.svelte";
    import HermesLogo from "$lib/components/ui/HermesLogo.svelte";

    interface Props {
        data: Record<string, never>;
    }

    let props: Props = $props();

    let email = $state("");
    let password = $state("");
    let showPassword = $state(false);
    let rememberMe = $state(false);

    let loading = $state(false);
    let generalError = $state("");
    let emailError = $state("");
    let passwordError = $state("");

    // Derived: can submit?
    let canSubmit = $derived(
        !loading && email.trim().length > 0 && password.length > 0,
    );

    function validateEmail(value: string): boolean {
        if (!value.trim()) {
            emailError = "Email is required";
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            emailError = "Invalid email address";
            return false;
        }
        emailError = "";
        return true;
    }

    function validatePassword(value: string): boolean {
        if (!value) {
            passwordError = "Password is required";
            return false;
        }
        passwordError = "";
        return true;
    }

    async function handleSubmit(e: Event) {
        e.preventDefault();
        generalError = "";
        emailError = "";
        passwordError = "";

        const emailValid = validateEmail(email);
        const passValid = validatePassword(password);

        if (!emailValid || !passValid) return;

        loading = true;

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                    rememberMe,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    toast.warning(
                        "Too many attempts",
                        "Please wait before trying again",
                    );
                    return;
                }
                if (res.status === 403) {
                    toast.error(
                        "Email not verified",
                        "Please check your inbox for the verification link",
                    );
                    return;
                }
                toast.error(
                    "Login failed",
                    data.error || "Invalid credentials",
                );
                return;
            }

            // Refresh auth store with user data
            await auth.fetchUser();

            toast.success("Welcome back!", `Signed in as ${email}`);

            // Redirect to return URL or admin (full page reload to ensure cookie is sent)
            const returnUrl = new URLSearchParams(window.location.search).get(
                "redirect",
            );
            window.location.href = returnUrl || "/admin";
        } catch {
            toast.error(
                "Connection error",
                "Please check your internet connection",
            );
        } finally {
            loading = false;
        }
    }

    // Clear field errors on input
    function onEmailInput() {
        if (emailError) validateEmail(email);
    }
    function onPasswordInput() {
        if (passwordError) validatePassword(password);
    }
</script>

<svelte:head>
    <title>Login — Hermes Blog</title>
</svelte:head>

<div class="space-y-5">
    <!-- Animated Logo -->
    <div class="flex justify-center">
        <div
            class="rounded-full bg-blue-500/10 p-4 ring-1 ring-blue-500/20 animate-pulse"
        >
            <HermesLogo size="xl" showText={false} />
        </div>
    </div>

    <!-- Heading -->
    <div class="text-center">
        <h1
            class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
            Welcome Back
        </h1>
        <p class="mt-1 text-sm text-slate-400">
            Sign in to your Hermes account
        </p>
    </div>

    <!-- Error Alert -->
    {#if generalError}
        <div
            class="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 backdrop-blur px-4 py-3 text-sm text-red-400 slide-down"
            role="alert"
        >
            <svg
                class="mt-0.5 h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <span>{generalError}</span>
        </div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-4" novalidate>
        <!-- Email Input Group -->
        <div>
            <label
                for="email"
                class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500"
                >Email</label
            >
            <div
                class="input-glow flex items-center gap-3 rounded-xl border {emailError
                    ? 'border-red-500/50'
                    : 'border-slate-700/50'} bg-slate-800/30 px-4 py-3 transition-colors"
            >
                <svg
                    class="h-5 w-5 shrink-0 {emailError
                        ? 'text-red-400'
                        : 'text-slate-500'}"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                </svg>
                <input
                    id="email"
                    type="email"
                    bind:value={email}
                    oninput={onEmailInput}
                    onblur={() => validateEmail(email)}
                    required
                    autocomplete="email"
                    placeholder="you@example.com"
                    aria-invalid={emailError ? "true" : undefined}
                    aria-describedby={emailError ? "email-error" : undefined}
                    class="flex-1 border-none bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                />
            </div>
            {#if emailError}
                <p id="email-error" class="mt-1 text-xs text-red-400">
                    {emailError}
                </p>
            {/if}
        </div>

        <!-- Password Input Group -->
        <div>
            <label
                for="password"
                class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500"
                >Password</label
            >
            <div
                class="input-glow flex items-center gap-3 rounded-xl border {passwordError
                    ? 'border-red-500/50'
                    : 'border-slate-700/50'} bg-slate-800/30 px-4 py-3 transition-colors"
            >
                <svg
                    class="h-5 w-5 shrink-0 {passwordError
                        ? 'text-red-400'
                        : 'text-slate-500'}"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                </svg>
                <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    bind:value={password}
                    oninput={onPasswordInput}
                    onblur={() => validatePassword(password)}
                    required
                    autocomplete="current-password"
                    placeholder="••••••••"
                    aria-invalid={passwordError ? "true" : undefined}
                    aria-describedby={passwordError
                        ? "password-error"
                        : undefined}
                    class="flex-1 border-none bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                />
                <button
                    type="button"
                    onclick={() => {
                        showPassword = !showPassword;
                    }}
                    class="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
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
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243a10.016 10.016 0 01-2.338 1.345M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
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
            {#if passwordError}
                <p id="password-error" class="mt-1 text-xs text-red-400">
                    {passwordError}
                </p>
            {/if}
        </div>

        <!-- Remember + Forgot -->
        <div class="flex items-center justify-between">
            <label class="flex items-center gap-2.5 cursor-pointer group">
                <input
                    type="checkbox"
                    bind:checked={rememberMe}
                    class="sr-only"
                />
                <span
                    class="flex h-5 w-5 items-center justify-center rounded-md border {rememberMe
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-600 bg-slate-800'} transition-colors group-hover:border-slate-500"
                >
                    {#if rememberMe}
                        <svg
                            class="h-3.5 w-3.5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="3"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    {/if}
                </span>
                <span class="text-sm text-slate-400 select-none"
                    >Remember me</span
                >
            </label>
            <a
                href="/auth/forgot-password"
                class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
                Forgot password?
            </a>
        </div>

        <!-- Submit -->
        <button
            type="submit"
            disabled={!canSubmit}
            class="btn-gradient w-full h-12 rounded-xl text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:active:scale-100"
        >
            {#if loading}
                <span class="inline-flex items-center justify-center gap-2">
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
                    Signing in...
                </span>
            {:else}
                Sign In
            {/if}
        </button>
    </form>

    <!-- Divider -->
    <div class="flex items-center gap-3">
        <span
            class="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"
        ></span>
        <span
            class="text-xs font-medium uppercase tracking-wider text-slate-500"
            >or continue with</span
        >
        <span
            class="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"
        ></span>
    </div>

    <!-- Social Buttons -->
    <div class="grid grid-cols-2 gap-3">
        <button
            type="button"
            disabled
            aria-disabled="true"
            title="Coming soon"
            class="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-slate-700/50 bg-slate-800/40 text-sm font-medium text-slate-300 transition-all cursor-not-allowed opacity-50"
        >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
            </svg>
            GitHub
        </button>
        <button
            type="button"
            disabled
            aria-disabled="true"
            title="Coming soon"
            class="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-slate-700/50 bg-slate-800/40 text-sm font-medium text-slate-300 transition-all cursor-not-allowed opacity-50"
        >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                />
                <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                />
                <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                />
                <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                />
            </svg>
            Google
        </button>
    </div>

    <!-- Register Link -->
    <p class="text-center text-sm text-slate-400">
        Don't have an account?
        <a
            href="/auth/register"
            class="font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 hover:underline decoration-blue-400/50 underline-offset-2 transition-all"
        >
            Create one
        </a>
    </p>

    <!-- Security Badge -->
    <p class="flex items-center justify-center gap-1.5 text-xs text-slate-600">
        <svg
            class="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
        </svg>
        Protected by HTTP‑only cookies
    </p>
</div>

<style>
    .input-glow {
        transition: all 0.2s ease;
    }
    .input-glow:focus-within {
        border-color: rgb(59 130 246 / 0.4);
        box-shadow:
            0 0 0 3px rgb(59 130 246 / 0.1),
            0 0 20px -5px rgb(59 130 246 / 0.15);
        transform: scale(1.01);
    }

    .btn-gradient {
        background: linear-gradient(135deg, #2563eb, #7c3aed);
        box-shadow: 0 4px 14px -4px rgb(37 99 235 / 0.3);
    }
    .btn-gradient:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 25px -4px rgb(37 99 235 / 0.4);
    }
    .btn-gradient:active:not(:disabled) {
        transform: scale(0.98);
    }

    @keyframes slide-down {
        from {
            opacity: 0;
            transform: translateY(-6px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .slide-down {
        animation: slide-down 0.25s ease-out;
    }
</style>
