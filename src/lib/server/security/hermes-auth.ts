import { createHash, timingSafeEqual } from 'crypto';

const HERMES_API_KEY_HASH = process.env.HERMES_API_KEY_HASH ?? '';
const HERMES_API_KEY_SALT = process.env.HERMES_API_KEY_SALT ?? '';
const HERMES_API_KEY_SCOPE = (process.env.HERMES_API_KEY_SCOPE ?? 'write') as 'read' | 'write' | 'admin';

export type ApiKeyScope = 'read' | 'write' | 'admin';

/**
 * Hash an API key with salt for storage/comparison.
 * Always uses SHA-256. Salt is prepended to key before hashing.
 */
export function hashApiKey(key: string, salt: string = HERMES_API_KEY_SALT): string {
	return createHash('sha256').update(salt + key).digest('hex');
}

/**
 * Constant-time comparison of plaintext API key against stored hash.
 * No early returns — resistant to timing attacks.
 */
export function verifyApiKey(plain: string, hash: string): boolean {
	if (!hash || !plain) return false;

	const plainBuf = Buffer.from(hashApiKey(plain));
	const hashBuf = Buffer.from(hash);

	// Equalize buffer lengths for constant-time compare
	const maxLen = Math.max(plainBuf.length, hashBuf.length);
	const a = Buffer.alloc(maxLen, 0);
	const b = Buffer.alloc(maxLen, 0);
	plainBuf.copy(a);
	hashBuf.copy(b);

	return timingSafeEqual(a, b);
}

/** Returns the configured API key hash from environment. */
export function getApiKeyHash(): string {
	return HERMES_API_KEY_HASH;
}

/** Returns the configured API key scope from environment. */
export function getApiKeyScope(): ApiKeyScope {
	return HERMES_API_KEY_SCOPE;
}

// Scope hierarchy: read < write < admin
const SCOPE_HIERARCHY: Record<ApiKeyScope, number> = {
	read: 1,
	write: 2,
	admin: 3
};

/**
 * Check if `actual` scope is sufficient for `required` scope.
 * admin >= write >= read
 */
export function hasScope(required: ApiKeyScope, actual: ApiKeyScope): boolean {
	return SCOPE_HIERARCHY[actual] >= SCOPE_HIERARCHY[required];
}
