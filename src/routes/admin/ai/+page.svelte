<script lang="ts">
    import { goto } from "$app/navigation";
    import AiGenerateForm from "$lib/components/admin/AiGenerateForm.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import { confirm } from "$lib/stores/confirm.svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import { CATEGORIES } from "$lib/constants";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
    }

    let props: Props = $props();

    let generating = $state(false);
    let generateError = $state<string | null>(null);

    const statusVariant: Record<
        string,
        "default" | "success" | "warning" | "danger" | "info"
    > = {
        DRAFT: "default",
        REVIEW: "warning",
        PUBLISHED: "success",
        ARCHIVED: "danger",
    };

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    async function handleGenerate(formData: {
        source: string;
        category: keyof typeof CATEGORIES;
    }) {
        generating = true;
        generateError = null;

        try {
            const res = await fetch("/api/admin/ai/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const err = await res.json();
                generateError = err.error || "AI generation failed";
                return;
            }

            goto("/admin/ai?t=" + Date.now());
        } catch (err) {
            generateError =
                err instanceof Error ? err.message : "Network error";
        } finally {
            generating = false;
        }
    }

    function deleteArticle(id: string, title: string) {
        confirm.show({
            title: "Delete Draft",
            message: `"${title}" will be permanently removed. This action cannot be undone.`,
            variant: "danger",
            confirmLabel: "Delete",
            onConfirm: async () => {
                const res = await fetch(`/api/admin/articles/${id}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    toast.success("Deleted", `"${title}" has been deleted`);
                    location.reload();
                } else {
                    toast.error("Failed", "Could not delete draft. Try again.");
                }
            },
        });
    }

    function handlePageChange(page: number) {
        goto(`/admin/ai?page=${page}`);
    }
</script>

<svelte:head>
    <title>AI Queue — Hermes Admin</title>
</svelte:head>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-white">AI Article Generator</h1>
        <p class="text-sm text-slate-400">{props.data.total} drafts in queue</p>
    </div>

    <!-- AI Generate Form -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
        <h2 class="mb-4 text-lg font-semibold text-white">
            Generate New Article
        </h2>

        {#if generateError}
            <div
                class="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
                {generateError}
            </div>
        {/if}

        <AiGenerateForm onsubmit={handleGenerate} loading={generating} />
    </div>

    <!-- AI Queue Table -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
        <h2 class="mb-4 text-lg font-semibold text-white">Generated Drafts</h2>

        {#if props.data.aiArticles.length === 0}
            <div
                class="rounded-lg border border-dashed border-slate-700 p-8 text-center"
            >
                <svg
                    class="mx-auto h-12 w-12 text-slate-600 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                    />
                </svg>
                <p class="text-slate-500">
                    No AI-generated drafts yet. Generate one above!
                </p>
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full min-w-[700px] text-left text-sm">
                    <thead>
                        <tr class="border-b border-slate-700/50">
                            <th class="pb-3 font-semibold text-slate-300"
                                >Title</th
                            >
                            <th class="pb-3 font-semibold text-slate-300"
                                >Tags</th
                            >
                            <th class="pb-3 font-semibold text-slate-300"
                                >Status</th
                            >
                            <th class="pb-3 font-semibold text-slate-300"
                                >Read Time</th
                            >
                            <th class="pb-3 font-semibold text-slate-300"
                                >Created</th
                            >
                            <th
                                class="pb-3 font-semibold text-slate-300 text-right"
                                >Actions</th
                            >
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-700/30">
                        {#each props.data.aiArticles as article}
                            <tr class="hover:bg-slate-700/30 transition-colors">
                                <td class="py-3">
                                    <div class="max-w-xs">
                                        <a
                                            href="/admin/articles/{article.id}/edit"
                                            class="font-medium text-white hover:text-blue-400 block truncate"
                                        >
                                            {article.title}
                                        </a>
                                        {#if article.excerpt}
                                            <p
                                                class="mt-0.5 text-xs text-slate-500 truncate"
                                            >
                                                {article.excerpt}
                                            </p>
                                        {/if}
                                    </div>
                                </td>
                                <td class="py-3">
                                    <div class="flex flex-wrap gap-1">
                                        {#each article.tags as tag}
                                            <span
                                                class="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300"
                                                >{tag.name}</span
                                            >
                                        {/each}
                                    </div>
                                </td>
                                <td class="py-3">
                                    <Badge
                                        variant={statusVariant[
                                            article.status
                                        ] ?? "default"}
                                        size="sm"
                                    >
                                        {article.status}
                                    </Badge>
                                </td>
                                <td class="py-3 text-slate-400"
                                    >{article.readTime ?? "—"} min</td
                                >
                                <td class="py-3 text-slate-400"
                                    >{formatDate(article.createdAt)}</td
                                >
                                <td class="py-3 text-right">
                                    <div
                                        class="flex items-center justify-end gap-2"
                                    >
                                        <a
                                            href="/admin/articles/{article.id}/edit"
                                            class="rounded px-2 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-colors"
                                        >
                                            Edit
                                        </a>
                                        <button
                                            type="button"
                                            class="rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                                            onclick={() =>
                                                deleteArticle(
                                                    article.id,
                                                    article.title,
                                                )}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            {#if props.data.totalPages > 1}
                <div
                    class="mt-4 flex items-center justify-between text-sm text-slate-400"
                >
                    <p>
                        Showing {(props.data.page - 1) * props.data.perPage +
                            1}&ndash;{Math.min(
                            props.data.page * props.data.perPage,
                            props.data.total,
                        )} of {props.data.total}
                    </p>
                    <div class="flex items-center gap-1">
                        <button
                            class="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-700 disabled:opacity-40"
                            disabled={props.data.page <= 1}
                            onclick={() =>
                                handlePageChange(props.data.page - 1)}
                        >
                            Previous
                        </button>
                        <button
                            class="rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-700 disabled:opacity-40"
                            disabled={props.data.page >= props.data.totalPages}
                            onclick={() =>
                                handlePageChange(props.data.page + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</div>
