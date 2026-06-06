import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import { PAGINATION } from '$lib/constants';
import type { RequestHandler } from './$types';
import type { ArticleResponse, PaginatedResponse } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();

	if (!q) {
		return json({ error: 'Search query is required' }, { status: 400 });
	}

	const page = Math.max(1, Number(url.searchParams.get('page')) || PAGINATION.DEFAULT_PAGE);
	const perPage = Math.min(
		PAGINATION.MAX_PER_PAGE,
		Math.max(1, Number(url.searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE)
	);

	const where = {
		status: 'PUBLISHED' as const,
		OR: [
			{ title: { contains: q } },
			{ excerpt: { contains: q } },
			{ content: { contains: q } }
		]
	};

	const [articles, total] = await Promise.all([
		prisma.article.findMany({
			where,
			orderBy: { publishedAt: 'desc' },
			skip: (page - 1) * perPage,
			take: perPage,
			include: {
				author: { select: { id: true, username: true } },
				tags: { include: { tag: { select: { id: true, name: true, slug: true } } } }
			}
		}),
		prisma.article.count({ where })
	]);

	return json({
		data: articles.map(mapArticle),
		total,
		page,
		perPage,
		totalPages: Math.ceil(total / perPage)
	} satisfies PaginatedResponse<ArticleResponse>);
};

function mapArticle(a: any): ArticleResponse {
	return {
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
	};
}