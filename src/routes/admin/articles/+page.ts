import { PAGINATION } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
	const page = Number(url.searchParams.get('page')) || PAGINATION.DEFAULT_PAGE;
	const perPage = Number(url.searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE;
	const status = url.searchParams.get('status') ?? '';
	const search = url.searchParams.get('search') ?? '';

	const params = new URLSearchParams({
		page: String(page),
		perPage: String(perPage)
	});
	if (status) params.set('status', status);
	if (search) params.set('search', search);

	const res = await fetch(`/api/admin/articles?${params}`);
	if (!res.ok) {
		return { articles: [], total: 0, page, perPage, totalPages: 0, status, search };
	}

	const data = await res.json();
	return {
		articles: data.data ?? [],
		total: data.total ?? 0,
		page: data.page ?? page,
		perPage: data.perPage ?? perPage,
		totalPages: data.totalPages ?? 0,
		status,
		search
	};
};