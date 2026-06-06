import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { PAGINATION } from '$lib/constants';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
	const slug = params.slug;
	const page = Math.max(1, Number(url.searchParams.get('page')) || PAGINATION.DEFAULT_PAGE);
	const perPage = Math.min(
		PAGINATION.MAX_PER_PAGE,
		Math.max(1, Number(url.searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE)
	);

	const tag = await prisma.tag.findUnique({
		where: { slug },
		select: { id: true, name: true, slug: true }
	});

	if (!tag) {
		return json({ error: 'Tag not found' }, { status: 404 });
	}

	const [articles, total] = await Promise.all([
		prisma.article.findMany({
			where: {
				status: 'PUBLISHED',
				tags: { some: { tag: { slug } } }
			},
			select: {
				id: true,
				slug: true,
				title: true,
				excerpt: true,
				content: true,
				contentType: true,
				seoTitle: true,
				seoDescription: true,
				coverImage: true,
				views: true,
				readTime: true,
				status: true,
				publishedAt: true,
				createdAt: true,
				updatedAt: true,
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
				tags: { some: { tag: { slug } } }
			}
		})
	]);

	return json({
		tag,
		articles: articles.map((a) => ({
			id: a.id,
			slug: a.slug,
			title: a.title,
			excerpt: a.excerpt,
			content: a.content,
			contentType: a.contentType,
			seoTitle: a.seoTitle,
			seoDescription: a.seoDescription,
			coverImage: a.coverImage,
			views: a.views,
			readTime: a.readTime,
			status: a.status,
			publishedAt: a.publishedAt?.toISOString() ?? null,
			createdAt: a.createdAt.toISOString(),
			updatedAt: a.updatedAt.toISOString(),
			author: a.author,
			tags: a.tags.map((at: any) => at.tag)
		})),
		total,
		page,
		perPage,
		totalPages: Math.ceil(total / perPage)
	});
};
