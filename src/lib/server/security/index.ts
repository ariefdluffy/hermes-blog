import createDOMPurify from 'isomorphic-dompurify';
import { randomBytes, createHash, timingSafeEqual } from 'crypto';

// ── Rate Limiter (in-memory, sliding window, per-IP) ──────────────────

interface RateEntry {
	count: number;
	windowStart: number;
}

export class RateLimiter {
	private requests = new Map<string, RateEntry>();
	private windowMs: number;
	private maxRequests: number;

	constructor(windowMs = 60_000, maxRequests = 100) {
		this.windowMs = windowMs;
		this.maxRequests = maxRequests;
	}

	check(ip: string): { allowed: boolean; remaining: number; retryAfter?: number } {
		const now = Date.now();
		const entry = this.requests.get(ip);

		if (!entry || now - entry.windowStart >= this.windowMs) {
			this.requests.set(ip, { count: 1, windowStart: now });
			return { allowed: true, remaining: this.maxRequests - 1 };
		}

		if (entry.count >= this.maxRequests) {
			const retryAfter = Math.ceil((this.windowMs - (now - entry.windowStart)) / 1000);
			return { allowed: false, remaining: 0, retryAfter };
		}

		entry.count++;
		return { allowed: true, remaining: this.maxRequests - entry.count };
	}

	reset(ip: string): void {
		this.requests.delete(ip);
	}

	cleanup(): void {
		const now = Date.now();
		for (const [ip, entry] of this.requests) {
			if (now - entry.windowStart >= this.windowMs) {
				this.requests.delete(ip);
			}
		}
	}
}

// ── HTML Sanitization ──────────────────────────────────────────────────

const DOMPurify = createDOMPurify();

export function sanitizeHtml(dirty: string): string {
	return DOMPurify.sanitize(dirty, {
		ALLOWED_TAGS: [
			'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
			'p', 'a', 'strong', 'em', 'b', 'i', 'u', 's',
			'ul', 'ol', 'li',
			'blockquote', 'pre', 'code',
			'table', 'thead', 'tbody', 'tr', 'th', 'td',
			'img', 'figure', 'figcaption',
			'hr', 'br', 'div', 'span',
			'details', 'summary'
		],
		ALLOWED_ATTR: [
			'href', 'src', 'alt', 'title', 'class', 'id',
			'target', 'rel', 'loading', 'width', 'height'
		],
		ALLOW_DATA_ATTR: false
	});
}

// ── Input Sanitization ────────────────────────────────────────────────

export function sanitizeInput(input: string): string {
	return input
		.replace(/<[^>]*>/g, '') // strip HTML tags
		.trim();
}

// ── CSRF ───────────────────────────────────────────────────────────────

export function generateCsrfToken(): string {
	return randomBytes(32).toString('hex');
}

export function validateCsrfToken(token: string, expected: string): boolean {
	if (!token || !expected) return false;
	const a = Buffer.from(token, 'hex');
	const b = Buffer.from(expected, 'hex');
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}

// ── Security Headers ───────────────────────────────────────────────────

export const securityHeaders = {
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'X-XSS-Protection': '1; mode=block',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
	'Content-Security-Policy': [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline'",
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: https:",
		"font-src 'self'",
		"connect-src 'self'",
		"frame-ancestors 'none'"
	].join('; '),
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
} as const;