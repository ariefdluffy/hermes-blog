import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	// Tutorials tagged with 'tutorial'
	const res = await fetch('/api/articles?tag=tutorial&perPage=20');
	const data = res.ok ? await res.json() : { data: [] };
	return { articles: data.data ?? [] };
};
