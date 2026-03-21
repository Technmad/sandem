export type RightPaneTab = 'vscode' | 'chat';

export function createRightPaneController(defaultTab: RightPaneTab = 'vscode') {
	let tab = $state<RightPaneTab>(defaultTab);

	function setTab(next: RightPaneTab) {
		tab = next;
	}

	return {
		get tab() {
			return tab;
		},
		setTab
	};
}
