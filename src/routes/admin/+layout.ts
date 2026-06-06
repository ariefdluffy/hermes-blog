import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ parent }) => {
	const data = await parent();

	// Check if user is authenticated
	if (!data.user) {
		throw redirect(302, '/auth/login');
	}

	// Check basic access — AUTHOR+ allowed into admin
	const allowedRoles = ['SUPERADMIN', 'EDITOR', 'AUTHOR'];
	if (!allowedRoles.includes(data.user.role)) {
		throw redirect(302, '/?error=forbidden');
	}

	return { user: data.user };
};