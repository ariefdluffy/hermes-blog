import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/articles?tag=ai&perPage=20');
	const data = res.ok ? await res.json() : { data: [] };
	return { articles: data.data ?? [] };
};
