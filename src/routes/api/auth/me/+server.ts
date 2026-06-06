import { json } from '@sveltejs/kit';
import prisma from '$lib/server/db';
import { verifyToken } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, cookies }) => {
	try {
		// Try Authorization header first, then cookie
		const authHeader = request.headers.get('authorization');
		let token: string | null = null;

		if (authHeader?.startsWith('Bearer ')) {
			token = authHeader.slice(7);
		} else {
			token = cookies.get('token') || null;
		}

		if (!token) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const payload = verifyToken(token);
		if (!payload) {
			return json({ error: 'Invalid or expired token' }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				username: true,
				email: true,
				role: true,
				emailVerified: true,
				createdAt: true
			}
		});

		if (!user) {
			return json({ error: 'User not found' }, { status: 401 });
		}

		return json(user, { status: 200 });
	} catch (err) {
		console.error('Me error:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};