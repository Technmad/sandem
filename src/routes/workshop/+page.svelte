<script lang="ts">
	import {
		File,
		Search,
		GitBranch,
		Bug,
		Monitor,
		Boxes,
		FlaskConical,
		Container,
		Settings
	} from '@lucide/svelte';
	import Editor from '$lib/components/ide/Editor.svelte';

	const menus: string[] = [
		'file',
		' edit',
		' selection ',
		'view',
		' go',
		' run',
		' terminal',
		' help',
		' docs'
	];
</script>

<div class="header">
	<menu>
		{#each menus as menu}
			<li>{menu}</li>
		{/each}
	</menu>
	<div class="search">
		<input placeholder="search" type="search" name="search bar" />
	</div>
	<div class="actions">
		<button>😊</button>
		<button>😣</button>
		<button>😅</button>
	</div>
</div>

<div class="sidebar">
	<nav>
		<button><File /></button>
		<button><Search /></button>
		<button><GitBranch /></button>
		<button><Bug /></button>
		<button><Monitor /></button>
		<button><Boxes /></button>
		<button><FlaskConical /></button>
		<button><Container /></button>
		<a href="/home"><Settings /></a>
	</nav>
	<form>
		<header>________explorer________</header>
		<div>________project________</div>
	</form>
</div>

<div class="main">
	<article class="editor">
		<Editor />
	</article>
	<article class="terminal">
		<header></header>
	</article>
	<aside class="preview">
		<header><input placeholder="./project/index.html" type="search" name="search bar" /></header>
		<footer></footer>
	</aside>
</div>

<div class="footer">footer</div>

<style>
	:global(main) {
		--nav-width: 2rem;
		--menu-items: 9;

		display: grid;
		grid-template-columns: auto 1fr; /* 2 cols */
		grid-template-rows: auto 1fr auto; /* 3 rows */
		grid-template-areas:
			'header header'
			'sidebar main'
			'footer footer';
	}

	.header {
		grid-area: header;
		height: var(--nav-width);
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
	}

	menu {
		display: grid;
		grid-template-columns: repeat(var(--menu-items), 4rem);
		grid-row: var(--nav-width);
		gap: 1rem;
	}
	li {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.search {
		display: flex;
		padding: 0 4rem;
		justify-content: center;
	}
	.actions {
		display: flex;
		flex-direction: row-reverse;
	}
	.sidebar {
		display: flex;
		grid-area: sidebar;
		width: 16rem;

		border-right: 1px solid white;
	}
	.sidebar nav {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 1rem 0;
		width: 4rem;

		border-right: 1px solid white;
	}
	.sidebar a {
		margin-top: auto;
	}
	.main {
		grid-area: main;

		display: grid;
		grid-template-areas:
			'editor editor preview'
			'terminal terminal preview';
	}

	.editor {
		grid-area: editor;
		border: 1px solid white;
		background: red;
	}
	.terminal {
		grid-area: terminal;
		border: 1px solid white;
		background: blue;
	}
	.preview {
		grid-area: preview;
		border: 1px solid white;
		background: green;
	}

	.footer {
		grid-area: footer;
	}
</style>
