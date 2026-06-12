import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db";
import { canAction } from "$lib/server/auth/permissions";
import { slugify } from "$lib/utils";
import { z } from "zod";

const createCategorySchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().max(500).optional(),
	icon: z.string().max(10).optional(),
});

function authError() {
	return json({ error: "Unauthorized" }, { status: 401 });
}

function forbiddenError() {
	return json({ error: "Forbidden" }, { status: 403 });
}

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) return authError();
	if (!canAction(locals.user.role, "MANAGE_CATEGORIES")) return forbiddenError();

	const search = url.searchParams.get("search") ?? "";
	const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
	const perPage = Math.min(50, Math.max(1, Number(url.searchParams.get("perPage")) || 50));

	const where = search
		? {
				OR: [
					{ name: { contains: search } },
					{ slug: { contains: search } },
				],
			}
		: {};

	const [categories, total] = await Promise.all([
		prisma.category.findMany({
			where,
			orderBy: { name: "asc" },
			skip: (page - 1) * perPage,
			take: perPage,
			include: {
				_count: {
					select: { articles: true },
				},
			},
		}),
		prisma.category.count({ where }),
	]);

	return json({
		data: categories.map((c) => ({
			id: c.id,
			name: c.name,
			slug: c.slug,
			description: c.description,
			icon: c.icon,
			articleCount: c._count.articles,
		})),
		total,
		page,
		perPage,
		totalPages: Math.ceil(total / perPage),
	});
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) return authError();
	if (!canAction(locals.user.role, "MANAGE_CATEGORIES")) return forbiddenError();

	const body = await request.json();
	const parsed = createCategorySchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: "Validation failed", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const { name, description, icon } = parsed.data;
	const slug = slugify(name);

	const existing = await prisma.category.findFirst({
		where: { OR: [{ name }, { slug }] },
	});
	if (existing) {
		return json(
			{ error: "Category with this name or slug already exists" },
			{ status: 409 },
		);
	}

	const category = await prisma.category.create({
		data: { name, slug, description: description ?? null, icon: icon ?? null },
	});

	return json(category, { status: 201 });
};
