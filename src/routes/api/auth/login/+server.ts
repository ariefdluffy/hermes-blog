import { json } from '@sveltejs/kit';
import { z } from 'zod';
import prisma from '$lib/server/db';
import { verifyPassword, createAccessToken, COOKIE_OPTIONS } from '$lib/server/auth';
import type { RequestHandler } from './$types';

const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required')
});

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const parsed = loginSchema.safeParse(body);

		if (!parsed.success) {
			return json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
		}

		const { email, password } = parsed.data;
		const cleanEmail = email.toLowerCase().trim();

		// Find user
		const user = await prisma.user.findUnique({
			where: { email: cleanEmail }
		});

		if (!user) {
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		// Verify password
		const valid = await verifyPassword(password, user.passwordHash);
		if (!valid) {
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		// Check email verification
		if (!user.emailVerified) {
			return json({ error: 'Email not verified. Please check your inbox.' }, { status: 403 });
		}

		// Sign token and set cookie
		const token = createAccessToken({ id: user.id, username: user.username, email: user.email, role: user.role });
		cookies.set('token', token, COOKIE_OPTIONS);

		return json({
			id: user.id,
			username: user.username,
			email: user.email,
			role: user.role
		}, { status: 200 });
	} catch (err) {
		console.error('Login error:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};