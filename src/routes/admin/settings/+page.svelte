<script lang="ts">
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
    }

    let props: Props = $props();

    let siteTitle = $state(props.data.settings.siteTitle);
    let siteDescription = $state(props.data.settings.siteDescription);
    let language = $state(props.data.settings.language);
    let postsPerPage = $state(props.data.settings.postsPerPage);
    let enableAiGeneration = $state(props.data.settings.enableAiGeneration);
    let enableComments = $state(props.data.settings.enableComments);
    let maintenanceMode = $state(props.data.settings.maintenanceMode);

    let saving = $state(false);
    let success = $state(false);
    let error = $state("");

    async function handleSave(e: Event) {
        e.preventDefault();
        saving = true;
        success = false;
        error = "";

        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    siteTitle,
                    siteDescription,
                    language,
                    postsPerPage,
                    enableAiGeneration,
                    enableComments,
                    maintenanceMode,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                error = data.error || "Failed to save settings";
                return;
            }

            success = true;
            setTimeout(() => {
                success = false;
            }, 3000);
        } catch {
            error = "Network error";
        } finally {
            saving = false;
        }
    }
</script>

<svelte:head>
    <title>Settings — Hermes Admin</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
    <div>
        <div class="flex items-center gap-4 mb-1">
            <a
                href="/admin"
                class="rounded-lg p-2 text-slate-400 hover:bg-slate-700 transition-colors"
                aria-label="Back to dashboard"
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
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                </svg>
            </a>
            <h1 class="text-2xl font-bold text-white">Settings</h1>
        </div>
        <p class="mt-1 text-sm text-slate-400">Manage site configuration</p>
    </div>

    {#if success}
        <div
            class="rounded-lg border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-400"
        >
            Settings saved successfully.
        </div>
    {/if}

    {#if error}
        <div
            class="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
            {error}
        </div>
    {/if}

    <form onsubmit={handleSave} class="space-y-6">
        <!-- General -->
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
            <h2 class="mb-4 text-lg font-semibold text-white">General</h2>
            <div class="space-y-4">
                <div>
                    <label
                        for="site-title"
                        class="mb-1.5 block text-sm font-medium text-slate-300"
                        >Site Title</label
                    >
                    <input
                        id="site-title"
                        type="text"
                        bind:value={siteTitle}
                        class="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label
                        for="site-desc"
                        class="mb-1.5 block text-sm font-medium text-slate-300"
                        >Site Description</label
                    >
                    <textarea
                        id="site-desc"
                        bind:value={siteDescription}
                        rows="3"
                        class="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    ></textarea>
                </div>
                <div class="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            for="language"
                            class="mb-1.5 block text-sm font-medium text-slate-300"
                            >Language</label
                        >
                        <select
                            id="language"
                            bind:value={language}
                            class="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="en">English</option>
                            <option value="id">Bahasa Indonesia</option>
                        </select>
                    </div>
                    <div>
                        <label
                            for="posts-per-page"
                            class="mb-1.5 block text-sm font-medium text-slate-300"
                            >Posts Per Page</label
                        >
                        <input
                            id="posts-per-page"
                            type="number"
                            min="5"
                            max="50"
                            bind:value={postsPerPage}
                            class="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Features -->
        <div class="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
            <h2 class="mb-4 text-lg font-semibold text-white">Features</h2>
            <div class="space-y-4">
                <label
                    class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3 cursor-pointer hover:bg-slate-700/30 transition-colors"
                >
                    <div>
                        <span class="block text-sm font-medium text-slate-200"
                            >AI Generation</span
                        >
                        <span class="block text-xs text-slate-400"
                            >Allow Hermes AI to auto-generate drafts</span
                        >
                    </div>
                    <input
                        type="checkbox"
                        bind:checked={enableAiGeneration}
                        class="h-5 w-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                </label>

                <label
                    class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3 cursor-pointer hover:bg-slate-700/30 transition-colors"
                >
                    <div>
                        <span class="block text-sm font-medium text-slate-200"
                            >Comments</span
                        >
                        <span class="block text-xs text-slate-400"
                            >Enable comments on articles</span
                        >
                    </div>
                    <input
                        type="checkbox"
                        bind:checked={enableComments}
                        class="h-5 w-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                </label>

                <label
                    class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3 cursor-pointer hover:bg-slate-700/30 transition-colors"
                >
                    <div>
                        <span class="block text-sm font-medium text-slate-200"
                            >Maintenance Mode</span
                        >
                        <span class="block text-xs text-slate-400"
                            >Show maintenance page to visitors</span
                        >
                    </div>
                    <input
                        type="checkbox"
                        bind:checked={maintenanceMode}
                        class="h-5 w-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                </label>
            </div>
        </div>

        <!-- Submit -->
        <button
            type="submit"
            disabled={saving}
            class="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {#if saving}
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
                    Saving...
                </span>
            {:else}
                Save Settings
            {/if}
        </button>
    </form>
</div>
