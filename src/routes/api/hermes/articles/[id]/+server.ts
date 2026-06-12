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
import type { ArticleResponse } from '$lib/types';

type ErrorCode = 'INVALID_API_KEY' | 'INSUFFICIENT_SCOPE' | 'INTERNAL_ERROR' | 'NOT_FOUND';

function err(status: number, code: ErrorCode, message: string, requestId: string) {
	return json({ error: message, code, request_id: requestId }, { status });
}

function getRequestId(request: Request): string {
	return request.headers.get('x-request-id') ?? crypto.randomUUID();
}

function authenticateRequest(request: Request): { ok: true; scope: ApiKeyScope } | { ok: false; code: ErrorCode; status: number; reason: string } {
	const hash = getApiKeyHash();
	if (!hash) return { ok: false, code: 'INTERNAL_ERROR', status: 503, reason: 'Hermes agent not configured' };

	let key: string | null = null;
	const header = request.headers.get('x-hermes-api-key');
	if (header) key = header;
	else {
		const auth = request.headers.get('authorization');
		if (auth?.startsWith('Bearer ')) key = auth.slice(7);
	}

	if (!key) return { ok: false, code: 'INVALID_API_KEY', status: 401, reason: 'Missing API key' };
	if (!verifyApiKey(key, hash)) return { ok: false, code: 'INVALID_API_KEY', status: 401, reason: 'Invalid API key' };

	return { ok: true, scope: getApiKeyScope() };
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

// GET /api/hermes/articles/[id]
export const GET: RequestHandler = async ({ request, params }) => {
	const requestId = getRequestId(request);
	const auth = authenticateRequest(request);
	if (!auth.ok) return err(auth.status, auth.code, auth.reason, requestId);
	if (!hasScope('read', auth.scope)) return err(403, 'INSUFFICIENT_SCOPE', 'Read scope required', requestId);

	try {
		const article = await prisma.article.findFirst({
			where: { OR: [{ id: params.id }, { slug: params.id }] },
			include: {
				author: { select: { id: true, username: true } },
				category: { select: { id: true, name: true, slug: true } },
				tags: { include: { tag: { select: { id: true, name: true, slug: true } } } }
			}
		});

		if (!article) return err(404, 'NOT_FOUND', 'Article not found', requestId);
		return json(mapArticle(article));
	} catch (e) {
		console.error(`[${requestId}] DB error:`, e);
		return err(500, 'INTERNAL_ERROR', 'Database error', requestId);
	}
};

// PUT /api/hermes/articles/[id]
export const PUT: RequestHandler = async ({ request, params }) => {
	const requestId = getRequestId(request);
	const auth = authenticateRequest(request);
	if (!auth.ok) return err(auth.status, auth.code, auth.reason, requestId);
	if (!hasScope('write', auth.scope)) return err(403, 'INSUFFICIENT_SCOPE', 'Write scope required', requestId);

	let body: any;
	try { body = await request.json(); } catch {
		return err(400, 'INTERNAL_ERROR', 'Invalid JSON body', requestId);
	}

	try {
		const existing = await prisma.article.findFirst({
			where: { OR: [{ id: params.id }, { slug: params.id }] },
			select: { id: true, status: true }
		});

		if (!existing) return err(404, 'NOT_FOUND', 'Article not found', requestId);

		const updateData: any = {};
		if (body.title !== undefined) updateData.title = body.title;
		if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
		if (body.content !== undefined) updateData.content = body.content;
		if (body.status !== undefined) updateData.status = body.status;
		if (body.seoTitle !== undefined) updateData.seoTitle = body.seoTitle || null;
		if (body.seoDescription !== undefined) updateData.seoDescription = body.seoDescription || null;
		if (body.coverImage !== undefined) updateData.coverImage = body.coverImage || null;
		if (body.category !== undefined) {
			const catSlug = body.category.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
			const cat = await prisma.category.findUnique({ where: { slug: catSlug } });
			if (cat) updateData.categoryId = cat.id;
		}

		if (body.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
			updateData.publishedAt = new Date();
		}

		if (body.tags !== undefined) {
			const tagRecords = await Promise.all(
				(body.tags as string[]).map(async (tagName: string) => {
					const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
					const existingTag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
					if (existingTag) return existingTag;
					return prisma.tag.create({ data: { name: tagName, slug: tagSlug } });
				})
			);
			await prisma.articleTag.deleteMany({ where: { articleId: existing.id } });
			updateData.tags = {
				create: tagRecords.map((t: any) => ({ tagId: t.id }))
			};
		}

		const article = await prisma.article.update({
			where: { id: existing.id },
			data: updateData,
			include: {
				author: { select: { id: true, username: true } },
				category: { select: { id: true, name: true, slug: true } },
				tags: { include: { tag: { select: { id: true, name: true, slug: true } } } }
			}
		});

		return json(mapArticle(article));
	} catch (e) {
		console.error(`[${requestId}] DB error:`, e);
		return err(500, 'INTERNAL_ERROR', 'Database error', requestId);
	}
};

// PATCH /api/hermes/articles/[id]
export const PATCH: RequestHandler = async (opts) => PUT(opts);
