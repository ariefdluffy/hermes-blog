<script lang="ts">
    import { UPLOAD } from "$lib/constants";

    interface UploadedFile {
        id: string;
        filename: string;
        url: string;
        mimeType: string;
        size: number;
    }

    interface Props {
        onupload: (
            file: File,
            onProgress: (pct: number) => void,
        ) => Promise<UploadedFile>;
        maxFiles?: number;
    }

    let { onupload, maxFiles = 5 }: Props = $props();

    let files = $state<
        {
            file: File;
            preview: string;
            status: "pending" | "uploading" | "done" | "error";
            progress: number;
            result?: UploadedFile;
            error?: string;
        }[]
    >([]);
    let dragOver = $state(false);
    let fileInputEl: HTMLInputElement | undefined = $state();

    const acceptTypes = UPLOAD.ALLOWED_MIME_TYPES.join(",");
    const maxSize = UPLOAD.MAX_FILE_SIZE;

    function addFiles(fileList: FileList | null) {
        if (!fileList) return;

        const newFiles = Array.from(fileList);
        const remaining = maxFiles - files.length;

        for (let i = 0; i < Math.min(newFiles.length, remaining); i++) {
            const file = newFiles[i];

            if (!UPLOAD.ALLOWED_MIME_TYPES.includes(file.type as any)) {
                files = [
                    ...files,
                    {
                        file,
                        preview: "",
                        status: "error",
                        progress: 0,
                        error: "Invalid file type",
                    },
                ];
                continue;
            }

            if (file.size > maxSize) {
                files = [
                    ...files,
                    {
                        file,
                        preview: "",
                        status: "error",
                        progress: 0,
                        error: `File exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`,
                    },
                ];
                continue;
            }

            const preview = URL.createObjectURL(file);
            const entry = {
                file,
                preview,
                status: "pending" as const,
                progress: 0,
            };
            files = [...files, entry];
            uploadFile(entry);
        }
    }

    async function uploadFile(entry: (typeof files)[number]) {
        const idx = files.findIndex((f) => f === entry);
        if (idx === -1) return;

        files[idx] = { ...files[idx], status: "uploading", progress: 0 };
        files = [...files];

        try {
            const result = await onupload(entry.file, (pct: number) => {
                const i = files.findIndex((f) => f.file === entry.file);
                if (i !== -1) {
                    files[i] = { ...files[i], progress: pct };
                    files = [...files];
                }
            });
            const currentIdx = files.findIndex((f) => f.file === entry.file);
            if (currentIdx !== -1) {
                files[currentIdx] = {
                    ...files[currentIdx],
                    status: "done",
                    progress: 100,
                    result,
                };
                files = [...files];
            }
        } catch (err) {
            const currentIdx = files.findIndex((f) => f.file === entry.file);
            if (currentIdx !== -1) {
                files[currentIdx] = {
                    ...files[currentIdx],
                    status: "error",
                    progress: 0,
                    error: err instanceof Error ? err.message : "Upload failed",
                };
                files = [...files];
            }
        }
    }

    function removeFile(index: number) {
        const file = files[index];
        if (file.preview) URL.revokeObjectURL(file.preview);
        files = files.filter((_, i) => i !== index);
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        dragOver = false;
        addFiles(e.dataTransfer?.files ?? null);
    }

    function formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
</script>

<div class="space-y-4">
    <!-- Drop zone -->
    <div
        class="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors {dragOver
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'}"
        ondragover={(e) => {
            e.preventDefault();
            dragOver = true;
        }}
        ondragleave={() => (dragOver = false)}
        ondrop={handleDrop}
    >
        <svg
            class="mb-3 h-10 w-10 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
        </svg>
        <p class="text-sm font-medium text-slate-300">
            Drop files here or <button
                type="button"
                class="text-blue-400 hover:text-blue-300 underline"
                onclick={() => fileInputEl?.click()}>browse</button
            >
        </p>
        <p class="mt-1 text-xs text-slate-500">
            JPEG, PNG, WebP, GIF up to {(maxSize / 1024 / 1024).toFixed(0)}MB
        </p>
        <input
            bind:this={fileInputEl}
            type="file"
            accept={acceptTypes}
            multiple={maxFiles > 1}
            class="hidden"
            onchange={(e) => addFiles((e.target as HTMLInputElement).files)}
        />
    </div>

    <!-- File list -->
    {#if files.length > 0}
        <div class="space-y-2">
            {#each files as f, i}
                <div
                    class="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-800/50 p-3"
                >
                    <!-- Preview -->
                    <div
                        class="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-700"
                    >
                        {#if f.preview && f.status !== "error"}
                            <img
                                src={f.preview}
                                alt={f.file.name}
                                class="h-full w-full object-cover"
                            />
                        {:else}
                            <div
                                class="flex h-full w-full items-center justify-center text-slate-500"
                            >
                                <svg
                                    class="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    stroke-width="2"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                                    />
                                </svg>
                            </div>
                        {/if}
                    </div>

                    <!-- Info -->
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-slate-300">
                            {f.file.name}
                        </p>
                        <p class="text-xs text-slate-500">
                            {formatSize(f.file.size)}
                        </p>
                        {#if f.status === "uploading"}
                            <div class="mt-1.5 flex items-center gap-2">
                                <div
                                    class="h-2 flex-1 overflow-hidden rounded-full bg-slate-700"
                                >
                                    <div
                                        class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out"
                                        style="width: {f.progress}%"
                                    ></div>
                                </div>
                                <span
                                    class="tabular-nums text-xs font-semibold text-indigo-400 min-w-[2.5rem] text-right"
                                    >{f.progress}%</span
                                >
                            </div>
                        {:else if f.status === "error"}
                            <p class="mt-0.5 text-xs text-red-400">{f.error}</p>
                        {/if}
                    </div>

                    <!-- Status icon -->
                    <div class="shrink-0">
                        {#if f.status === "uploading"}
                            <svg
                                class="h-5 w-5 animate-spin text-indigo-400"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    class="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    stroke-width="4"
                                ></circle>
                                <path
                                    class="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                ></path>
                            </svg>
                        {:else if f.status === "done"}
                            <svg
                                class="h-5 w-5 text-emerald-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        {:else if f.status === "error"}
                            <svg
                                class="h-5 w-5 text-red-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                />
                            </svg>
                        {/if}
                    </div>

                    <!-- Remove -->
                    <button
                        type="button"
                        class="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-slate-700 hover:text-slate-300 transition-colors"
                        onclick={() => removeFile(i)}
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
            {/each}
        </div>
    {/if}
</div>
