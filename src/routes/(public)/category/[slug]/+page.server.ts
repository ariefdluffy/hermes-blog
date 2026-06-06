import type { PageServerLoad } from './$types';
import prisma from '$lib/server/db';
import { PAGINATION } from '$lib/constants';

export const load: PageServerLoad = async ({ params, url }) => {
	const slug = params.slug;

	const page = Math.max(1, parseInt(url.searchParams.get('page') || String(PAGINATION.DEFAULT_PAGE)));
	const perPage = PAGINATION.DEFAULT_PER_PAGE;

	const [articles, total] = await Promise.all([
		prisma.article.findMany({
			where: {
				status: 'PUBLISHED',
				tags: {
					some: {
						tag: {
							slug
						}
					}
				}
			},
			include: {
				author: {
					select: { id: true, username: true }
				},
				tags: {
					include: { tag: { select: { id: true, name: true, slug: true } } }
				}
			},
			orderBy: { publishedAt: 'desc' },
			skip: (page - 1) * perPage,
			take: perPage
		}),
		prisma.article.count({
			where: {
				status: 'PUBLISHED',
				tags: {
					some: {
						tag: { slug }
					}
				}
			}
		})
	]);

	const tag = await prisma.tag.findUnique({
		where: { slug },
		select: { id: true, name: true, slug: true }
	});

	if (!tag) {
		return {
			slug,
			tag: null,
			articles: [],
			totalArticles: 0,
			page: 1,
			totalPages: 0
		};
	}

	const serializedArticles = articles.map((a) => ({
		id: a.id,
		title: a.title,
		excerpt: a.excerpt,
		slug: a.slug,
		coverImage: a.coverImage,
		author: a.author,
		tags: a.tags.map((t) => t.tag),
		publishedAt: a.publishedAt?.toISOString() ?? a.createdAt.toISOString(),
		views: a.views
	}));

	return {
		slug,
		tag,
		articles: serializedArticles,
		totalArticles: total,
		page,
		totalPages: Math.ceil(total / perPage)
	};
};
