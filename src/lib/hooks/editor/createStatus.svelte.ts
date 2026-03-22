import type * as Monaco from 'monaco-editor';
import type { EditorStatusStore } from '../../../types/hooks.js';

export function getPrimaryModifierKeyLabel(platform?: string): 'Ctrl' | 'Cmd' {
	const value = (platform ?? '').toLowerCase();
	return value.includes('mac') ? 'Cmd' : 'Ctrl';
}

export function toPlatformShortcutKeyLabel(key: string, platform?: string): string {
	if (key !== 'Ctrl') return key;
	return getPrimaryModifierKeyLabel(platform);
}

export function toStatusLanguage(languageId: string | undefined): string {
	if (!languageId) return 'Plain Text';

	const pretty = {
		plaintext: 'Plain Text',
		typescript: 'TypeScript',
		javascript: 'JavaScript',
		ts: 'TypeScript',
		js: 'JavaScript',
		svelte: 'Svelte',
		html: 'HTML',
		css: 'CSS',
		json: 'JSON',
		markdown: 'Markdown'
	} as const;

	return pretty[languageId as keyof typeof pretty] ?? languageId.toUpperCase();
}

export function createEditorStatus(store: EditorStatusStore) {
	function syncFromEditor(editor: Monaco.editor.IStandaloneCodeEditor | undefined) {
		if (!editor) return;

		const model = editor.getModel();
		if (!model) {
			store.resetStatus();
			return;
		}

		const position = editor.getPosition();
		const options = model.getOptions();

		store.updateStatus({
			line: position?.lineNumber ?? 1,
			column: position?.column ?? 1,
			indentation: options.insertSpaces
				? `Spaces: ${options.tabSize}`
				: `Tab Size: ${options.tabSize}`,
			eol: model.getEOL() === '\r\n' ? 'CRLF' : 'LF',
			encoding: 'UTF-8',
			language: toStatusLanguage(model.getLanguageId())
		});
	}

	return {
		syncFromEditor
	};
}
