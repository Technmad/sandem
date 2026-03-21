/**
 * Pure functional controller for AppHeader state and behavior
 * This keeps all business logic separate from the UI
 */

import type { HeaderConfig, HeaderLink } from '$lib/config/header.js';

export interface HeaderActions {
	onSearch: (query: string) => void | Promise<void>;
	onNavigate: (path: string) => void | Promise<void>;
}

export interface HeaderState {
	config: HeaderConfig;
	globalQuery: string;
	isRepoRoute: boolean;
}

/**
 * Pure function to determine if repo-specific UI should be shown
 */
export const shouldShowMenuBar = (isRepoRoute: boolean): boolean => {
	return isRepoRoute;
};

export const shouldShowCommandPalette = (isRepoRoute: boolean): boolean => {
	return isRepoRoute;
};

/**
 * Pure function to filter header links based on route context
 */
export const filterHeaderLinks = (links: HeaderLink[], isRepoRoute: boolean): HeaderLink[] => {
	if (!isRepoRoute) {
		// Optionally filter links for non-repo routes
		return links;
	}
	return links;
};

/**
 * Create initial header state
 */
export const createHeaderState = (config: HeaderConfig, isRepoRoute: boolean): HeaderState => ({
	config,
	globalQuery: '',
	isRepoRoute
});

/**
 * Handle global search (returns action to execute)
 */
export const handleGlobalSearch = (query: string, onSearch: HeaderActions['onSearch']) => {
	const trimmedQuery = query.trim();
	if (!trimmedQuery) return;
	onSearch(trimmedQuery);
};
