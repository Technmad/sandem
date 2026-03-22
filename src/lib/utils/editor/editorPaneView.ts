import type { EditorTab } from '$lib/stores';
import type { AutoSaveStatus } from '$lib/services/editor/createAutoSaver.svelte.js';
import type { QuickAction } from '$types/editor.js';

export type SaveStatusVariant = '' | 'saved' | 'saving' | 'unsaved' | 'session' | 'error';

const STATUS_TO_VARIANT: Record<AutoSaveStatus, SaveStatusVariant> = {
	Saved: 'saved',
	'Saving...': 'saving',
	'Unsaved changes': 'unsaved',
	'Session only': 'session',
	'Save failed': 'error'
};

export function deriveEditorSaveStatusVariant(
	status: AutoSaveStatus | undefined
): SaveStatusVariant {
	if (!status) return '';
	return STATUS_TO_VARIANT[status];
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
