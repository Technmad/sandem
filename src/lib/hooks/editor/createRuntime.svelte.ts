import * as Y from 'yjs';
import type * as Monaco from 'monaco-editor';
import type { IDEProject } from '$types/projects.js';
import type { EditorRuntimeDependencies } from '$types/hooks.js';
import {
	createCollaboration,
	type CollaborationSession,
	type ModelBinding,
	destroyModelBindings,
	createOfflineModels,
	createModelForPath,
	createMonacoInstance,
	MONACO_OPTIONS
} from '$lib/services';

export function createEditorRuntime(deps: EditorRuntimeDependencies) {
	let editor: Monaco.editor.IStandaloneCodeEditor | undefined;
	let instance: typeof Monaco | undefined;

	let session: CollaborationSession | null | undefined;
	let ydoc: Y.Doc | undefined;
	let persistTimer: ReturnType<typeof setTimeout> | undefined;
	const lastPersistedByFile = new Map<string, string>();
	let persistFlushCount = 0;
	let persistedFileCount = 0;

	let synced = false;
	const seeds = new Set<string>();
	const bindings = new Map<string, ModelBinding>();
	const editorDisposables: Monaco.IDisposable[] = [];

	function registerEditorDisposable(disposable: Monaco.IDisposable | undefined) {
		if (!disposable) return;
		editorDisposables.push(disposable);
	}

	function disposeEditorDisposables() {
		while (editorDisposables.length > 0) {
			const disposable = editorDisposables.pop();
			try {
				disposable?.dispose();
			} catch {
				// ignore listener disposal issues during teardown
			}
		}
	}

	function getEditor() {
		return editor;
	}

	function syncActiveEditorModel() {
		if (!editor || !instance) return;
		const activePath = deps.getActivePath();

		if (!activePath) {
			editor.setModel(null);
			return;
		}

		createModelForPath({
			path: activePath,
			instance,
			editor,
			bindings,
			readFile: deps.readFile
		});
	}

	function seedProjectFromConvex() {
		if (!ydoc) return;
		const project: IDEProject = deps.getProject();

		ydoc.transact(() => {
			for (const file of project.files) {
				if (seeds.has(file.name)) continue;
				const ytext = ydoc!.getText(file.name);
				if (ytext.length === 0 && file.contents) {
					ytext.insert(0, file.contents);
				}
				seeds.add(file.name);
			}
		}, 'seed');
	}

	function setupOfflineModels() {
		if (!instance || !editor) return;
		const project: IDEProject = deps.getProject();

		createOfflineModels({ project, instance, bindings, toWebPath: deps.toWebPath });

		syncActiveEditorModel();
		deps.onStatusSync();

		registerEditorDisposable(
			editor.onDidChangeModelContent(() => {
				const activePath = deps.getActivePath();
				if (!activePath || !editor) return;

				const content = editor.getValue();
				deps.onStatusSync();
				deps.onPersist({
					activePath,
					projectFileName: deps.toProjectFile(activePath),
					content
				});
			})
		);
	}

	function setupStatusListeners() {
		if (!editor) return;
		registerEditorDisposable(editor.onDidChangeCursorPosition(() => deps.onStatusSync()));
		registerEditorDisposable(editor.onDidChangeModel(() => deps.onStatusSync()));
	}

	function seedPersistSignatures(nextYDoc: Y.Doc) {
		lastPersistedByFile.clear();
		const project = deps.getProject();
		for (const file of project.files) {
			lastPersistedByFile.set(file.name, nextYDoc.getText(file.name).toString());
		}
	}

	function persistChangedYDocFiles(nextYDoc: Y.Doc) {
		const project = deps.getProject();
		let changedFiles = 0;
		const payloads: Array<{
			activePath: string;
			projectFileName: string;
			content: string;
		}> = [];
		for (const file of project.files) {
			const fileName = file.name;
			const content = nextYDoc.getText(fileName).toString();
			const previous = lastPersistedByFile.get(fileName);
			if (previous === content) continue;

			lastPersistedByFile.set(fileName, content);
			changedFiles += 1;
			payloads.push({
				activePath: deps.toWebPath(fileName),
				projectFileName: fileName,
				content
			});
		}

		return {
			payloads,
			changedFiles,
			totalFiles: project.files.length
		};
	}

	function scheduleChangedFilesPersist(nextYDoc: Y.Doc) {
		clearTimeout(persistTimer);
		persistTimer = setTimeout(() => {
			const metrics = persistChangedYDocFiles(nextYDoc);

			if (metrics.payloads.length > 0) {
				if (deps.onPersistBatch) {
					deps.onPersistBatch(metrics.payloads);
				} else {
					for (const payload of metrics.payloads) {
						deps.onPersist(payload);
					}
				}
			}

			persistFlushCount += 1;
			persistedFileCount += metrics.changedFiles;

			if (
				typeof window !== 'undefined' &&
				window.localStorage.getItem('sandem.debug.editor') === '1'
			) {
				console.debug('[EditorPersist]', {
					flush: persistFlushCount,
					changedFiles: metrics.changedFiles,
					totalFiles: metrics.totalFiles,
					persistedFileCount
				});
			}
		}, 900);
	}

	function setupCollaborativeModels() {
		if (!instance || !editor) return;
		const project = deps.getProject();
		if (!project.room) return;

		session = createCollaboration({
			project,
			editor,
			instance,
			bindings,
			toWebPath: deps.toWebPath,
			seedProjectFromConvex: () => {
				if (synced) return;
				synced = true;
				seedProjectFromConvex();
				seedPersistSignatures(ydoc ?? session!.ydoc);
			},
			onYDocUpdate: (nextYDoc: Y.Doc, origin: unknown) => {
				if (!synced || origin === 'seed') return;
				scheduleChangedFilesPersist(nextYDoc);
			}
		});

		if (!session) return;
		ydoc = session.ydoc;

		syncActiveEditorModel();
		deps.onStatusSync();
	}

	async function initialize(element: HTMLDivElement) {
		instance = await createMonacoInstance();
		if (!instance) {
			throw new Error('Monaco failed to initialize.');
		}
		const monaco = instance;
		editor = monaco.editor.create(element, MONACO_OPTIONS);

		setupStatusListeners();

		if (!deps.getProject().room) {
			setupOfflineModels();
			deps.onStatusSync();
			return;
		}

		setupCollaborativeModels();
	}

	function cleanup() {
		clearTimeout(persistTimer);
		lastPersistedByFile.clear();
		persistFlushCount = 0;
		persistedFileCount = 0;
		disposeEditorDisposables();
		destroyModelBindings(bindings);
		session?.dispose();
		session?.provider.destroy();
		session?.leaveRoom();
		session = null;
		ydoc = undefined;
		editor?.dispose();
		editor = undefined;
		instance = undefined;
	}

	return {
		initialize,
		getEditor,
		syncActiveEditorModel,
		cleanup
	};
}
