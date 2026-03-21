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
} from '$lib/services/editor/index.js';

export function createEditorRuntime(deps: EditorRuntimeDependencies) {
	let editor: Monaco.editor.IStandaloneCodeEditor | undefined;
	let instance: typeof Monaco | undefined;

	let session: CollaborationSession | null | undefined;
	let ydoc: Y.Doc | undefined;
	let snapshotTimer: ReturnType<typeof setTimeout> | undefined;

	let synced = false;
	const seeds = new Set<string>();
	const bindings = new Map<string, ModelBinding>();

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
		});
	}

	function setupStatusListeners() {
		if (!editor) return;
		editor.onDidChangeCursorPosition(() => deps.onStatusSync());
		editor.onDidChangeModel(() => deps.onStatusSync());
	}

	function persistYDocSnapshot(nextYDoc: Y.Doc) {
		const project = deps.getProject();
		for (const file of project.files) {
			const content = nextYDoc.getText(file.name).toString();
			deps.onPersist({
				activePath: deps.toWebPath(file.name),
				projectFileName: file.name,
				content
			});
		}
	}

	function scheduleSnapshotPersist(nextYDoc: Y.Doc) {
		clearTimeout(snapshotTimer);
		snapshotTimer = setTimeout(() => {
			persistYDocSnapshot(nextYDoc);
		}, 1200);
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
				scheduleSnapshotPersist(ydoc ?? session!.ydoc);
			},
			onYDocUpdate: (nextYDoc: Y.Doc, origin: unknown) => {
				if (!synced || origin === 'seed') return;
				const activePath = deps.getActivePath();
				if (!activePath) return;

				const projectFileName = deps.toProjectFile(activePath);
				const content = nextYDoc.getText(projectFileName).toString();

				deps.onPersist({
					activePath,
					projectFileName,
					content
				});

				scheduleSnapshotPersist(nextYDoc);
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
		clearTimeout(snapshotTimer);
		destroyModelBindings(bindings);
		session?.provider.destroy();
		session?.leaveRoom();
		editor?.dispose();
	}

	return {
		initialize,
		getEditor,
		syncActiveEditorModel,
		cleanup
	};
}
