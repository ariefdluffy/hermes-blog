import { json } from '@sveltejs/kit';
import { requireRole } from '$lib/server/auth/utils';
import { prisma } from '$lib/server/db';
import type { RequestHandler } from './$types';

// Type definitions
interface SettingsObject {
	siteTitle: string;
	siteDescription: string;
	language: string;
	postsPerPage: number;
	enableAiGeneration: boolean;
	enableComments: boolean;
	maintenanceMode: boolean;
}

// Default values when DB has no settings
const DEFAULTS: SettingsObject = {
	siteTitle: 'Hermes Blog',
	siteDescription: 'Advanced AI-Powered Blog Platform',
	language: 'en',
	postsPerPage: 10,
	enableAiGeneration: true,
	enableComments: true,
	maintenanceMode: false
};

// Keys that should be parsed as number
const NUMBER_KEYS = new Set(['postsPerPage']);

// Keys that should be parsed as boolean
const BOOLEAN_KEYS = new Set(['enableAiGeneration', 'enableComments', 'maintenanceMode']);

function parseValue(key: string, raw: string): string | number | boolean {
	if (BOOLEAN_KEYS.has(key)) return raw === 'true';
	if (NUMBER_KEYS.has(key)) return Number(raw);
	return raw;
}

function serializeValue(value: unknown): string {
	return String(value);
}

// Load settings from DB, fall back to defaults
async function loadSettings(): Promise<SettingsObject> {
	const rows = await prisma.setting.findMany();
	if (rows.length === 0) return { ...DEFAULTS };

	const result = { ...DEFAULTS };
	for (const row of rows) {
		(result as Record<string, unknown>)[row.key] = parseValue(row.key, row.value);
	}
	return result as SettingsObject;
}

export const GET: RequestHandler = async ({ locals }) => {
	requireRole(locals, ['SUPERADMIN']);
	const settings = await loadSettings();
	return json(settings);
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	requireRole(locals, ['SUPERADMIN']);
	const body = (await request.json()) as Record<string, unknown>;

	for (const [key, value] of Object.entries(body)) {
		await prisma.setting.upsert({
			where: { key },
			update: { value: serializeValue(value) },
			create: { key, value: serializeValue(value) }
		});
	}

	const settings = await loadSettings();
	return json(settings);
};
