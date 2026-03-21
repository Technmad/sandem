import type { TabId } from '$lib/stores/activity/activityStore.svelte.js';
import type { CreateActivityBarControllerOptions } from '../../../types/hooks.js';

const LETTER_SHORTCUTS = {
	e: 'explorer',
	f: 'search',
	g: 'git',
	d: 'run'
} as const satisfies Record<string, TabId>;

const NUMBER_SHORTCUTS = {
	'1': 'explorer',
	'2': 'search',
	'3': 'git',
	'4': 'run'
} as const satisfies Record<string, TabId>;

function isTypingTarget(target: EventTarget | null): boolean {
	const el = target as HTMLElement | null;
	if (!el) return false;
	return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

export function createActivityBarController(options: CreateActivityBarControllerOptions) {
	function selectTab(id: TabId) {
		const panels = options.getPanels();
		if (options.getActiveTab() === id) {
			panels.leftPane = !panels.leftPane;
			return;
		}

		options.setActiveTab(id);
		panels.leftPane = true;
	}

	function toggleSettingsPanel() {
		const panels = options.getPanels();
		if (typeof panels.rightPane !== 'boolean') return;
		panels.rightPane = !panels.rightPane;
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.defaultPrevented) return;
		if (isTypingTarget(event.target)) return;

		const mod = event.ctrlKey || event.metaKey;

		if (mod && event.shiftKey) {
			const tab = LETTER_SHORTCUTS[event.key.toLowerCase() as keyof typeof LETTER_SHORTCUTS];
			if (!tab) return;
			event.preventDefault();
			selectTab(tab);
			return;
		}

		if (!event.altKey) return;
		const tab = NUMBER_SHORTCUTS[event.key as keyof typeof NUMBER_SHORTCUTS];
		if (!tab) return;
		event.preventDefault();
		selectTab(tab);
	}

	function mountShortcuts() {
		window.addEventListener('keydown', onKeyDown);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
		};
	}

	return {
		selectTab,
		toggleSettingsPanel,
		mountShortcuts
	};
}
