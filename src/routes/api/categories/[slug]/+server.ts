import { json } from '@sveltejs/kit';
import prisma from '$lib/server/db';
import type { RequestHandler } from './$types';
import { PAGINATION } from '$lib/constants';

export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const slug = params.slug;
		const page = Math.max(1, parseInt(url.searchParams.get('page') || String(PAGINATION.DEFAULT_PAGE)));
		const perPage = PAGINATION.DEFAULT_PER_PAGE;

		const category = await prisma.category.findUnique({
			where: { slug },
			select: { id: true, name: true, slug: true, description: true, icon: true }
		});

		if (!category) {
			return json({ error: 'Category not found' }, { status: 404 });
		}

		const [articles, total] = await Promise.all([
			prisma.article.findMany({
				where: {
					status: 'PUBLISHED',
					categoryId: category.id
				},
				include: {
					author: { select: { id: true, username: true } },
					tags: { include: { tag: { select: { id: true, name: true, slug: true } } } }
				},
				orderBy: { publishedAt: 'desc' },
				skip: (page - 1) * perPage,
				take: perPage
			}),
			prisma.article.count({
				where: {
					status: 'PUBLISHED',
					categoryId: category.id
				}
			})
		]);

		return json({
			category,
			articles: articles.map((a) => ({
				id: a.id,
				title: a.title,
				excerpt: a.excerpt,
				slug: a.slug,
				coverImage: a.coverImage,
				author: a.author,
				tags: a.tags.map((t) => t.tag),
				publishedAt: a.publishedAt?.toISOString() ?? a.createdAt.toISOString(),
				views: a.views
			})),
			total,
			page,
			totalPages: Math.ceil(total / perPage)
		});
	} catch (err) {
		console.error('Category API error:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
