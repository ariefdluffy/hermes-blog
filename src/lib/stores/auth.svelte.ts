import { browser } from '$app/environment';
import { toast } from '$lib/stores/toast.svelte';

export interface AuthUser {
	id: string;
	username: string;
	email: string;
	role: 'SUPERADMIN' | 'EDITOR' | 'AUTHOR';
	emailVerified: boolean;
}

function createAuthStore() {
	let user = $state<AuthUser | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function login(email: string, password: string): Promise<AuthUser | null> {
		loading = true;
		error = null;
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			const data = await res.json();
			if (!res.ok) {
				error = data.error || 'Login failed';
				return null;
			}
			user = data;
			return data;
		} catch (err) {
			error = 'Network error';
			return null;
		} finally {
			loading = false;
		}
	}

	async function register(username: string, email: string, password: string): Promise<AuthUser | null> {
		loading = true;
		error = null;
		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, email, password })
			});
			const data = await res.json();
			if (!res.ok) {
				error = data.error || 'Registration failed';
				return null;
			}
			return data;
		} catch (err) {
			error = 'Network error';
			return null;
		} finally {
			loading = false;
		}
	}

	async function logout(): Promise<void> {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
		} catch {
			// ignore
		}
		user = null;
		if (browser) {
			toast.success('Signed out', 'See you next time');
			window.location.href = '/';
		}
	}

	async function fetchUser(): Promise<AuthUser | null> {
		if (!browser) return null;
		try {
			const res = await fetch('/api/auth/me');
			if (!res.ok) {
				user = null;
				return null;
			}
			user = await res.json();
			return user;
		} catch {
			user = null;
			return null;
		}
	}

	return {
		get user() { return user; },
		get loading() { return loading; },
		get error() { return error; },
		get isLoggedIn() { return user !== null; },
		login,
		register,
		logout,
		fetchUser
	};
}

export const auth = createAuthStore();