<script lang="ts">
    import AdminSidebar from "./AdminSidebar.svelte";
    import { auth } from "$lib/stores/auth";
    import type { AuthUser } from "$lib/stores/auth";

    import type { Snippet } from "svelte";

    interface Props {
        children: Snippet;
        user: AuthUser | null;
    }

    let { children, user }: Props = $props();

    let collapsed = $state(true);
    let currentPath = $state("/admin");

    let displayUser = $derived(user ?? auth.user);

    // Track dark mode by observing the <html> class
    let isDark = $state(false);

    if (typeof window !== "undefined") {
        currentPath = window.location.pathname;
        isDark = document.documentElement.classList.contains("dark");
    }

    $effect(() => {
        if (typeof window === "undefined") return;
        const el = document.documentElement;
        isDark = el.classList.contains("dark");
        const observer = new MutationObserver(() => {
            isDark = el.classList.contains("dark");
        });
        observer.observe(el, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    });

    function toggleSidebar() {
        collapsed = !collapsed;
    }

    function toggleTheme() {
        const el = document.documentElement;
        const nowDark = el.classList.toggle("dark");
        localStorage.setItem("theme", nowDark ? "dark" : "light");
        isDark = nowDark;
    }
</script>

<div class="flex min-h-screen bg-slate-50 dark:bg-slate-950">
    <AdminSidebar
        user={displayUser}
        {currentPath}
        {collapsed}
        ontoggle={toggleSidebar}
    />

    <div class="flex flex-1 flex-col">
        <!-- Top bar -->
        <header
            class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-700 dark:bg-slate-900"
        >
            <div class="flex items-center gap-4">
                <button
                    onclick={toggleSidebar}
                    class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
                    aria-label="Toggle sidebar"
                >
                    <svg
                        class="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
                <h2
                    class="text-lg font-semibold text-slate-900 dark:text-white"
                >
                    Admin
                </h2>
            </div>

            <div class="flex items-center gap-3">
                <!-- Theme toggle -->
                <button
                    onclick={toggleTheme}
                    class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    aria-label="Toggle theme"
                >
                    {#if isDark}
                        <svg
                            class="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                    {:else}
                        <svg
                            class="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                            />
                        </svg>
                    {/if}
                </button>

                {#if displayUser}
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-slate-600 dark:text-slate-400"
                            >{displayUser.username}</span
                        >
                        <button
                            onclick={() => auth.logout()}
                            class="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                            Logout
                        </button>
                    </div>
                {/if}
            </div>
        </header>

        <!-- Main content -->
        <main class="flex-1 overflow-y-auto p-6">
            {@render children()}
        </main>
    </div>
</div>
