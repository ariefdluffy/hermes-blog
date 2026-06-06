import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';
import { requireAuth } from '$lib/server/auth/utils';
import { canAction } from '$lib/server/auth/permissions';
import { uploadImage, deriveThumbFilename } from '$lib/server/upload';
import { PAGINATION } from '$lib/constants';

export const GET: RequestHandler = async ({ locals, url }) => {
	requireAuth(locals);
	if (!canAction(locals.user!.role, 'MANAGE_UPLOADS')) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const page = Math.max(1, Number(url.searchParams.get('page')) || PAGINATION.DEFAULT_PAGE);
	const perPage = Math.min(PAGINATION.MAX_PER_PAGE, Math.max(1, Number(url.searchParams.get('perPage')) || PAGINATION.DEFAULT_PER_PAGE));

	const [uploads, total] = await Promise.all([
		prisma.upload.findMany({
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * perPage,
			take: perPage
		}),
		prisma.upload.count()
	]);

	return json({
		data: uploads.map((u) => {
			const isGif = u.mimeType === 'image/gif';
			return {
				id: u.id,
				filename: u.filename,
				mimeType: u.mimeType,
				size: u.size,
				url: `/uploads/${u.filename}`,
				thumbnailUrl: isGif ? null : `/uploads/${deriveThumbFilename(u.filename)}`,
				createdAt: u.createdAt
			};
		}),
		total,
		page,
		perPage,
		totalPages: Math.ceil(total / perPage)
	});
};

export const POST: RequestHandler = async ({ locals, request }) => {
	requireAuth(locals);
	if (!canAction(locals.user!.role, 'MANAGE_UPLOADS')) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const formData = await request.formData();
	const file = formData.get('file');

	if (!file || !(file instanceof File)) {
		return json({ error: 'No file provided. Use "file" field.' }, { status: 400 });
	}

	try {
		const result = await uploadImage(file);
		return json(result, { status: 201 });
	} catch (err: any) {
		return json({ error: err.message }, { status: 400 });
	}
};