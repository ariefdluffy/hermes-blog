import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import {
	hashApiKey,
	verifyApiKey,
	getApiKeyHash,
	getApiKeyScope,
	hasScope,
	type ApiKeyScope
} from '$lib/server/security/hermes-auth';
import type { RequestHandler } from './$types';
import type { ArticleResponse, PaginatedResponse } from '$lib/types';

// ── Error Helpers ─────────────────────────────────────────────────────

type ErrorCode = 'INVALID_API_KEY' | 'INSUFFICIENT_SCOPE' | 'INTERNAL_ERROR';

function err(status: number, code: ErrorCode, message: string, requestId: string) {
	return json({ error: message, code, request_id: requestId }, { status });
}

function getRequestId(request: Request): string {
	return request.headers.get('x-request-id') ?? crypto.randomUUID();
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

function mapArticle(a: any): ArticleResponse {
	return {
		id: a.id,
		slug: a.slug,
		title: a.title,
		excerpt: a.excerpt,
		content: a.content,
		contentType: a.contentType,
		seoTitle: a.seoTitle,
		seoDescription: a.seoDescription,
		coverImage: a.coverImage,
		views: a.views,
		readTime: a.readTime,
		status: a.status,
		publishedAt: a.publishedAt?.toISOString() ?? null,
		createdAt: a.createdAt.toISOString(),
		updatedAt: a.updatedAt.toISOString(),
		author: a.author,
		category: a.category ?? null,
		tags: a.tags.map((at: any) => at.tag)
	};
}

// ═══════════════════════════════════════════════════════════════════════
// GET /api/hermes/articles — Fetch published articles
// ═══════════════════════════════════════════════════════════════════════

export const GET: RequestHandler = async ({ request, url }) => {
	const requestId = getRequestId(request);

	// ── Auth ────────────────────────────────────────────────────────
	const auth = authenticateRequest(request);
	if (!auth.ok) {
		return err(auth.status, auth.code, auth.reason, requestId);
	}

	// ── Scope check ─────────────────────────────────────────────────
	if (!hasScope('read', auth.scope)) {
		return err(403, 'INSUFFICIENT_SCOPE', `Scope '${auth.scope}' lacks read permission`, requestId);
	}

	// ── Query params ────────────────────────────────────────────────
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const perPage = Math.min(50, Math.max(1, Number(url.searchParams.get('perPage')) || 10));
	const category = url.searchParams.get('category'); // slug
	const tag = url.searchParams.get('tag');           // slug
	const search = url.searchParams.get('q');
	const days = url.searchParams.get('days');         // trending filter
	const limit = url.searchParams.get('limit');

	const where: any = { status: 'PUBLISHED' };

	if (category) {
		where.category = { slug: category };
	}

	if (tag) {
		where.tags = { some: { tag: { slug: tag } } };
	}

	if (search) {
		where.OR = [
			{ title: { contains: search } },
			{ excerpt: { contains: search } },
			{ content: { contains: search } }
		];
	}

	// ── Trending mode ───────────────────────────────────────────────
	if (days) {
		const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
		where.publishedAt = { gte: since };
		const take = Math.min(50, Math.max(1, Number(limit) || 10));

		const articles = await prisma.article.findMany({
			where,
			orderBy: { views: 'desc' },
			take,
			include: {
				author: { select: { id: true, username: true } },
				category: { select: { id: true, name: true, slug: true } },
				tags: { include: { tag: { select: { id: true, name: true, slug: true } } } }
			}
		});

		return json(articles.map(mapArticle));
	}

	// ── Normal paginated mode ───────────────────────────────────────
	const [articles, total] = await Promise.all([
		prisma.article.findMany({
			where,
			orderBy: { publishedAt: 'desc' },
			skip: (page - 1) * perPage,
			take: perPage,
			include: {
				author: { select: { id: true, username: true } },
				category: { select: { id: true, name: true, slug: true } },
				tags: { include: { tag: { select: { id: true, name: true, slug: true } } } }
			}
		}),
		prisma.article.count({ where })
	]);

	return json({
		data: articles.map(mapArticle),
		total,
		page,
		perPage,
		totalPages: Math.ceil(total / perPage)
	} satisfies PaginatedResponse<ArticleResponse>);
};
