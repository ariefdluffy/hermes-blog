<script lang="ts">
    import SeoHead from "$lib/components/blog/SeoHead.svelte";
    import ArticleContent from "$lib/components/blog/ArticleContent.svelte";
    import TagList from "$lib/components/blog/TagList.svelte";
    import ShareButtons from "$lib/components/blog/ShareButtons.svelte";
    import CommentSection from "$lib/components/blog/CommentSection.svelte";
    import { formatDate, formatRelativeTime } from "$lib/utils";
    import { APP_NAME } from "$lib/constants";
    import type { ArticleResponse } from "$lib/types";

    interface PageData {
        article: ArticleResponse | null;
    }

    let props: { data: PageData } = $props();

    let article = $derived(props.data.article);

    const siteUrl = $derived(
        import.meta.env.PUBLIC_SITE_URL ?? "https://lockbit.my.id",
    );
</script>

{#if article}
    <SeoHead
        title={article.seoTitle ?? article.title}
        description={article.seoDescription ?? article.excerpt}
        image={article.coverImage ?? undefined}
        url="/blog/{article.slug}"
        type="article"
        publishedTime={article.publishedAt ?? undefined}
        author={article.author.username}
        tags={article.tags.map((t) => t.name)}
    />

    <article class="mx-auto max-w-3xl px-5 py-8">
        <!-- Cover Image -->
        {#if article.coverImage}
            <div class="mb-8 overflow-hidden rounded-xl">
                <img
                    src={article.coverImage}
                    alt={article.title}
                    class="w-full h-64 md:h-80 object-cover"
                />
            </div>
        {/if}

        <!-- Article Header -->
        <header class="mb-8">
            <!-- Tags -->
            {#if article.tags.length > 0}
                <div class="mb-4">
                    <TagList tags={article.tags} />
                </div>
            {/if}

            <!-- Title -->
            <h1
                class="text-2xl md:text-3xl font-extrabold text-slate-100 leading-tight mb-4"
            >
                {article.title}
            </h1>

            <!-- Excerpt -->
            <p class="text-base text-slate-400 mb-6 leading-relaxed">
                {article.excerpt}
            </p>

            <!-- Author & Meta -->
            <div
                class="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-6"
            >
                <div class="flex items-center gap-2">
                    <div
                        class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs"
                    >
                        {article.author.username.charAt(0).toUpperCase()}
                    </div>
                    <span class="font-medium text-slate-300"
                        >{article.author.username}</span
                    >
                </div>
                <span>·</span>
                <time datetime={article.publishedAt ?? article.createdAt}>
                    {formatDate(article.publishedAt ?? article.createdAt)}
                </time>
                {#if article.readTime}
                    <span>·</span>
                    <span>{article.readTime} min baca</span>
                {/if}
                <span>·</span>
                <span>{article.views} views</span>
            </div>

            <!-- Share -->
            <ShareButtons
                title={article.title}
                url="{siteUrl}/blog/{article.slug}"
                excerpt={article.excerpt}
            />

            <hr class="border-slate-800 mt-6" />
        </header>

        <!-- Article Body -->
        <div class="mb-12">
            <ArticleContent
                content={article.content}
                contentType={article.contentType}
            />
        </div>

        <!-- Footer Tags -->
        {#if article.tags.length > 0}
            <div class="mb-8">
                <h3
                    class="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3"
                >
                    Tags
                </h3>
                <TagList tags={article.tags} />
            </div>
        {/if}

        <!-- Comments -->
        <CommentSection articleSlug={article.slug} />
    </article>
{:else}
    <SeoHead
        title="Article Not Found"
        description="The requested article could not be found."
        url="/blog/404"
    />

    <div class="mx-auto max-w-3xl px-5 py-24 text-center">
        <svg
            class="w-16 h-16 mx-auto text-slate-600 mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
        <h1 class="text-2xl font-bold text-slate-200 mb-4">
            Artikel Tidak Ditemukan
        </h1>
        <p class="text-slate-500 mb-8">
            Artikel yang Anda cari tidak ada atau telah dihapus.
        </p>
        <a
            href="/blog"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-indigo-500 text-white hover:bg-indigo-400 transition-colors text-sm"
        >
            <svg
                class="w-4 h-4"
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
            Kembali ke Blog
        </a>
    </div>
{/if}
