export type FileNode = {
	name: string;
	path: string;
	type: 'file' | 'directory';
	children?: FileNode[];
	depth: number;
};

export type FileTreeItem = {
	name: string;
	type: 'file' | 'folder';
	isOpen?: boolean;
	children?: FileTreeItem[];
};

export type QuickAction = {
	readonly label: string;
	readonly keys: readonly string[];
};

export type SearchMatch = {
	path: string;
	line: number;
	preview: string;
};

export type ChangeKind = 'modified' | 'new' | 'deleted';

export type ChangeItem = {
	path: string;
	type: ChangeKind;
	staged?: boolean;
};

export type EditorStatusSnapshot = {
	line: number;
	column: number;
	indentation: string;
	eol: 'LF' | 'CRLF';
	encoding: string;
	language: string;
};

export type EditorPersistPayload = {
	activePath: string;
	projectFileName: string;
	content: string;
};

export type EditorPersistBatchPayload = EditorPersistPayload[];
