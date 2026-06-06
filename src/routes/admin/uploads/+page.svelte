<script lang="ts">
    import UploadForm from "$lib/components/admin/UploadForm.svelte";
    import { confirm } from "$lib/stores/confirm.svelte";
    import { toast } from "$lib/stores/toast.svelte";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
    }

    let props: Props = $props();

    let uploads = $state([...props.data.uploads]);

    function formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    interface UploadResult {
        id: string;
        filename: string;
        mimeType: string;
        size: number;
        url: string;
        thumbnailUrl: string | null;
        createdAt: string;
    }

    function handleUpload(
        file: File,
        onProgress: (pct: number) => void,
    ): Promise<UploadResult> {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("file", file);

            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/api/admin/uploads");

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const result = JSON.parse(xhr.responseText);
                    uploads = [result, ...uploads];
                    toast.success(
                        "Uploaded",
                        `${result.filename} uploaded successfully`,
                    );
                    resolve(result);
                } else {
                    try {
                        const err = JSON.parse(xhr.responseText);
                        reject(new Error(err.error || "Upload failed"));
                    } catch {
                        reject(new Error("Upload failed"));
                    }
                }
            };

            xhr.onerror = () => reject(new Error("Network error"));
            xhr.send(formData);
        });
    }

    async function confirmDeleteUpload(id: string, filename: string) {
        confirm.show({
            title: "Delete Upload",
            message: `"${filename}" will be permanently removed from storage.`,
            variant: "danger",
            confirmLabel: "Delete",
            onConfirm: async () => {
                const res = await fetch(`/api/admin/uploads/${id}`, {
                    method: "DELETE",
                });
                if (res.ok) {
                    uploads = uploads.filter((u: any) => u.id !== id);
                    toast.success("Deleted", `"${filename}" has been deleted`);
                } else {
                    toast.error("Failed", "Could not delete upload.");
                }
            },
        });
    }
</script>

<svelte:head>
    <title>Uploads — Hermes Admin</title>
</svelte:head>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-white">Uploads</h1>
        <p class="text-sm text-slate-400">{props.data.total} files</p>
    </div>

    <!-- Upload Form -->
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
        <h2 class="mb-4 text-lg font-semibold text-white">Upload New File</h2>
        <UploadForm onupload={handleUpload} />
    </div>

    <!-- Uploads Grid -->
    {#if uploads.length === 0}
        <div
            class="rounded-xl border border-dashed border-slate-700 bg-slate-800/30 p-12 text-center"
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
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
            </svg>
            <p class="text-slate-500">
                No uploads yet. Upload your first file above.
            </p>
        </div>
    {:else}
        <div
            class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
            {#each uploads as upload (upload.id)}
                <div
                    class="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 transition-colors hover:border-slate-600"
                >
                    <!-- Thumbnail -->
                    <div class="aspect-square overflow-hidden bg-slate-700">
                        {#if upload.mimeType.startsWith("image/")}
                            <img
                                src={upload.thumbnailUrl || upload.url}
                                alt={upload.filename}
                                class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                loading="lazy"
                            />
                        {:else}
                            <div
                                class="flex h-full w-full items-center justify-center"
                            >
                                <svg
                                    class="h-10 w-10 text-slate-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                    />
                                </svg>
                            </div>
                        {/if}
                    </div>

                    <!-- Info -->
                    <div class="p-3">
                        <p class="truncate text-sm font-medium text-white">
                            {upload.filename}
                        </p>
                        <p class="mt-0.5 text-xs text-slate-500">
                            {formatSize(upload.size)} · {formatDate(
                                upload.createdAt,
                            )}
                        </p>
                    </div>

                    <!-- Delete button -->
                    <div
                        class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <button
                            type="button"
                            class="rounded-lg bg-red-600/80 p-1.5 text-white backdrop-blur-sm hover:bg-red-500 transition-colors"
                            onclick={() =>
                                confirmDeleteUpload(upload.id, upload.filename)}
                            aria-label={`Delete ${upload.filename}`}
                        >
                            <svg
                                class="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
