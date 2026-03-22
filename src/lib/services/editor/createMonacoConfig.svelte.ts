import loader from '@monaco-editor/loader';
import type * as Monaco from 'monaco-editor';

function toUrlPath(basePath: string, suffix: string) {
	const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
	return `${normalizedBase}${suffix}`.replace(/\/$/, '');
}

function getMonacoVsCandidates() {
	const base = import.meta.env.BASE_URL || '/';
	const candidates = [toUrlPath(base, 'monaco/vs'), '/monaco/vs'];
	return Array.from(new Set(candidates));
}

async function initMonacoWithVsPath(vsPath: string) {
	(loader as unknown as { config: (cfg: object) => void }).config({
		paths: { vs: vsPath }
	});

	const rawLoader = loader as unknown as { init: () => Promise<typeof Monaco> };
	return rawLoader.init();
}

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
	const errors: string[] = [];
	for (const vsPath of getMonacoVsCandidates()) {
		try {
			return await initMonacoWithVsPath(vsPath);
		} catch (error) {
			errors.push(`${vsPath} :: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	throw new Error(`Monaco failed to initialize from configured asset paths. ${errors.join(' | ')}`);
}
