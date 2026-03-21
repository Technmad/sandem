/**
 * Static header configuration data
 * Pure data structures that define the app header's content
 */

export interface HeaderLink {
	path: string;
	label: string;
	id?: string;
}

export interface HeaderItem {
	id: string;
	label: string;
	hint?: string;
	separator?: boolean;
}

export const DEFAULT_HEADER_LINKS: HeaderLink[] = [
	{ path: '/repo', label: 'repo', id: 'nav-repo' },
	{ path: '/shop', label: 'shop', id: 'nav-shop' },
	{ path: '/auth', label: 'auth', id: 'nav-auth' }
];

export const MENU_ITEMS = ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'];

export interface HeaderConfig {
	links: HeaderLink[];
	menus: string[];
	showMenuBar: boolean;
	showCommandPalette: boolean;
	showPanelControls: boolean;
	showSearch: boolean;
}

/**
 * Create header config based on route context
 * Pure function - no side effects
 */
export const createHeaderConfig = (isRepoRoute: boolean): HeaderConfig => ({
	links: DEFAULT_HEADER_LINKS,
	menus: MENU_ITEMS,
	showMenuBar: isRepoRoute,
	showCommandPalette: isRepoRoute,
	showPanelControls: isRepoRoute,
	showSearch: !isRepoRoute
});
