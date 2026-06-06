<script lang="ts">
  import type { ArticleResponse } from '$lib/types';
  import ArticleCard from './ArticleCard.svelte';

  interface Props {
    articles: ArticleResponse[];
    columns?: 2 | 3;
  }

  let { articles, columns = 3 }: Props = $props();
</script>

{#if articles.length === 0}
  <div class="text-center py-16">
    <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
    </svg>
    <p class="text-gray-500 text-lg">No articles found</p>
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 {columns === 3 ? 'lg:grid-cols-3' : ''} gap-6">
    {#each articles as article (article.id)}
      <ArticleCard {article} />
    {/each}
  </div>
{/if}