<script lang="ts">
  import type { ArticleResponse } from '$lib/types';
  import { formatRelativeTime, truncate } from '$lib/utils';
  import { APP_NAME } from '$lib/constants';

  interface Props {
    article: ArticleResponse | null;
  }

  let { article }: Props = $props();
</script>

{#if article}
  <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-gray-900 border border-indigo-500/20">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>

    <div class="relative px-6 py-12 md:px-12 md:py-20 lg:px-20">
      <div class="max-w-3xl">
        <!-- Category badge -->
        {#if article.tags.length > 0}
          <div class="flex flex-wrap gap-2 mb-4">
            {#each article.tags.slice(0, 3) as tag (tag.id)}
              <a
                href="/tags/{tag.slug}"
                class="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full
                  bg-indigo-500/20 text-indigo-300 border border-indigo-500/30
                  hover:bg-indigo-500/30 transition-colors"
              >
                {tag.name}
              </a>
            {/each}
          </div>
        {/if}

        <!-- Title -->
        <h1 class="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          <a href="/blog/{article.slug}" class="hover:text-indigo-300 transition-colors">
            {article.title}
          </a>
        </h1>

        <!-- Excerpt -->
        <p class="text-base md:text-lg text-gray-300 mb-6 leading-relaxed">
          {truncate(article.excerpt, 200)}
        </p>

        <!-- Meta row -->
        <div class="flex items-center gap-4 text-sm text-gray-400 mb-8">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
              {article.author.username.charAt(0).toUpperCase()}
            </div>
            <span class="font-medium text-gray-300">{article.author.username}</span>
          </div>
          <span>·</span>
          <span>{formatRelativeTime(article.publishedAt ?? article.createdAt)}</span>
          {#if article.readTime}
            <span>·</span>
            <span>{article.readTime} min read</span>
          {/if}
        </div>

        <!-- CTA -->
        <a
          href="/blog/{article.slug}"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold
            bg-indigo-500 text-white shadow-lg shadow-indigo-500/25
            hover:bg-indigo-400 hover:shadow-indigo-500/40 transition-all duration-200"
        >
          Read More
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </div>
  </section>
{:else}
  <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 px-6 py-16 md:px-12 md:py-24 text-center">
    <div class="max-w-xl mx-auto">
      <svg class="w-16 h-16 mx-auto text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
      </svg>
      <h2 class="text-2xl md:text-3xl font-bold text-white mb-3">Welcome to {APP_NAME}</h2>
      <p class="text-gray-400">Featured articles will appear here.</p>
    </div>
  </section>
{/if}