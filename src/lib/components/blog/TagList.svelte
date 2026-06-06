<script lang="ts">
  interface Props {
    tags: { id: string; name: string; slug: string }[];
    clickable?: boolean;
  }

  let { tags, clickable = true }: Props = $props();
</script>

{#if tags.length === 0}
  <span class="text-sm text-gray-500 italic">No tags</span>
{:else}
  <div class="flex flex-wrap gap-2">
    {#each tags as tag (tag.id)}
      {#if clickable}
        <a
          href="/tags/{tag.slug}"
          class="inline-block px-3 py-1 text-xs font-medium rounded-full
            bg-indigo-500/15 text-indigo-300 border border-indigo-500/25
            transition-all duration-200
            hover:bg-indigo-500/25 hover:border-indigo-500/40 hover:text-indigo-200"
        >
          {tag.name}
        </a>
      {:else}
        <span
          class="inline-block px-3 py-1 text-xs font-medium rounded-full
            bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
        >
          {tag.name}
        </span>
      {/if}
    {/each}
  </div>
{/if}