import type { TabId } from '$lib/stores/activity/activityStore.svelte.js';
import type { MenuAction, MenuCommand } from '$types/commands.js';

type Options = {
	navigate: (path: string) => void;
	setActivityTab: (tab: TabId) => void;
	toggleLeftPane: () => void;
	toggleDownPane: () => void;
	toggleRightPane: () => void;
	openDownPane: () => void;
	openCommandPalette: () => void;
	openReadme: () => void;
};

export function createMenuController(options: Options) {
	let openMenu = $state<string | null>(null);
	let highlighted = $state(0);

	const menuActions: Record<string, MenuAction[]> = {
		File: [
			{ label: 'Go to Repo', hint: 'Ctrl+1', run: () => options.navigate('/repo') },
			{ label: 'Go to Shop', hint: 'Ctrl+2', run: () => options.navigate('/shop') },
			{ label: 'Go to Auth', hint: 'Ctrl+3', run: () => options.navigate('/auth') }
		],
		Edit: [
			{
				label: 'Open Command Palette',
				hint: 'Ctrl+K',
				run: options.openCommandPalette
			},
			{ label: 'Focus Explorer', hint: 'Alt+1', run: () => options.setActivityTab('explorer') },
			{ label: 'Focus Search', hint: 'Alt+2', run: () => options.setActivityTab('search') }
		],
		Selection: [
			{ label: 'Run & Debug', hint: 'Alt+4', run: () => options.setActivityTab('run') },
			{ label: 'Source Control', hint: 'Alt+3', run: () => options.setActivityTab('git') }
		],
		View: [
			{ label: 'Toggle Sidebar', hint: 'Ctrl+B', run: options.toggleLeftPane },
			{ label: 'Toggle Panel', hint: 'Ctrl+J', run: options.toggleDownPane },
			{ label: 'Toggle Preview', run: options.toggleRightPane }
		],
		Go: [
			{ label: 'Home', run: () => options.navigate('/') },
			{ label: 'Repo', run: () => options.navigate('/repo') },
			{ label: 'Shop', run: () => options.navigate('/shop') }
		],
		Run: [{ label: 'Start Debug View', run: () => options.setActivityTab('run') }],
		Terminal: [
			{ label: 'Open Terminal Panel', run: options.openDownPane },
			{ label: 'Toggle Terminal Panel', run: options.toggleDownPane }
		],
		Help: [{ label: 'Project README', run: options.openReadme }]
	};

	const activeItems = $derived(
		(menuActions[openMenu ?? ''] ?? []).filter(
			(item): item is Exclude<MenuAction, { separator: true }> => !('separator' in item)
		)
	);

	function toggleMenu(menu: string) {
		if (openMenu === menu) {
			openMenu = null;
			return;
		}

		openMenu = menu;
		highlighted = 0;
	}

	function closeMenu() {
		openMenu = null;
		highlighted = 0;
	}

	function execute(item: MenuCommand) {
		item.run();
		closeMenu();
	}

	function onItemHover(index: number) {
		highlighted = index;
	}

	function onMenuHover(menu: string) {
		if (!openMenu) return;
		openMenu = menu;
		highlighted = 0;
	}

	function mount(isInsideRoot: (target: EventTarget | null) => boolean) {
		const onPointerDown = (event: MouseEvent) => {
			if (!openMenu) return;
			if (isInsideRoot(event.target)) return;
			closeMenu();
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (!openMenu) return;
			if (event.key === 'Escape') {
				event.preventDefault();
				closeMenu();
				return;
			}

			if (event.key === 'ArrowDown') {
				event.preventDefault();
				highlighted = Math.min(highlighted + 1, Math.max(activeItems.length - 1, 0));
				return;
			}

			if (event.key === 'ArrowUp') {
				event.preventDefault();
				highlighted = Math.max(highlighted - 1, 0);
				return;
			}

			if (event.key === 'Enter') {
				event.preventDefault();
				const candidate = activeItems[highlighted];
				if (candidate) execute(candidate);
			}
		};

		window.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('keydown', onKeyDown);

		return () => {
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('keydown', onKeyDown);
		};
	}

	return {
		get openMenu() {
			return openMenu;
		},
		get highlighted() {
			return highlighted;
		},
		get menuActions() {
			return menuActions;
		},
		toggleMenu,
		closeMenu,
		execute,
		onItemHover,
		onMenuHover,
		mount
	};
}
