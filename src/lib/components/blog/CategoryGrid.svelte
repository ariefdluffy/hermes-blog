<script lang="ts">
  import { CATEGORIES } from '$lib/constants';

  interface CategoryItem {
    slug: string;
    name: string;
    count: number;
  }

  interface Props {
    categories: CategoryItem[];
  }

  let { categories }: Props = $props();

  const categoryIcons: Record<string, string> = {
    AI: '🤖',
    US_STOCKS: '📊',
    ID_STOCKS: '📈',
    TECHNOLOGY: '💻'
  };

  const categoryColors: Record<string, string> = {
    AI: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 hover:border-violet-500/50',
    US_STOCKS: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 hover:border-emerald-500/50',
    ID_STOCKS: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 hover:border-amber-500/50',
    TECHNOLOGY: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 hover:border-cyan-500/50'
  };
</script>

<section class="py-8">
  <h2 class="text-2xl font-bold text-white mb-6">Explore Categories</h2>

  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    {#each categories as cat (cat.slug)}
      <a
        href="/category/{cat.slug}"
        class="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl
          bg-gradient-to-br {categoryColors[cat.slug] ?? 'from-gray-500/20 to-gray-600/20 border-gray-500/30 hover:border-gray-500/50'}
          border transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
      >
        <span class="text-3xl">{categoryIcons[cat.slug] ?? '📰'}</span>
        <span class="text-sm md:text-base font-semibold text-white text-center leading-tight">
          {cat.name}
        </span>
        <span class="text-xs text-gray-400">
          {cat.count} {cat.count === 1 ? 'article' : 'articles'}
        </span>
      </a>
    {/each}
  </div>
</section>