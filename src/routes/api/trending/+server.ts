import { json } from '@sveltejs/kit';
import { getTrendingArticles } from '$lib/server/analytics';
import type { RequestHandler } from './$types';
import type { ArticleResponse } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
	const days = Math.max(1, Number(url.searchParams.get('days')) || 7);
	const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 10));

	const articles = await getTrendingArticles(days, limit);

	return json(
		articles.map((a: any) => ({
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
			category: a.category ?? null,
			tags: a.tags.map((at: any) => at.tag)
		})) satisfies ArticleResponse[]
	);
};
