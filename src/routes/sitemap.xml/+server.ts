import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

const BASE_URL = process.env.BASE_URL || 'https://lockbit.my.id';

export const GET: RequestHandler = async () => {
	const articles = await prisma.article.findMany({
		where: { status: 'PUBLISHED' },
		select: { slug: true, updatedAt: true },
		orderBy: { publishedAt: 'desc' }
	});

	const tags = await prisma.tag.findMany({
		select: { slug: true }
	});

	const urls = [
		`<url><loc>${BASE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
		`<url><loc>${BASE_URL}/blog</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`,
		`<url><loc>${BASE_URL}/search</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>`,
		`<url><loc>${BASE_URL}/category/ai</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`,
		`<url><loc>${BASE_URL}/category/technology</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`,
		`<url><loc>${BASE_URL}/category/us-stocks</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`,
		`<url><loc>${BASE_URL}/category/id-stocks</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`,
		...articles.map(
			(a) => `<url><loc>${BASE_URL}/blog/${a.slug}</loc><lastmod>${a.updatedAt.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
		),
		...tags.map(
			(t) => `<url><loc>${BASE_URL}/tags/${t.slug}</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>`
		)
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
