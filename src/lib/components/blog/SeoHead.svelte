<script lang="ts">
  import { APP_NAME } from '$lib/constants';

  interface Props {
    title: string;
    description: string;
    image?: string;
    url: string;
    type?: 'website' | 'article';
    publishedTime?: string;
    author?: string;
    tags?: string[];
  }

  let {
    title,
    description,
    image,
    url,
    type = 'website',
    publishedTime,
    author,
    tags = []
  }: Props = $props();

  let fullTitle = $derived(`${title} | ${APP_NAME}`);
  let keywords = $derived(tags.join(', '));
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {#if keywords}
    <meta name="keywords" content={keywords} />
  {/if}
  <link rel="canonical" href={url} />

  <!-- OpenGraph -->
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:type" content={type} />
  <meta property="og:site_name" content={APP_NAME} />
  {#if image}
    <meta property="og:image" content={image} />
  {/if}
  {#if publishedTime}
    <meta property="article:published_time" content={publishedTime} />
  {/if}
  {#if author}
    <meta property="article:author" content={author} />
  {/if}
  {#each tags as tag}
    <meta property="article:tag" content={tag} />
  {/each}

  <!-- Twitter Card -->
  <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  {#if image}
    <meta name="twitter:image" content={image} />
  {/if}
</svelte:head>