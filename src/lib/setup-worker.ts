import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';

export function setupMonacoWorkers() {
	if (typeof self !== 'undefined') {
		self.MonacoEnvironment = {
			getWorker: function (_moduleId: string, label: string) {
				if (label === 'typescript' || label === 'javascript') return new tsWorker();
				if (label === 'json') return new jsonWorker();
				if (label === 'html') return new htmlWorker();
				return new editorWorker();
			}
		};
	}
}
