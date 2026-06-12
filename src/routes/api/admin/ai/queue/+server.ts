import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';
import { requireAuth } from '$lib/server/auth/utils';
import { canAction } from '$lib/server/auth/permissions';
import { PAGINATION } from '$lib/constants';

export const GET: RequestHandler = async ({ locals, url }) => {
	requireAuth(locals);
	if (!canAction(locals.user!.role, 'MANAGE_AI_QUEUE')) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const page = Math.max(1, Number(url.searchParams.get('page')) || PAGINATION.DEFAULT_PAGE);
	const perPage = Math.min(PAGINATION.MAX_PER_PAGE, Math.max(1, Number(url.searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE));

	const [articles, total] = await Promise.all([
		prisma.article.findMany({
			where: { status: 'DRAFT' },
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * perPage,
			take: perPage,
			include: {
				author: { select: { id: true, username: true } },
				category: { select: { id: true, name: true, slug: true } },
				tags: { include: { tag: { select: { id: true, name: true, slug: true } } } }
			}
		}),
		prisma.article.count({ where: { status: 'DRAFT' } })
	]);

	return json({
		data: articles.map((a) => ({
			id: a.id,
			slug: a.slug,
			title: a.title,
			excerpt: a.excerpt,
			coverImage: a.coverImage,
			readTime: a.readTime,
			status: a.status,
			author: a.author,
			category: a.category ?? null,
			tags: a.tags.map((at) => at.tag),
			createdAt: a.createdAt,
			updatedAt: a.updatedAt
		})),
		total,
		page,
		perPage,
		totalPages: Math.ceil(total / perPage)
	});
};
