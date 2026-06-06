import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/admin/settings');
	const settings = await res.json();
	return { settings };
};
