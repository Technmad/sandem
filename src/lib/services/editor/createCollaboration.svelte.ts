import { getLiveblocksClient } from '$lib/liveblocks.config.js';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { LiveblocksYjsProvider } from '@liveblocks/yjs';
import type * as Monaco from 'monaco-editor';
import type { Awareness } from 'y-protocols/awareness.js';
import { getLanguage } from '$lib/utils/editor/language.js';
import type { IDEProject } from '$types/projects.js';
import type { EditorRuntimeDependencies } from '$types/hooks.js';
import type { ModelBinding } from './createModelBindings.svelte.js';
import {
	resetCollaborationStores,
	setCollaborationPermissions,
	setCollaborationPresence,
	type CollaborationRole
} from '$lib/stores/collaboration/collaborationStore.svelte.js';

type SetupCollaborationOptions = {
	project: IDEProject;
	editor: Monaco.editor.IStandaloneCodeEditor;
	instance: typeof Monaco;
	bindings: Map<string, ModelBinding>;
	toWebPath: EditorRuntimeDependencies['toWebPath'];
	seedProjectFromConvex: () => void;
	onYDocUpdate: (ydoc: Y.Doc, origin: unknown) => void;
};

export type CollaborationSession = {
	provider: LiveblocksYjsProvider;
	ydoc: Y.Doc;
	leaveRoom: () => void;
};

function deriveRole(role: CollaborationRole | undefined, canWrite: boolean): CollaborationRole {
	if (role) return role;
	return canWrite ? 'editor' : 'viewer';
}

function asRole(value: unknown): CollaborationRole | undefined {
	if (value === 'owner' || value === 'editor' || value === 'viewer') {
		return value;
	}
	return undefined;
}

function toProjectPath(model: Monaco.editor.ITextModel | null | undefined) {
	const path = model?.uri.path ?? '';
	return path.replace(/^\/+/, '');
}

export function createCollaboration(
	options: SetupCollaborationOptions
): CollaborationSession | null {
	if (!options.project.room) {
		return null;
	}

	const client = getLiveblocksClient();
	const { room, leave } = client.enterRoom(options.project.room, {
		initialPresence: { cursor: null, selection: null }
	});
	const roomUnsubscribers: Array<() => void> = [];
	const editorDisposables: Monaco.IDisposable[] = [];

	const ydoc = new Y.Doc();
	const provider = new LiveblocksYjsProvider(room, ydoc);

	function updatePresenceList() {
		const others = room.getOthers();
		const self = room.getSelf();
		const users = self ? [self, ...others] : [...others];

		setCollaborationPresence(
			users.map((user) => ({
				connectionId: user.connectionId,
				userId: String(user.id),
				name: user.info?.name ?? 'Anonymous',
				avatar: user.info?.avatar ?? '',
				role: deriveRole(asRole(user.info?.role), user.canWrite),
				canWrite: user.canWrite,
				cursor: user.presence?.cursor ?? null,
				selection: user.presence?.selection ?? null
			}))
		);

		if (self) {
			setCollaborationPermissions({
				roomId: options.project.room ?? null,
				role: deriveRole(asRole(self.info?.role), self.canWrite),
				canWrite: self.canWrite
			});
		}
	}

	roomUnsubscribers.push(room.subscribe('my-presence', updatePresenceList));
	roomUnsubscribers.push(room.subscribe('others', updatePresenceList));
	updatePresenceList();

	editorDisposables.push(
		options.editor.onDidChangeCursorPosition((event) => {
			const path = toProjectPath(options.editor.getModel());
			room.updatePresence({
				cursor: {
					path,
					line: event.position.lineNumber,
					column: event.position.column
				}
			});
		})
	);

	editorDisposables.push(
		options.editor.onDidChangeCursorSelection((event) => {
			const path = toProjectPath(options.editor.getModel());
			const selection = event.selection;
			room.updatePresence({
				selection: {
					path,
					startLine: selection.startLineNumber,
					startColumn: selection.startColumn,
					endLine: selection.endLineNumber,
					endColumn: selection.endColumn
				}
			});
		})
	);

	editorDisposables.push(
		options.editor.onDidBlurEditorText(() => {
			room.updatePresence({ cursor: null, selection: null });
		})
	);

	provider.on('sync', (isSynced: boolean) => {
		if (!isSynced) return;
		options.seedProjectFromConvex();
	});

	for (const file of options.project.files) {
		const fullPath = options.toWebPath(file.name);
		const ytext = ydoc.getText(file.name);
		const model = options.instance.editor.createModel('', getLanguage(fullPath));
		const monacoBinding = new MonacoBinding(
			ytext,
			model,
			new Set([options.editor]),
			provider.awareness as unknown as Awareness
		);

		options.bindings.set(fullPath, {
			model,
			destroy: () => monacoBinding.destroy()
		});
	}

	ydoc.on('update', (_update: Uint8Array, origin: unknown) => {
		options.onYDocUpdate(ydoc, origin);
	});

	return {
		provider,
		ydoc,
		leaveRoom: () => {
			for (const unsubscribe of roomUnsubscribers) {
				unsubscribe();
			}
			for (const disposable of editorDisposables) {
				disposable.dispose();
			}
			resetCollaborationStores();
			leave();
		}
	};
}
