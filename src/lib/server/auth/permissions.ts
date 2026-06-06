type Action =
	| 'MANAGE_USERS'
	| 'MANAGE_ARTICLES'
	| 'MANAGE_TAGS'
	| 'MANAGE_UPLOADS'
	| 'REVIEW_ARTICLES'
	| 'CREATE_ARTICLES'
	| 'EDIT_OWN_ARTICLES'
	| 'VIEW_ANALYTICS'
	| 'MANAGE_AI_QUEUE';

const PERMISSIONS: Record<string, Action[]> = {
	SUPERADMIN: [
		'MANAGE_USERS',
		'MANAGE_ARTICLES',
		'MANAGE_TAGS',
		'MANAGE_UPLOADS',
		'REVIEW_ARTICLES',
		'CREATE_ARTICLES',
		'EDIT_OWN_ARTICLES',
		'VIEW_ANALYTICS',
		'MANAGE_AI_QUEUE'
	],
	EDITOR: [
		'MANAGE_ARTICLES',
		'MANAGE_TAGS',
		'REVIEW_ARTICLES',
		'CREATE_ARTICLES',
		'EDIT_OWN_ARTICLES',
		'VIEW_ANALYTICS'
	],
	AUTHOR: [
		'CREATE_ARTICLES',
		'EDIT_OWN_ARTICLES'
	]
};

export function canAction(userRole: string, action: string): boolean {
	const allowed = PERMISSIONS[userRole];
	if (!allowed) return false;
	return allowed.includes(action as Action);
}

export { PERMISSIONS };
export type { Action };