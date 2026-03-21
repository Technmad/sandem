import loader from '@monaco-editor/loader';
import type * as Monaco from 'monaco-editor';

export const MONACO_OPTIONS: Monaco.editor.IStandaloneEditorConstructionOptions = {
	theme: 'vs-dark',
	automaticLayout: true,
	minimap: { enabled: true },
	fontSize: 13,
	lineHeight: 20,
	fontFamily: "'Cascadia Code', 'Fira Code', 'SF Mono', monospace",
	fontLigatures: true,
	padding: { top: 12, bottom: 12 },
	scrollbar: {
		verticalScrollbarSize: 6,
		horizontalScrollbarSize: 6
	},
	renderLineHighlight: 'gutter',
	cursorBlinking: 'smooth',
	cursorSmoothCaretAnimation: 'on',
	smoothScrolling: true,
	roundedSelection: true
};

export async function createMonacoInstance() {
	const vsPath = import.meta.env.DEV
		? '/node_modules/monaco-editor/dev/vs'
		: '/node_modules/monaco-editor/min/vs';

	(loader as unknown as { config: (cfg: object) => void }).config({
		paths: { vs: vsPath }
	});

	const rawLoader = loader as unknown as { init: () => Promise<typeof Monaco> };
	return rawLoader.init();
}
