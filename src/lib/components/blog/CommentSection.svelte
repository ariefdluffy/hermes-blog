<script lang="ts">
  interface Props {
    articleSlug: string;
  }

  let { articleSlug }: Props = $props();
</script>

<div class="mt-12 pt-8 border-t border-gray-700/50">
  <div class="flex items-center gap-3 mb-6">
    <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
    <h3 class="text-lg font-semibold text-white">Comments</h3>
  </div>

  <div class="rounded-xl bg-gray-800/50 border border-gray-700/50 p-8 text-center">
    <svg class="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
    <p class="text-gray-400 text-lg font-medium mb-2">Comments coming soon</p>
    <p class="text-gray-500 text-sm">We're working on bringing you an interactive discussion section. Stay tuned!</p>
  </div>
</div>