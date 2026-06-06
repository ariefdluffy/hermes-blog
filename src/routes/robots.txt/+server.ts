import type { RequestHandler } from './$types';

const BASE_URL = process.env.BASE_URL || 'https://lockbit.my.id';

export const GET: RequestHandler = () => {
	const robots = `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml

Disallow: /admin
Disallow: /api
Disallow: /auth`;

	return new Response(robots, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
