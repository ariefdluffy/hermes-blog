import type { PageLoad } from './$types';
import { PAGINATION } from '$lib/constants';

export const load: PageLoad = async ({ url, fetch }) => {
	const page = Number(url.searchParams.get('page')) || PAGINATION.DEFAULT_PAGE;
	const perPage = 10;
	const res = await fetch(`/api/articles?category=tutorial&perPage=${perPage}&page=${page}`);
	const data = res.ok ? await res.json() : { data: [], total: 0 };
	return {
		articles: data.data ?? [],
		totalArticles: data.total ?? 0,
		page,
		totalPages: Math.ceil((data.total ?? 0) / perPage)
	};
};
