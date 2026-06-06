<script lang="ts">
	import type { ArticleFormData, ContentType, ArticleStatus } from '$lib/types';
	import { slugify } from '$lib/utils';
	import { CATEGORIES } from '$lib/constants';

	interface Tag {
		id: string;
		name: string;
		slug: string;
	}

	interface Props {
		article?: ArticleFormData | null;
		tags?: Tag[];
		onsubmit: (data: ArticleFormData) => void;
		loading?: boolean;
	}

	let { article = null, tags = [], onsubmit, loading = false }: Props = $props();

	let title = $state(article?.title ?? '');
	let excerpt = $state(article?.excerpt ?? '');
	let content = $state(article?.content ?? '');
	let contentType = $state<ContentType>(article?.contentType ?? 'MARKDOWN');
	let seoTitle = $state(article?.seoTitle ?? '');
	let seoDescription = $state(article?.seoDescription ?? '');
	let coverImage = $state(article?.coverImage ?? '');
	let selectedTags = $state<string[]>(article?.tags ?? []);
	let status = $state<ArticleStatus>(article?.status ?? 'DRAFT');
	let tagInput = $state('');
	let showPreview = $state(false);

	let slugPreview = $derived(slugify(title || 'untitled'));
	let excerptCount = $derived(excerpt.length);
	let seoDescCount = $derived(seoDescription.length);
	let excerptMax = 1000;
	let seoDescMax = 500;

	function addTag(name: string) {
		const trimmed = name.trim();
		if (trimmed && !selectedTags.includes(trimmed)) {
			selectedTags = [...selectedTags, trimmed];
		}
		tagInput = '';
	}

	function removeTag(name: string) {
		selectedTags = selectedTags.filter((t) => t !== name);
	}

	function handleTagKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addTag(tagInput);
		}
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		onsubmit({
			title,
			excerpt,
			content,
			contentType,
			seoTitle: seoTitle || undefined,
			seoDescription: seoDescription || undefined,
			coverImage: coverImage || undefined,
			tags: selectedTags,
			status
		});
	}
</script>

<form onsubmit={handleSubmit} class="space-y-6">
	<!-- Title -->
	<div>
		<label for="title" class="mb-1.5 block text-sm font-medium text-slate-300">Title</label>
		<input
			id="title"
			type="text"
			bind:value={title}
			required
			placeholder="Article title"
			class="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
		/>
		<p class="mt-1 text-xs text-slate-500">Slug: <span class="text-slate-400">{slugPreview}</span></p>
	</div>

	<!-- Excerpt -->
	<div>
		<div class="mb-1.5 flex items-center justify-between">
			<label for="excerpt" class="text-sm font-medium text-slate-300">Excerpt</label>
			<span class="text-xs {excerptCount > excerptMax ? 'text-red-400' : 'text-slate-500'}">{excerptCount}/{excerptMax}</span>
		</div>
		<textarea
			id="excerpt"
			bind:value={excerpt}
			required
			rows="3"
			maxlength={excerptMax}
			placeholder="Brief description of the article"
			class="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
		></textarea>
	</div>

	<!-- Content + ContentType toggle -->
	<div>
		<div class="mb-1.5 flex items-center justify-between">
			<label for="content" class="text-sm font-medium text-slate-300">Content</label>
			<div class="flex items-center gap-3">
				<div class="flex rounded-lg border border-slate-600 overflow-hidden">
					<button
						type="button"
						class="px-3 py-1 text-xs font-medium transition-colors {contentType === 'MARKDOWN' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}"
						onclick={() => (contentType = 'MARKDOWN')}
					>
						Markdown
					</button>
					<button
						type="button"
						class="px-3 py-1 text-xs font-medium transition-colors {contentType === 'HTML' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}"
						onclick={() => (contentType = 'HTML')}
					>
						HTML
					</button>
				</div>
				<button
					type="button"
					class="text-xs text-blue-400 hover:text-blue-300 transition-colors"
					onclick={() => (showPreview = !showPreview)}
				>
					{showPreview ? 'Edit' : 'Preview'}
				</button>
			</div>
		</div>
		{#if showPreview}
			<div class="prose prose-invert max-w-none min-h-[300px] rounded-lg border border-slate-600 bg-slate-900 p-4 text-slate-300">
				{#if contentType === 'MARKDOWN'}
					{@html content}
				{:else}
					{@html content}
				{/if}
			</div>
		{:else}
			<textarea
				id="content"
				bind:value={content}
				required
				rows="16"
				placeholder={contentType === 'MARKDOWN' ? 'Write your article in Markdown...' : 'Write your article in HTML...'}
				class="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 font-mono text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
			></textarea>
		{/if}
	</div>

	<!-- SEO Section -->
	<div class="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 space-y-4">
		<h3 class="text-sm font-semibold text-slate-300">SEO Settings</h3>

		<div>
			<label for="seoTitle" class="mb-1 block text-xs font-medium text-slate-400">SEO Title</label>
			<input
				id="seoTitle"
				type="text"
				bind:value={seoTitle}
				placeholder="Override title for search engines"
				class="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			/>
		</div>

		<div>
			<div class="mb-1 flex items-center justify-between">
				<label for="seoDescription" class="text-xs font-medium text-slate-400">SEO Description</label>
				<span class="text-xs {seoDescCount > seoDescMax ? 'text-red-400' : 'text-slate-600'}">{seoDescCount}/{seoDescMax}</span>
			</div>
			<textarea
				id="seoDescription"
				bind:value={seoDescription}
				rows="2"
				maxlength={seoDescMax}
				placeholder="Meta description for search engines"
				class="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
			></textarea>
		</div>

		<div>
			<label for="coverImage" class="mb-1 block text-xs font-medium text-slate-400">Cover Image URL</label>
			<input
				id="coverImage"
				type="url"
				bind:value={coverImage}
				placeholder="https://example.com/image.jpg"
				class="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			/>
		</div>
	</div>

	<!-- Tags -->
	<div>
		<label for="tagInput" class="mb-1.5 block text-sm font-medium text-slate-300">Tags</label>
		<div class="flex gap-2">
			<input
				id="tagInput"
				type="text"
				bind:value={tagInput}
				onkeydown={handleTagKeydown}
				placeholder="Type a tag and press Enter"
				class="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			/>
			<button
				type="button"
				class="rounded-lg bg-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-600 transition-colors"
				onclick={() => addTag(tagInput)}
			>
				Add
			</button>
		</div>

		{#if tags.length > 0}
			<div class="mt-2 flex flex-wrap gap-1.5">
				{#each tags as tag}
					{@const isSelected = selectedTags.includes(tag.name)}
					<button
						type="button"
						class="rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors {isSelected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}"
						onclick={() => isSelected ? removeTag(tag.name) : addTag(tag.name)}
					>
						{tag.name}
					</button>
				{/each}
			</div>
		{/if}

		{#if selectedTags.length > 0}
			<div class="mt-3 flex flex-wrap gap-1.5">
				{#each selectedTags as tagName}
					<span class="inline-flex items-center gap-1 rounded-full bg-blue-600/20 px-2.5 py-0.5 text-xs font-medium text-blue-300">
						{tagName}
						<button type="button" class="hover:text-white" onclick={() => removeTag(tagName)}>&times;</button>
					</span>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Status -->
	<div>
		<label for="status" class="mb-1.5 block text-sm font-medium text-slate-300">Status</label>
		<select
			id="status"
			bind:value={status}
			class="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
		>
			<option value="DRAFT">Draft</option>
			<option value="REVIEW">Review</option>
			<option value="PUBLISHED">Published</option>
		</select>
	</div>

	<!-- Submit -->
	<div class="flex items-center gap-3 pt-2">
		<button
			type="submit"
			disabled={loading}
			class="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
		>
			{#if loading}
				<svg class="mr-2 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
				</svg>
				Saving...
			{:else}
				{article ? 'Update Article' : 'Create Article'}
			{/if}
		</button>

		<button
			type="button"
			class="rounded-lg border border-slate-600 px-6 py-2.5 font-medium text-slate-300 hover:bg-slate-700 transition-colors"
			onclick={() => (status = 'DRAFT')}
		>
			Save as Draft
		</button>
	</div>
</form>