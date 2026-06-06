import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch, parent }) => {
	const { user } = await parent();

	// Fetch article data
	const res = await fetch(`/api/admin/articles/${params.id}`);
	if (!res.ok) {
		if (res.status === 404) throw redirect(302, '/admin/articles');
		throw redirect(302, '/admin/articles');
	}

	const article = await res.json();

	// AUTHOR can only edit own articles
	if (user.role === 'AUTHOR' && article.author?.id !== user.id) {
		throw redirect(302, '/admin/articles?error=forbidden');
	}

	return { article };
};