import { PAGINATION } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch, parent }) => {
	const { user } = await parent();

	// Only SUPERADMIN and EDITOR can access AI queue
	if (user.role !== 'SUPERADMIN' && user.role !== 'EDITOR') {
		return { aiArticles: [], total: 0, page: 1, perPage: PAGINATION.DEFAULT_PER_PAGE, totalPages: 0, user };
	}

	const page = Number(url.searchParams.get('page')) || PAGINATION.DEFAULT_PAGE;
	const perPage = Number(url.searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE;

	const params = new URLSearchParams({
		page: String(page),
		perPage: String(perPage)
	});

	const res = await fetch(`/api/admin/ai/queue?${params}`);
	if (!res.ok) {
		return { aiArticles: [], total: 0, page, perPage, totalPages: 0, user };
	}

	const data = await res.json();
	return {
		aiArticles: data.data ?? [],
		total: data.total ?? 0,
		page: data.page ?? page,
		perPage: data.perPage ?? perPage,
		totalPages: data.totalPages ?? 0,
		user
	};
};