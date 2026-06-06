import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const res = await fetch(`/api/articles/${params.slug}`);

	if (!res.ok) {
		return { article: null };
	}

	const article = await res.json();
	return { article };
};