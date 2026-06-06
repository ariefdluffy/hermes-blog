import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/tags');

	const tags = res.ok ? await res.json() : [];
	return { tags };
};