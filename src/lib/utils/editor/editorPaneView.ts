import type { EditorTab } from '$lib/stores/editor/editorStore.svelte.js';
import type { QuickAction } from '$types/editor.js';

export type SaveStatusVariant = '' | 'saved' | 'saving' | 'error';

export function deriveEditorSaveStatusVariant(status: string | undefined): SaveStatusVariant {
	const value = status?.toLowerCase();
	if (!value) return '';
	if (value.includes('error')) return 'error';
	if (value.includes('saving')) return 'saving';
	return 'saved';
}

export function shouldShowEmptyEditorState(
	tabs: readonly EditorTab[],
	activeTabPath: string | null
): boolean {
	return tabs.length === 0 || !activeTabPath;
}

export function deriveEditorTabItems(
	tabs: readonly EditorTab[],
	isActive: (path: string) => boolean
) {
	return tabs.map((tab) => ({
		id: tab.path,
		label: tab.label,
		active: isActive(tab.path),
		closable: true
	}));
}

export const EDITOR_QUICK_ACTIONS: readonly QuickAction[] = [
	{ label: 'Focus Search', keys: ['Ctrl', 'Alt', 'I'] },
	{ label: 'Show All Commands', keys: ['Ctrl', 'Shift', 'P'] },
	{ label: 'Toggle Terminal', keys: ['Ctrl', '`'] }
];
