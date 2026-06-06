import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';
import { requireAuth } from '$lib/server/auth/utils';
import { canAction } from '$lib/server/auth/permissions';
import { generateArticle, type ContentCategory } from '$lib/server/ai';
import { slugify, calculateReadTime } from '$lib/utils';
import { z } from 'zod';

const generateSchema = z.object({
	source: z.string().min(1),
	category: z.enum(['AI', 'US_STOCKS', 'ID_STOCKS', 'TECHNOLOGY'])
});

export const POST: RequestHandler = async ({ locals, request }) => {
	requireAuth(locals);
	if (!canAction(locals.user!.role, 'MANAGE_AI_QUEUE')) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const body = await request.json();
	const parsed = generateSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
	}

	const { source, category } = parsed.data;

	let aiResult;
	try {
		aiResult = await generateArticle(source, category as ContentCategory);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : 'AI article generation failed';
		return json({ error: message }, { status: 500 });
	}

	// Create slug with uniqueness
	const baseSlug = slugify(aiResult.title);
	const existingSlug = await prisma.article.findUnique({ where: { slug: baseSlug } });
	const slug = existingSlug ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

	// Handle tags: connect existing or create new
	const tagRecords = await Promise.all(
		aiResult.tags.map(async (tagName: string) => {
			const tagSlug = slugify(tagName);
			const existing = await prisma.tag.findUnique({ where: { slug: tagSlug } });
			if (existing) return existing;
			return prisma.tag.create({ data: { name: tagName, slug: tagSlug } });
		})
	);

	// Save as DRAFT
	const article = await prisma.article.create({
		data: {
			slug,
			title: aiResult.title,
			excerpt: aiResult.excerpt,
			content: aiResult.content,
			contentType: 'MARKDOWN',
			seoTitle: aiResult.seoTitle,
			seoDescription: aiResult.seoDescription,
			readTime: calculateReadTime(aiResult.content),
			status: 'DRAFT',
			authorId: locals.user!.id,
			tags: {
				create: tagRecords.map((tag: { id: string }) => ({ tagId: tag.id }))
			}
		},
		include: {
			author: { select: { id: true, username: true } },
			tags: { include: { tag: { select: { id: true, name: true, slug: true } } } }
		}
	});

	return json({
		id: article.id,
		slug: article.slug,
		title: article.title,
		status: article.status,
		createdAt: article.createdAt
	}, { status: 201 });
};