import type { CreateEditorShortcutsOptions } from '../../../types/hooks.js';

export function createEditorShortcuts(options: CreateEditorShortcutsOptions) {
	function onKeyDown(event: KeyboardEvent) {
		const mod = event.ctrlKey || event.metaKey;
		if (!mod) return;

		if (event.shiftKey && event.key.toLowerCase() === 'p') {
			event.preventDefault();
			options.onToggleCommandPalette();
			return;
		}

		if (event.altKey && event.key.toLowerCase() === 'i') {
			event.preventDefault();
			options.onOpenSearch();
			const panels = options.getPanels();
			if (panels) panels.leftPane = true;
			return;
		}

		if (event.key === '`') {
			event.preventDefault();
			const panels = options.getPanels();
			if (panels) panels.downPane = !panels.downPane;
		}
	}

	function mount() {
		window.addEventListener('keydown', onKeyDown);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
		};
	}

	return {
		mount
	};
}
