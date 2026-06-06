import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const tags = await prisma.tag.findMany({
		orderBy: { name: 'asc' },
		include: {
			_count: { select: { articles: { where: { article: { status: 'PUBLISHED' } } } } }
		}
	});

	return json(
		tags.map((t) => ({
			id: t.id,
			name: t.name,
			slug: t.slug,
			articleCount: t._count.articles
		}))
	);
};