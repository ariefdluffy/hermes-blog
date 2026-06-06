import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
	const page = Number(url.searchParams.get('page')) || 1;
	const tag = url.searchParams.get('tag') ?? undefined;

	const params = new URLSearchParams();
	params.set('page', String(page));
	params.set('perPage', '12');
	if (tag) params.set('tag', tag);

	const [articlesRes, tagsRes] = await Promise.all([
		fetch(`/api/articles?${params.toString()}`),
		fetch('/api/tags')
	]);

	const articlesData = articlesRes.ok
		? await articlesRes.json()
		: { data: [], total: 0, page: 1, perPage: 12, totalPages: 0 };

	const tags = tagsRes.ok ? await tagsRes.json() : [];

	return {
		articles: articlesData.data ?? [],
		totalArticles: articlesData.total ?? 0,
		page: articlesData.page ?? 1,
		totalPages: articlesData.totalPages ?? 0,
		selectedTag: tag ?? null,
		tags
	};
};