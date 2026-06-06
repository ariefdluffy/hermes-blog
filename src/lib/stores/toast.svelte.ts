export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
	id: string;
	title: string;
	message: string;
	variant: ToastVariant;
	createdAt: number;
}

function createToastStore() {
	let items = $state<ToastItem[]>([]);
	let counter = $state(0);

	function add(title: string, message: string, variant: ToastVariant, duration: number = 4000) {
		const id = `toast-${++counter}-${Date.now()}`;
		const item: ToastItem = { id, title, message, variant, createdAt: Date.now() };
		items = [...items, item];

		if (duration > 0) {
			setTimeout(() => {
				remove(id);
			}, duration);
		}
	}

	function success(title: string, message: string = '') {
		add(title, message, 'success');
	}

	function error(title: string, message: string = '') {
		add(title, message, 'error', 6000);
	}

	function warning(title: string, message: string = '') {
		add(title, message, 'warning', 5000);
	}

	function info(title: string, message: string = '') {
		add(title, message, 'info');
	}

	function remove(id: string) {
		items = items.filter((t) => t.id !== id);
	}

	return {
		get items() {
			return items;
		},
		success,
		error,
		warning,
		info,
		remove
	};
}

export const toast = createToastStore();
