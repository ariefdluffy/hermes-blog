import type { PageLoad } from './$types';
import { PAGINATION } from '$lib/constants';

export const load: PageLoad = async ({ url, fetch }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const page = Number(url.searchParams.get('page')) || PAGINATION.DEFAULT_PAGE;

	if (!q) {
		return { query: '', articles: [], totalArticles: 0, page: 1, totalPages: 0 };
	}

	const params = new URLSearchParams({ q, page: String(page), perPage: '10' });
	const res = await fetch(`/api/search?${params.toString()}`);

	const data = res.ok
		? await res.json()
		: { data: [], total: 0, page: 1, perPage: 12, totalPages: 0 };

	return {
		query: q,
		articles: data.data ?? [],
		totalArticles: data.total ?? 0,
		page: data.page ?? 1,
		totalPages: data.totalPages ?? 0
	};
};