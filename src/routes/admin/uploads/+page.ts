import { PAGINATION } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
	const page = Number(url.searchParams.get('page')) || PAGINATION.DEFAULT_PAGE;
	const perPage = Number(url.searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE;

	const params = new URLSearchParams({
		page: String(page),
		perPage: String(perPage)
	});

	const res = await fetch(`/api/admin/uploads?${params}`);
	if (!res.ok) {
		return { uploads: [], total: 0, page, perPage, totalPages: 0 };
	}

	const data = await res.json();
	return {
		uploads: data.data ?? [],
		total: data.total ?? 0,
		page: data.page ?? page,
		perPage: data.perPage ?? perPage,
		totalPages: data.totalPages ?? 0
	};
};