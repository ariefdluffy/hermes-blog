import { APP_NAME, APP_DESCRIPTION } from '$lib/constants';

export const load = async ({ parent }) => {
	const parentData = await parent();
	return {
		title: parentData.title ?? APP_NAME,
		description: parentData.description ?? APP_DESCRIPTION
	};
};