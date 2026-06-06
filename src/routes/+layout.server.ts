import { APP_NAME, APP_DESCRIPTION } from '$lib/constants';

export const prerender = false;

export async function load(event) {
	return {
		title: APP_NAME,
		description: APP_DESCRIPTION,
		user: event.locals?.user ?? null
	};
}