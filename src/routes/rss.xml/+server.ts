import type { RequestHandler } from './$types';
import prisma from '$lib/server/db';
import { APP_NAME, APP_DESCRIPTION } from '$lib/constants';

const BASE_URL = process.env.BASE_URL || 'https://lockbit.my.id';

export const GET: RequestHandler = async () => {
	const articles = await prisma.article.findMany({
		where: { status: 'PUBLISHED' },
		orderBy: { publishedAt: 'desc' },
		take: 50,
		include: {
			author: { select: { username: true } },
			tags: { include: { tag: { select: { name: true } } } }
		}
	});

	const items = articles.map((a) => {
		const link = `${BASE_URL}/blog/${a.slug}`;
		const pubDate = new Date(a.publishedAt ?? a.createdAt).toUTCString();
		const categories = a.tags
			.map((t) => `\t\t<category>${escapeXml(t.tag.name)}</category>`)
			.join('\n');

		return `\t<item>
\t\t<title>${escapeXml(a.title)}</title>
\t\t<link>${escapeXml(link)}</link>
\t\t<guid isPermaLink="true">${escapeXml(link)}</guid>
\t\t<description>${escapeXml(a.excerpt)}</description>
\t\t<author>${escapeXml(a.author.username)}</author>
\t\t<pubDate>${pubDate}</pubDate>
${categories}
\t</item>`;
	}).join('\n');

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
\t<title>${escapeXml(APP_NAME)}</title>
\t<link>${escapeXml(BASE_URL)}</link>
\t<description>${escapeXml(APP_DESCRIPTION)}</description>
\t<language>en</language>
\t<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
\t<atom:link href="${escapeXml(BASE_URL)}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`;

	return new Response(rss, {
		headers: {
			'Content-Type': 'application/rss+xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
