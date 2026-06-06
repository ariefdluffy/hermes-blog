import { json } from '@sveltejs/kit';
import { COOKIE_OPTIONS } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.set('token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
	return json({ message: 'Logged out' }, { status: 200 });
};