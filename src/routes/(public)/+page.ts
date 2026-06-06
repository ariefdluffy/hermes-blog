import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
		fetch('/api/articles?perPage=8'),
		fetch('/api/categories'),
		fetch('/api/tags')
	]);

	const articlesData = articlesRes.ok ? await articlesRes.json() : { data: [] };
	const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { data: [] };
	const tagsData = tagsRes.ok ? await tagsRes.json() : [];

	return {
		featured: articlesData.data?.[0] ?? null,
		articles: articlesData.data ?? [],
		totalArticles: articlesData.total ?? articlesData.data?.length ?? 0,
		page: 1,
		totalPages: 1,
		categories: categoriesData.data ?? [],
		tags: Array.isArray(tagsData) ? tagsData : (tagsData.data ?? [])
	};
};
