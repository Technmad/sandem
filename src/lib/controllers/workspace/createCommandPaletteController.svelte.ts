import type { TabId } from '$lib/stores/activity/activityStore.svelte.js';
import type { CommandItem } from '$types/commands.js';
import type { ActivityPanels } from '$types/hooks.js';

type Options = {
	navigate: (path: string) => void;
	getPanels: () => ActivityPanels | undefined;
	setActivityTab: (tab: TabId) => void;
};

export function createCommandPaletteController(options: Options) {
	let isOpen = $state(false);
	let query = $state('');
	let selectedIndex = $state(0);

	function withPanels(mutator: (panels: ActivityPanels) => void) {
		const panels = options.getPanels();
		if (!panels) return;
		mutator(panels);
	}

	function setActivity(tab: TabId) {
		options.setActivityTab(tab);
		withPanels((panels) => {
			panels.leftPane = true;
		});
	}

	const commands: CommandItem[] = [
		{
			id: 'repo',
			label: 'Go to Repo',
			shortcut: 'Ctrl+1',
			keywords: ['navigate', 'workspace'],
			run: () => options.navigate('/repo')
		},
		{
			id: 'shop',
			label: 'Go to Shop',
			shortcut: 'Ctrl+2',
			keywords: ['navigate'],
			run: () => options.navigate('/shop')
		},
		{
			id: 'auth',
			label: 'Go to Auth',
			shortcut: 'Ctrl+3',
			keywords: ['navigate', 'login'],
			run: () => options.navigate('/auth')
		},
		{
			id: 'toggle-left',
			label: 'Toggle Sidebar',
			shortcut: 'Ctrl+B',
			keywords: ['panel', 'left'],
			run: () => withPanels((panels) => (panels.leftPane = !panels.leftPane))
		},
		{
			id: 'toggle-bottom',
			label: 'Toggle Terminal Panel',
			shortcut: 'Ctrl+J',
			keywords: ['panel', 'terminal'],
			run: () => withPanels((panels) => (panels.downPane = !panels.downPane))
		},
		{
			id: 'toggle-right',
			label: 'Toggle Preview',
			keywords: ['panel', 'right'],
			run: () => withPanels((panels) => (panels.rightPane = !panels.rightPane))
		},
		{
			id: 'explorer',
			label: 'Focus Explorer',
			shortcut: 'Alt+1',
			keywords: ['activity'],
			run: () => setActivity('explorer')
		},
		{
			id: 'search',
			label: 'Focus Search',
			shortcut: 'Alt+2',
			keywords: ['activity'],
			run: () => setActivity('search')
		},
		{
			id: 'git',
			label: 'Focus Source Control',
			shortcut: 'Alt+3',
			keywords: ['activity'],
			run: () => setActivity('git')
		},
		{
			id: 'run',
			label: 'Focus Run and Debug',
			shortcut: 'Alt+4',
			keywords: ['activity'],
			run: () => setActivity('run')
		}
	];

	const filtered = $derived(
		commands.filter((command) => {
			if (!query.trim()) return true;
			const haystack = [command.label, command.description ?? '', ...(command.keywords ?? [])]
				.join(' ')
				.toLowerCase();
			return haystack.includes(query.trim().toLowerCase());
		})
	);

	$effect(() => {
		if (!isOpen) {
			selectedIndex = 0;
			query = '';
		}
	});

	function openPalette() {
		isOpen = true;
	}

	function closePalette() {
		isOpen = false;
	}

	function togglePalette() {
		isOpen = !isOpen;
	}

	function setQuery(value: string) {
		query = value;
	}

	function setSelectedIndex(index: number) {
		selectedIndex = index;
	}

	function execute(command: CommandItem) {
		command.run();
		closePalette();
	}

	function onResultKeydown(event: KeyboardEvent) {
		if (!isOpen) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, Math.max(filtered.length - 1, 0));
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
			return;
		}

		if (event.key === 'Enter') {
			event.preventDefault();
			const command = filtered[selectedIndex];
			if (command) execute(command);
		}
	}

	function mount() {
		const onKeyDown = (event: KeyboardEvent) => {
			const mod = event.ctrlKey || event.metaKey;
			if (mod && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				togglePalette();
				return;
			}

			if (event.key === 'Escape' && isOpen) {
				event.preventDefault();
				closePalette();
			}
		};

		const onToggleEvent = () => {
			togglePalette();
		};

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('app:command-palette:toggle', onToggleEvent);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('app:command-palette:toggle', onToggleEvent);
		};
	}

	return {
		get isOpen() {
			return isOpen;
		},
		get query() {
			return query;
		},
		get selectedIndex() {
			return selectedIndex;
		},
		get filtered() {
			return filtered;
		},
		openPalette,
		closePalette,
		setQuery,
		setSelectedIndex,
		execute,
		onResultKeydown,
		mount
	};
}
