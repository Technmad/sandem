import type { WebContainer } from '@webcontainer/api';
import type * as Monaco from 'monaco-editor';
import type { TabId } from '$lib/stores';
import type { IDEProject } from '$types/projects.js';
import type {
	FileNode,
	ChangeItem,
	SearchMatch,
	EditorStatusSnapshot,
	EditorPersistPayload
} from './editor.js';

export type FileTreeController = {
	tree: FileNode[];
	refresh: (options?: { silent?: boolean }) => Promise<void>;
	startAutoRefresh: (intervalMs?: number) => void;
	stopAutoRefresh: () => void;
	toggleDir: (path: string) => void;
	isExpanded: (path: string) => boolean;
};

export type ProjectSyncController = {
	start: () => void;
	stop: () => void;
	canWrite: () => boolean;
	createFile: (path: string, contents: string) => Promise<void>;
	createDirectory: (path: string) => Promise<void>;
	renamePath: (path: string, nextPath: string) => Promise<void>;
	deletePath: (path: string) => Promise<void>;
	upsertFile: (path: string, contents: string) => Promise<void>;
};

export type ExplorerActivityDeps = {
	getWebcontainer: () => WebContainer;
	getEntryPath: () => string;
	getActiveTabPath: () => string | null;
	openFile: (path: string) => void;
	fileTree: FileTreeController;
	projectSync: ProjectSyncController;
};

export type SearchActivityDeps = {
	getWebcontainer: () => WebContainer;
	getEntryPath: () => string;
	getActiveTabPath: () => string | null;
	openFile: (path: string) => void;
};

export type GitActivityDeps = {
	getWebcontainer: () => WebContainer;
	getEntryPath: () => string;
	getActiveTabPath: () => string | null;
	getProject: (path?: string) => IDEProject;
	openFile: (path: string) => void;
};

export type ActivityPanels = {
	leftPane: boolean;
	upPane?: boolean;
	downPane?: boolean;
	rightPane?: boolean;
};

export type DebugActivityDeps = {
	getWebcontainer: () => WebContainer;
	getEntryPath: () => string;
	getActiveTabPath: () => string | null;
	openFile: (path: string) => void;
	getPanels: () => ActivityPanels | undefined;
};

export type CreateActivityBarControllerOptions = {
	getPanels: () => ActivityPanels;
	getActiveTab: () => TabId;
	setActiveTab: (tab: TabId) => void;
};

export type EditorPanels = {
	leftPane: boolean;
	upPane: boolean;
	downPane: boolean;
	rightPane: boolean;
};

export type CreateEditorShortcutsOptions = {
	getPanels: () => EditorPanels | undefined;
	onOpenSearch: () => void;
	onToggleCommandPalette: () => void;
};

export type EditorStatusStore = {
	updateStatus: (next: EditorStatusSnapshot) => void;
	resetStatus: () => void;
};

export type EditorRuntimeDependencies = {
	getProject: () => IDEProject;
	getActivePath: () => string | null;
	toProjectFile: (path: string) => string;
	toWebPath: (projectFileName: string) => string;
	readFile: (path: string) => Promise<string>;
	onPersist: (payload: EditorPersistPayload) => void;
	onStatusSync: () => void;
};

export type EditorInstance = Monaco.editor.IStandaloneCodeEditor | undefined;
export type SearchResults = SearchMatch[];
export type GitChanges = ChangeItem[];
