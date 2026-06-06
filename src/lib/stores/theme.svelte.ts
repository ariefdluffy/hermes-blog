import { browser } from '$app/environment';

function createThemeStore() {
	let dark = $state(true);

	function applyTheme(isDark: boolean) {
		dark = isDark;
		if (browser) {
			localStorage.setItem('theme', isDark ? 'dark' : 'light');
			document.documentElement.classList.toggle('dark', isDark);
		}
	}

	function toggle() {
		applyTheme(!dark);
	}

	function init() {
		if (!browser) return;
		const saved = localStorage.getItem('theme');
		if (saved === 'light') {
			applyTheme(false);
		} else {
			applyTheme(true);
		}
	}

	// Auto-init on first call in browser
	if (browser) {
		const saved = localStorage.getItem('theme');
		dark = saved !== 'light';
	}

	return {
		get dark() {
			return dark;
		},
		get light() {
			return !dark;
		},
		toggle,
		init,
		applyTheme
	};
}

export const theme = createThemeStore();