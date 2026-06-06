import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { prisma } from '$lib/server/db';
import { slugify, calculateReadTime } from '$lib/utils';
import {
	hashApiKey,
	verifyApiKey,
	getApiKeyHash,
	getApiKeyScope,
	hasScope,
	type ApiKeyScope
} from '$lib/server/security/hermes-auth';
import type { RequestHandler } from './$types';

// ── Schema ────────────────────────────────────────────────────────────

const agentArticleSchema = z.object({
	title: z.string().min(1).max(255),
	excerpt: z.string().min(1).max(1000),
	content: z.string().min(1),
	contentType: z.enum(['MARKDOWN', 'HTML']).default('MARKDOWN'),
	seoTitle: z.string().max(255).optional(),
	seoDescription: z.string().max(500).optional(),
	coverImage: z.string().url().optional().or(z.literal('')),
	category: z.enum(['AI', 'US_STOCKS', 'ID_STOCKS', 'TECHNOLOGY']),
	source: z.string().optional(),
	tags: z.array(z.string()).default([])
});

// ── Error Helpers ─────────────────────────────────────────────────────

type ErrorCode =
	| 'INVALID_API_KEY'
	| 'INSUFFICIENT_SCOPE'
	| 'RATE_LIMITED'
	| 'VALIDATION_ERROR'
	| 'AGENT_NOT_CONFIGURED'
	| 'INTERNAL_ERROR';

function err(status: number, code: ErrorCode, message: string, requestId: string) {
	return json({ error: message, code, request_id: requestId }, { status });
}

function getRequestId(request: Request): string {
	return request.headers.get('x-request-id') ?? crypto.randomUUID();
}

// ── Rate Limiter (per-key, sliding window) ────────────────────────────

interface RateBucket {
	count: number;
	resetAt: number;
}

const rateMap = new Map<string, RateBucket>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;

if (typeof setInterval !== 'undefined') {
	setInterval(() => {
		const now = Date.now();
		for (const [key, bucket] of rateMap) {
			if (now >= bucket.resetAt) rateMap.delete(key);
		}
	}, 5 * 60_000);
}

function checkRateLimit(keyHash: string): { allowed: boolean; remaining: number; retryAfter?: number } {
	const now = Date.now();
	const bucket = rateMap.get(keyHash);

	if (!bucket || now >= bucket.resetAt) {
		rateMap.set(keyHash, { count: 1, resetAt: now + RATE_WINDOW_MS });
		return { allowed: true, remaining: RATE_MAX - 1 };
	}

	if (bucket.count >= RATE_MAX) {
		const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
		return { allowed: false, remaining: 0, retryAfter };
	}

	bucket.count++;
	return { allowed: true, remaining: RATE_MAX - bucket.count };
}

// ── Auth ──────────────────────────────────────────────────────────────

type AuthResult =
	| { ok: true; keyHash: string; scope: ApiKeyScope }
	| { ok: false; code: ErrorCode; status: number; reason: string };

function authenticateRequest(request: Request): AuthResult {
	const hash = getApiKeyHash();
	if (!hash) {
		return { ok: false, code: 'AGENT_NOT_CONFIGURED', status: 503, reason: 'Hermes agent not configured' };
	}

	// Extract key from header or Authorization
	let key: string | null = null;
	const header = request.headers.get('x-hermes-api-key');
	if (header) {
		key = header;
	} else {
		const auth = request.headers.get('authorization');
		if (auth?.startsWith('Bearer ')) key = auth.slice(7);
	}

	if (!key) {
		return { ok: false, code: 'INVALID_API_KEY', status: 401, reason: 'Missing API key' };
	}

	if (!verifyApiKey(key, hash)) {
		return { ok: false, code: 'INVALID_API_KEY', status: 401, reason: 'Invalid API key' };
	}

	const scope = getApiKeyScope();
	const keyHash = hashApiKey(key);

	return { ok: true, keyHash, scope };
}

// ═══════════════════════════════════════════════════════════════════════
// GET /api/hermes/article — Health Check
// ═══════════════════════════════════════════════════════════════════════

export const GET: RequestHandler = async ({ request }) => {
	const requestId = getRequestId(request);

	// ── Auth ────────────────────────────────────────────────────────
	const auth = authenticateRequest(request);
	if (!auth.ok) {
		return err(auth.status, auth.code, auth.reason, requestId);
	}

	let dbStatus = 'connected';
	try {
		await prisma.$queryRaw`SELECT 1`;
	} catch {
		dbStatus = 'error';
	}

	return json({
		status: 'ok',
		version: '1.0',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		db: dbStatus
	});
};

// ═══════════════════════════════════════════════════════════════════════
// POST /api/hermes/article — Submit Article
// ═══════════════════════════════════════════════════════════════════════

export const POST: RequestHandler = async ({ request }) => {
	const requestId = getRequestId(request);

	// ── Auth ────────────────────────────────────────────────────────
	const auth = authenticateRequest(request);
	if (!auth.ok) {
		return err(auth.status, auth.code, auth.reason, requestId);
	}

	// ── Scope check ─────────────────────────────────────────────────
	if (!hasScope('write', auth.scope)) {
		return err(403, 'INSUFFICIENT_SCOPE', `Scope '${auth.scope}' lacks write permission`, requestId);
	}

	// ── Rate limit ──────────────────────────────────────────────────
	const rate = checkRateLimit(auth.keyHash);
	if (!rate.allowed) {
		return err(429, 'RATE_LIMITED', 'Too many requests', requestId);
	}

	// ── Parse body ──────────────────────────────────────────────────
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return err(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
	}

	const parsed = agentArticleSchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{
				error: 'Validation failed',
				code: 'VALIDATION_ERROR' as ErrorCode,
				request_id: requestId,
				details: parsed.error.flatten().fieldErrors
			},
			{ status: 400 }
		);
	}

	const data = parsed.data;

	// ── Find system author ──────────────────────────────────────────
	let systemAuthor;
	try {
		systemAuthor = await prisma.user.findFirst({
			where: { role: 'SUPERADMIN' },
			select: { id: true }
		});
	} catch (e) {
		console.error(`[${requestId}] DB error finding author:`, e);
		return err(500, 'INTERNAL_ERROR', 'Database error', requestId);
	}

	if (!systemAuthor) {
		return err(500, 'INTERNAL_ERROR', 'System author not found', requestId);
	}

	// ── Slug uniqueness ─────────────────────────────────────────────
	let slug = slugify(data.title);
	try {
		const existingSlug = await prisma.article.findUnique({ where: { slug } });
		if (existingSlug) {
			slug = `${slug}-${Date.now().toString(36)}`;
		}
	} catch (e) {
		console.error(`[${requestId}] DB error slug check:`, e);
		return err(500, 'INTERNAL_ERROR', 'Database error', requestId);
	}

	// ── Handle tags ─────────────────────────────────────────────────
	let tagRecords;
	try {
		tagRecords = await Promise.all(
			data.tags.map(async (tagName: string) => {
				const tagSlug = slugify(tagName);
				const existing = await prisma.tag.findUnique({ where: { slug: tagSlug } });
				if (existing) return existing;
				return prisma.tag.create({ data: { name: tagName, slug: tagSlug } });
			})
		);
	} catch (e) {
		console.error(`[${requestId}] DB error tags:`, e);
		return err(500, 'INTERNAL_ERROR', 'Failed to process tags', requestId);
	}

	// Add category as tag
	let categoryTag;
	try {
		const categoryTagSlug = slugify(data.category);
		categoryTag = await prisma.tag.upsert({
			where: { slug: categoryTagSlug },
			update: {},
			create: { name: data.category, slug: categoryTagSlug }
		});
	} catch (e) {
		console.error(`[${requestId}] DB error category tag:`, e);
		return err(500, 'INTERNAL_ERROR', 'Failed to process category tag', requestId);
	}

	const allTagIds = new Set(tagRecords.map((t: { id: string }) => t.id));
	allTagIds.add(categoryTag.id);

	// ── Create article ──────────────────────────────────────────────
	let article;
	try {
		article = await prisma.article.create({
			data: {
				slug,
				title: data.title,
				excerpt: data.excerpt,
				content: data.content,
				contentType: data.contentType,
				seoTitle: data.seoTitle ?? null,
				seoDescription: data.seoDescription ?? null,
				coverImage: data.coverImage ?? null,
				readTime: calculateReadTime(data.content),
				status: 'DRAFT',
				authorId: systemAuthor.id,
				tags: {
					create: [...allTagIds].map((id) => ({ tagId: id }))
				}
			},
			select: {
				id: true,
				slug: true,
				title: true,
				status: true,
				createdAt: true
			}
		});
	} catch (e) {
		console.error(`[${requestId}] DB error create article:`, e);
		return err(500, 'INTERNAL_ERROR', 'Failed to create article', requestId);
	}

	return json(article, {
		status: 201,
		headers: {
			'X-Request-ID': requestId,
			'X-RateLimit-Limit': String(RATE_MAX),
			'X-RateLimit-Remaining': String(rate.remaining),
			'X-RateLimit-Reset': String(Math.ceil((Date.now() + RATE_WINDOW_MS) / 1000))
		}
	});
};
