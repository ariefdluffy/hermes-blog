import { PAGINATION } from '$lib/constants';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url, fetch }) => {
	const { user } = await parent();

	// SUPERADMIN only
	if (user.role !== 'SUPERADMIN') {
		throw redirect(302, '/admin?error=forbidden');
	}

	const page = Number(url.searchParams.get('page')) || PAGINATION.DEFAULT_PAGE;
	const perPage = Number(url.searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE;
	const search = url.searchParams.get('search') ?? '';

	const params = new URLSearchParams({
		page: String(page),
		perPage: String(perPage)
	});
	if (search) params.set('search', search);

	const res = await fetch(`/api/admin/users?${params}`);
	if (!res.ok) {
		return { users: [], total: 0, page, perPage, totalPages: 0, search };
	}

	const data = await res.json();
	return {
		users: data.data ?? [],
		total: data.total ?? 0,
		page: data.page ?? page,
		perPage: data.perPage ?? perPage,
		totalPages: data.totalPages ?? 0,
		search
	};
};