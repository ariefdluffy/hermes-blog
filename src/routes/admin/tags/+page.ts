import { PAGINATION } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
	const page = Number(url.searchParams.get('page')) || PAGINATION.DEFAULT_PAGE;
	const perPage = Number(url.searchParams.get('perPage')) || 50;
	const search = url.searchParams.get('search') ?? '';

	const params = new URLSearchParams({
		page: String(page),
		perPage: String(perPage)
	});
	if (search) params.set('search', search);

	const res = await fetch(`/api/admin/tags?${params}`);
	if (!res.ok) {
		return { tags: [], total: 0, page, perPage, totalPages: 0, search };
	}

	const data = await res.json();
	return {
		tags: data.data ?? [],
		total: data.total ?? 0,
		page: data.page ?? page,
		perPage: data.perPage ?? perPage,
		totalPages: data.totalPages ?? 0,
		search
	};
};