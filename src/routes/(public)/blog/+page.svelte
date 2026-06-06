<script lang="ts">
    import Pagination from "$lib/components/ui/Pagination.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import { goto } from "$app/navigation";

    interface PageData {
        articles: any[];
        totalArticles: number;
        page: number;
        totalPages: number;
        selectedTag: string | null;
        tags: {
            id: string;
            name: string;
            slug: string;
            articleCount: number;
        }[];
    }

    let props: { data: PageData } = $props();

    let searchQuery = $state("");

    function handleSearch(e: Event) {
        const input = e.target as HTMLInputElement;
        searchQuery = input.value;
    }

    function submitSearch() {
        if (searchQuery.trim()) {
            goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") submitSearch();
    }

    function handleTagClick(slug: string) {
        goto(`/blog?tag=${encodeURIComponent(slug)}`);
    }

    function handleClearTag() {
        goto("/blog");
    }

    function handlePageChange(page: number) {
        const tag = props.data.selectedTag;
        goto(
            `/blog?page=${page}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`,
        );
    }
</script>

<div class="mx-auto max-w-3xl px-5 py-8">
    <!-- Header -->
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-[var(--text)] mb-1">Artikel</h1>
        <p class="text-sm text-[var(--text-muted)]">
            Semua artikel di Hermes Blog
        </p>
    </div>

    <!-- Search -->
    <div class="mb-6">
        <div
            class="flex items-center gap-2 rounded-lg border border-[var(--dark-border)] bg-[var(--dark-bg-alt)] px-4 py-2.5 focus-within:border-[var(--primary)]/50 transition-colors"
        >
            <svg
                class="w-4 h-4 text-[var(--text-muted)] flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><circle cx="11" cy="11" r="8" /><path
                    d="m21 21-4.3-4.3"
                /></svg
            >
            <input
                type="text"
                bind:value={searchQuery}
                onkeydown={handleKeydown}
                placeholder="Cari artikel..."
                class="flex-1 bg-transparent text-sm text-[var(--text)] placeholder-[var(--text-muted)] outline-none"
            />
            {#if searchQuery}
                <button
                    type="button"
                    onclick={submitSearch}
                    class="text-xs text-[var(--primary)] hover:underline"
                    >Cari</button
                >
            {/if}
        </div>
    </div>

    <!-- Tag filters -->
    {#if props.data.tags.length > 0}
        <div class="mb-6 flex flex-wrap items-center gap-2">
            <span class="text-xs text-[var(--text-muted)]">Filter:</span>
            <button
                class="px-3 py-1 text-xs rounded-full transition-all border
					{!props.data.selectedTag
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30'
                    : 'text-[var(--text-muted)] border-[var(--dark-border)] hover:border-[var(--dark-border)]/50'}"
                onclick={handleClearTag}
            >
                Semua
            </button>
            {#each props.data.tags as tag (tag.id)}
                <button
                    class="px-3 py-1 text-xs rounded-full transition-all border
						{props.data.selectedTag === tag.slug
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30'
                        : 'text-[var(--text-muted)] border-[var(--dark-border)] hover:border-[var(--dark-border)]/50'}"
                    onclick={() => handleTagClick(tag.slug)}
                >
                    {tag.name}
                    <span class="ml-1 opacity-60">({tag.articleCount})</span>
                </button>
            {/each}
        </div>
    {/if}

    <!-- Articles List -->
    {#if props.data.articles.length > 0}
        <div class="space-y-2">
            {#each props.data.articles as article (article.id)}
                <a
                    href="/blog/{article.slug}"
                    class="group flex items-center justify-between rounded-lg border border-[var(--dark-border)] border-l-2 border-l-[var(--primary)] p-3 hover:border-[var(--primary)]/40 hover:bg-[var(--dark-bg-alt)] transition-all"
                >
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 mb-0.5">
                            {#if article.tags.length > 0}
                                <span
                                    class="text-xs px-2 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)]"
                                    >{article.tags[0].name}</span
                                >
                            {/if}
                        </div>
                        <h3
                            class="text-sm font-medium text-[var(--text)] group-hover:text-[var(--primary)] transition-colors truncate"
                        >
                            {article.title}
                        </h3>
                        <p
                            class="text-xs text-[var(--text-muted)] mt-1 line-clamp-1"
                        >
                            {article.excerpt}
                        </p>
                    </div>
                    <div class="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span class="text-xs text-[var(--text-muted)]"
                            >{new Date(
                                article.publishedAt ?? article.createdAt,
                            ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}</span
                        >
                        <svg
                            class="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors"
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path d="m9 18 6-6-6-6" /></svg
                        >
                    </div>
                </a>
            {/each}
        </div>

        <!-- Pagination -->
        {#if props.data.totalPages > 1}
            <div class="mt-8">
                <Pagination
                    page={props.data.page}
                    totalItems={props.data.totalArticles}
                    perPage={12}
                    onchange={handlePageChange}
                />
            </div>
        {/if}
    {:else}
        <div class="py-20 text-center">
            <svg
                class="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4 opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><path
                    d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"
                /></svg
            >
            <p class="text-sm text-[var(--text-muted)]">
                {#if props.data.selectedTag}
                    Tidak ada artikel dengan tag ini. Coba filter lain.
                {:else}
                    Belum ada artikel. Segera hadir!
                {/if}
            </p>
            {#if props.data.selectedTag}
                <button
                    onclick={handleClearTag}
                    class="mt-4 px-4 py-2 text-xs rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary)]/80 transition-colors"
                    >Hapus filter</button
                >
            {/if}
        </div>
    {/if}
</div>
