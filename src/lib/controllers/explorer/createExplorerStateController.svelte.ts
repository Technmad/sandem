/**
 * Explorer state controller
 * Manages state for the file tree explorer component
 * - Selection and focus
 * - Renaming and deletion modals
 * - Search/filter
 * - Context menu state
 */

export type ExplorerState = {
	selectedPath: string | null;
	focusedPath: string | null;
	renamingPath: string | null;
	deletingPath: string | null;
	searchQuery: string;
	contextMenuPath: string | null;
	showHidden: boolean;
	lastClickTime: number;
	lastClickPath: string | null;
};

export type ExplorerStateController = ReturnType<typeof createExplorerStateController>;

export function createExplorerStateController() {
	let state = $state<ExplorerState>({
		selectedPath: null,
		focusedPath: null,
		renamingPath: null,
		deletingPath: null,
		searchQuery: '',
		contextMenuPath: null,
		showHidden: false,
		lastClickTime: 0,
		lastClickPath: null
	});

	const DOUBLE_CLICK_THRESHOLD = 300; // ms

	function selectNode(path: string) {
		state.selectedPath = path;
		state.focusedPath = path;
	}

	function focusNode(path: string) {
		state.focusedPath = path;
	}

	function clearSelection() {
		state.selectedPath = null;
		state.focusedPath = null;
	}

	function startRename(path: string) {
		state.renamingPath = path;
	}

	function cancelRename() {
		state.renamingPath = null;
	}

	function startDelete(path: string) {
		state.deletingPath = path;
	}

	function cancelDelete() {
		state.deletingPath = null;
	}

	function setSearchQuery(query: string) {
		state.searchQuery = query;
	}

	function clearSearch() {
		state.searchQuery = '';
	}

	function showContextMenu(path: string) {
		state.contextMenuPath = path;
	}

	function hideContextMenu() {
		state.contextMenuPath = null;
	}

	function toggleHidden() {
		state.showHidden = !state.showHidden;
	}

	/**
	 * Handle single/double click detection
	 * Returns 'single' or 'double'
	 */
	function handleClick(path: string): 'single' | 'double' {
		const now = Date.now();
		const isDouble =
			state.lastClickPath === path && now - state.lastClickTime < DOUBLE_CLICK_THRESHOLD;

		state.lastClickPath = path;
		state.lastClickTime = now;

		return isDouble ? 'double' : 'single';
	}

	function getState() {
		return { ...state };
	}

	function reset() {
		state = {
			selectedPath: null,
			focusedPath: null,
			renamingPath: null,
			deletingPath: null,
			searchQuery: '',
			contextMenuPath: null,
			showHidden: false,
			lastClickTime: 0,
			lastClickPath: null
		};
	}

	return {
		// State getters
		get selectedPath() {
			return state.selectedPath;
		},
		get focusedPath() {
			return state.focusedPath;
		},
		get renamingPath() {
			return state.renamingPath;
		},
		get deletingPath() {
			return state.deletingPath;
		},
		get searchQuery() {
			return state.searchQuery;
		},
		get contextMenuPath() {
			return state.contextMenuPath;
		},
		get showHidden() {
			return state.showHidden;
		},
		get isRenaming() {
			return state.renamingPath !== null;
		},
		get isDeleting() {
			return state.deletingPath !== null;
		},
		get hasSearch() {
			return state.searchQuery.trim().length > 0;
		},
		// State mutations
		selectNode,
		focusNode,
		clearSelection,
		startRename,
		cancelRename,
		startDelete,
		cancelDelete,
		setSearchQuery,
		clearSearch,
		showContextMenu,
		hideContextMenu,
		toggleHidden,
		handleClick,
		getState,
		reset
	};
}
