export interface ConfirmOptions {
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: 'danger' | 'warning' | 'default';
	onConfirm: () => void | Promise<void>;
	onCancel?: () => void;
}

function createConfirmStore() {
	let open = $state(false);
	let options = $state<ConfirmOptions | null>(null);

	function show(opts: ConfirmOptions) {
		options = opts;
		open = true;
	}

	function close() {
		open = false;
		setTimeout(() => {
			options = null;
		}, 200);
	}

	async function confirm() {
		if (!options) return;
		try {
			await options.onConfirm();
		} finally {
			close();
		}
	}

	function cancel() {
		options?.onCancel?.();
		close();
	}

	return {
		get isOpen() {
			return open;
		},
		get opts() {
			return options;
		},
		show,
		close,
		confirm,
		cancel
	};
}

export const confirm = createConfirmStore();
