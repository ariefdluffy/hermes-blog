import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';
import { requireRole } from '$lib/server/auth/utils';
import { deleteImage } from '$lib/server/upload';

export const GET: RequestHandler = async ({ locals, params }) => {
	requireRole(locals, ['SUPERADMIN']);

	const upload = await prisma.upload.findUnique({ where: { id: params.id } });
	if (!upload) {
		return json({ error: 'Upload not found' }, { status: 404 });
	}

	return json({
		id: upload.id,
		filename: upload.filename,
		mimeType: upload.mimeType,
		size: upload.size,
		url: `/uploads/${upload.filename}`,
		createdAt: upload.createdAt
	});
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	requireRole(locals, ['SUPERADMIN']);

	try {
		await deleteImage(params.id);
		return json({ success: true });
	} catch (err: any) {
		if (err.message === 'Upload not found') {
			return json({ error: 'Upload not found' }, { status: 404 });
		}
		return json({ error: err.message }, { status: 500 });
	}
};