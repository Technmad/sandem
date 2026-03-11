import { Files, MagnifyingGlass, GitBranch, Play, type IconComponentProps } from 'phosphor-svelte';
import { type Component } from 'svelte';

export type TabId = 'explorer' | 'search' | 'git' | 'run';

export interface Tool {
	id: TabId;

	// eslint-disable-next-line
	icon: Component<IconComponentProps, {}, ''>;
	label: string;
}

export const tools: Tool[] = [
	{ id: 'explorer', icon: Files, label: 'Explorer' },
	{ id: 'search', icon: MagnifyingGlass, label: 'Search' },
	{ id: 'git', icon: GitBranch, label: 'Source Control' },
	{ id: 'run', icon: Play, label: 'Run & Debug' }
];

// Single $state instance shared across the whole app
export const activity = $state({ tab: 'explorer' as TabId });
