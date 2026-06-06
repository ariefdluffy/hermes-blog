import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';
import { requireRole } from '$lib/server/auth/utils';
import { PAGINATION } from '$lib/constants';

export const GET: RequestHandler = async ({ locals, url }) => {
	requireRole(locals, ['SUPERADMIN']);

	const page = Math.max(1, Number(url.searchParams.get('page')) || PAGINATION.DEFAULT_PAGE);
	const perPage = Math.min(PAGINATION.MAX_PER_PAGE, Math.max(1, Number(url.searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE));
	const search = url.searchParams.get('search') ?? '';

	const where = search
		? {
				OR: [
					{ username: { contains: search } },
					{ email: { contains: search } }
				]
			}
		: {};

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			where,
			select: {
				id: true,
				username: true,
				email: true,
				role: true,
				emailVerified: true,
				createdAt: true,
				updatedAt: true,
				_count: { select: { articles: true } }
			},
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * perPage,
			take: perPage
		}),
		prisma.user.count({ where })
	]);

	return json({
		data: users.map((u) => ({
			id: u.id,
			username: u.username,
			email: u.email,
			role: u.role,
			emailVerified: u.emailVerified,
			articleCount: u._count.articles,
			createdAt: u.createdAt,
			updatedAt: u.updatedAt
		})),
		total,
		page,
		perPage,
		totalPages: Math.ceil(total / perPage)
	});
};