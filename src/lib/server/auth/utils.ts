import { redirect } from '@sveltejs/kit';
import { verifyToken } from './index';

/**
 * Asserts user is authenticated. Throws 401 redirect to /auth/login if not.
 */
export function requireAuth(locals: App.Locals): asserts locals is App.Locals & { user: NonNullable<App.Locals['user']> } {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}
}

/**
 * Asserts user has one of the required roles. Throws 403 if unauthorized.
 */
export function requireRole(locals: App.Locals, roles: string[]): void {
	requireAuth(locals);
	if (!roles.includes(locals.user!.role)) {
		throw redirect(302, '/admin?error=forbidden');
	}
}

/**
 * Extracts user object from a JWT token. Returns null if invalid.
 */
export function getUserFromToken(token: string): { id: string; username: string; role: string } | null {
	return verifyToken(token);
}