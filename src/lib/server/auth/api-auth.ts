import { verifyToken } from './index';
import type { RequestEvent } from '@sveltejs/kit';
import type { UserRole } from '$lib/types';
import { canAction } from './permissions';
import type { Action } from './permissions';

export function getApiUser(cookies: { get: (name: string) => string | undefined }): { id: string; username: string; role: string } | null {
	const token = cookies.get('token');
	if (!token) return null;
	return verifyToken(token);
}

export function authErrorResponse() {
	return new Response(JSON.stringify({ error: 'Unauthorized' }), {
		status: 401,
		headers: { 'Content-Type': 'application/json' }
	});
}

export function forbiddenErrorResponse() {
	return new Response(JSON.stringify({ error: 'Forbidden' }), {
		status: 403,
		headers: { 'Content-Type': 'application/json' }
	});
}

export function requireApiAuth(event: RequestEvent): { id: string; username: string; role: string } | Response {
	const user = getApiUser(event.cookies);
	if (!user) return authErrorResponse();
	return user;
}

export function requireApiRole(event: RequestEvent, roles: UserRole[]): { id: string; username: string; role: string } | Response {
	const result = requireApiAuth(event);
	if (result instanceof Response) return result;
	if (!roles.includes(result.role as UserRole)) return forbiddenErrorResponse();
	return result;
}

export function requireApiAction(event: RequestEvent, action: Action): { id: string; username: string; role: string } | Response {
	const result = requireApiAuth(event);
	if (result instanceof Response) return result;
	if (!canAction(result.role, action)) return forbiddenErrorResponse();
	return result;
}