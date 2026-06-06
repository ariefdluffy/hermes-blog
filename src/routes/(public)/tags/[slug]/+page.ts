import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const res = await fetch(`/api/tags/${params.slug}`);

	if (!res.ok) {
		return { tag: null, articles: [] };
	}

	const data = await res.json();
	return {
		tag: { id: data.id, name: data.name, slug: data.slug },
		articles: data.articles ?? []
	};
};