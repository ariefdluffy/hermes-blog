import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db";
import { canAction } from "$lib/server/auth/permissions";
import { slugify } from "$lib/utils";
import { z } from "zod";

const updateCategorySchema = z.object({
	name: z.string().min(1).max(100).optional(),
	description: z.string().max(500).nullable().optional(),
	icon: z.string().max(10).nullable().optional(),
});

function authError() {
	return json({ error: "Unauthorized" }, { status: 401 });
}

function forbiddenError() {
	return json({ error: "Forbidden" }, { status: 403 });
}

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) return authError();
	if (!canAction(locals.user.role, "MANAGE_CATEGORIES")) return forbiddenError();

	const { id } = params;

	const existing = await prisma.category.findUnique({ where: { id } });
	if (!existing) {
		return json({ error: "Category not found" }, { status: 404 });
	}

	const body = await request.json();
	const parsed = updateCategorySchema.safeParse(body);
	if (!parsed.success) {
		return json(
			{ error: "Validation failed", details: parsed.error.flatten() },
			{ status: 400 },
		);
	}

	const data: any = {};
	if (parsed.data.name !== undefined) {
		data.name = parsed.data.name;
		data.slug = slugify(parsed.data.name);
	}
	if (parsed.data.description !== undefined) data.description = parsed.data.description;
	if (parsed.data.icon !== undefined) data.icon = parsed.data.icon;

	const category = await prisma.category.update({
		where: { id },
		data,
	});

	return json(category);
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) return authError();
	if (!canAction(locals.user.role, "MANAGE_CATEGORIES")) return forbiddenError();

	const { id } = params;

	const existing = await prisma.category.findUnique({ where: { id } });
	if (!existing) {
		return json({ error: "Category not found" }, { status: 404 });
	}

	// Unlink articles before deleting
	await prisma.article.updateMany({
		where: { categoryId: id },
		data: { categoryId: null },
	});

	await prisma.category.delete({ where: { id } });

	return json({ success: true });
};
