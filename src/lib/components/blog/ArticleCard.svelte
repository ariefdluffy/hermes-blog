<script lang="ts">
  import type { ArticleResponse } from '$lib/types';
  import { formatRelativeTime, truncate } from '$lib/utils';

  interface Props {
    article: ArticleResponse;
    featured?: boolean;
  }

  let { article, featured = false }: Props = $props();

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-yellow-500/20 text-yellow-400',
    REVIEW: 'bg-blue-500/20 text-blue-400',
    PUBLISHED: 'bg-green-500/20 text-green-400',
    ARCHIVED: 'bg-gray-500/20 text-gray-400'
  };
</script>

{#if featured}
  <!-- Featured hero-style card -->
  <a
    href="/blog/{article.slug}"
    class="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10"
  >
    {#if article.coverImage}
      <div class="relative h-64 md:h-80 overflow-hidden">
        <img
          src={article.coverImage}
          alt={article.title}
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
      </div>
    {:else}
      <div class="h-48 md:h-64 bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div>
    {/if}

    <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
      <div class="flex items-center gap-3 mb-3">
        {#each article.tags.slice(0, 3) as tag}
          <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {tag.name}
          </span>
        {/each}
        {#if article.status !== 'PUBLISHED'}
          <span class="px-2 py-0.5 text-xs font-medium rounded-full {statusColors[article.status] ?? ''}">
            {article.status}
          </span>
        {/if}
      </div>

      <h2 class="text-xl md:text-3xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
        {article.title}
      </h2>

      <p class="text-gray-300 text-sm md:text-base line-clamp-2 mb-3">
        {truncate(article.excerpt, 180)}
      </p>

      <div class="flex items-center gap-4 text-xs text-gray-400">
        <span class="font-medium text-gray-300">{article.author.username}</span>
        <span>·</span>
        <span>{formatRelativeTime(article.publishedAt ?? article.createdAt)}</span>
        {#if article.readTime}
          <span>·</span>
          <span>{article.readTime} min read</span>
        {/if}
        <span>·</span>
        <span>{article.views} views</span>
      </div>
    </div>
  </a>
{:else}
  <!-- Regular card -->
  <a
    href="/blog/{article.slug}"
    class="group block overflow-hidden rounded-xl bg-gray-800/80 border border-gray-700/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-indigo-500/5"
  >
    {#if article.coverImage}
      <div class="relative h-48 overflow-hidden">
        <img
          src={article.coverImage}
          alt={article.title}
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    {:else}
      <div class="h-40 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 flex items-center justify-center">
        <svg class="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
        </svg>
      </div>
    {/if}

    <div class="p-4">
      <div class="flex flex-wrap items-center gap-2 mb-2">
        {#each article.tags.slice(0, 2) as tag}
          <span class="px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {tag.name}
          </span>
        {/each}
        {#if article.status !== 'PUBLISHED'}
          <span class="px-2 py-0.5 text-xs font-medium rounded-full {statusColors[article.status] ?? ''}">
            {article.status}
          </span>
        {/if}
      </div>

      <h3 class="text-lg font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors line-clamp-2">
        {article.title}
      </h3>

      <p class="text-sm text-gray-400 line-clamp-2 mb-3">
        {truncate(article.excerpt, 120)}
      </p>

      <div class="flex items-center gap-3 text-xs text-gray-500">
        <span class="font-medium text-gray-400">{article.author.username}</span>
        <span>·</span>
        <span>{formatRelativeTime(article.publishedAt ?? article.createdAt)}</span>
        {#if article.readTime}
          <span>·</span>
          <span>{article.readTime} min</span>
        {/if}
      </div>
    </div>
  </a>
{/if}