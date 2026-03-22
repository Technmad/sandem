<script lang="ts">
	import { CloudLightning, Check, X, Bell, User, GitBranch } from '@lucide/svelte';
	import { onDestroy } from 'svelte';
	import { editorStore } from '$lib/stores';
	import { activity } from '$lib/stores';
	import { getPanelsContext } from '$lib/stores';
	import {
		collaborationPresenceStore,
		collaborationPermissionsStore,
		type CollaborationPresence
	} from '$lib/stores';

	interface Props {
		status: string;
		isGuest?: boolean;
	}

	let { status, isGuest = false }: Props = $props();
	const ready = $derived(status.includes('Ready'));

	const panels = getPanelsContext();

	const statusMeta = $derived(editorStore.status);

	const activePath = $derived(editorStore.activeTabPath);
	const activeFile = $derived(activePath?.split('/').at(-1) ?? 'No file');

	let users = $state<CollaborationPresence[]>([]);
	let canWrite = $state(true);
	let role = $state<'owner' | 'editor' | 'viewer' | 'unknown'>('unknown');

	const unsubPresence = collaborationPresenceStore.subscribe((val) => {
		users = val;
	});
	const unsubPermissions = collaborationPermissionsStore.subscribe((val) => {
		canWrite = val.canWrite;
		role = val.role;
	});

	onDestroy(() => {
		unsubPresence();
		unsubPermissions();
	});

	function toggleLeftPane() {
		if (!panels) return;
		panels.leftPane = !panels.leftPane;
	}

	function toggleBottomPane() {
		if (!panels) return;
		panels.downPane = !panels.downPane;
	}

	function cycleActivityTab() {
		const sequence = ['explorer', 'search', 'git', 'run'] as const;
		const idx = sequence.indexOf(activity.tab);
		activity.tab = sequence[(idx + 1) % sequence.length];
		if (panels) panels.leftPane = true;
	}
</script>

<footer class="status-bar" class:ready>
	<div class="status-left">
		<button class="status-item" title="Remote/Container Status" onclick={toggleBottomPane}>
			<CloudLightning size={14} strokeWidth={2} />
			<span>{isGuest ? 'Guest' : canWrite ? 'Collab' : 'Read-only'}</span>
		</button>

		<button
			class="status-item"
			title={activePath ? activePath : 'Git Branch'}
			onclick={cycleActivityTab}
		>
			<GitBranch size={13} strokeWidth={2} />
			<span>{activeFile}</span>
		</button>

		<button class="status-item" title="Sync Status">
			{#if ready}
				<Check size={14} strokeWidth={2.5} />
				<span>{canWrite ? 'Ready' : 'Ready (view)'}</span>
			{:else}
				<span class="spinner"></span>
				<span>{status}</span>
			{/if}
		</button>

		<!-- Placeholder for problems/errors from editors/terminals -->
		<button class="status-item" title="Toggle sidebar" onclick={toggleLeftPane}>
			<X size={13} strokeWidth={2} class="icon-error" />
			<span>0</span>
		</button>
	</div>

	<div class="status-right">
		<button class="status-item" title="Cursor position">
			Ln {statusMeta.line}, Col {statusMeta.column}
		</button>
		<button class="status-item" title="Indentation">{statusMeta.indentation}</button>
		<button class="status-item" title="File Encoding">{statusMeta.encoding}</button>
		<button class="status-item" title="End of Line Sequence">{statusMeta.eol}</button>
		<button class="status-item" title="Select Language Mode">{statusMeta.language}</button>

		<!-- Show avatars and names of users in the room -->
		{#if users.length > 0}
			{#each users as user (user.userId)}
				<span class="status-item user-presence" title={`${user.name} • ${user.role}`}>
					{#if user.avatar}
						<img src={user.avatar} alt={user.name} class="user-avatar" />
					{:else}
						<User size={14} strokeWidth={2} />
					{/if}
					<span class="user-name">{user.name}</span>
				</span>
			{/each}
		{/if}

		<button class="status-item" title="Room role">
			<User size={14} strokeWidth={2} />
			<span>{role}</span>
		</button>

		<button class="status-item" title="Notifications">
			<Bell size={14} strokeWidth={2} />
		</button>
	</div>
</footer>

<style>
	.status-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 22px;
		font-size: 11.5px;
		font-family: var(--fonts);
		color: color-mix(in srgb, var(--bg) 85%, white);
		background: var(--accent);
		padding: 0 8px;
		user-select: none;
	}

	.status-bar:not(.ready) {
		background: var(--border);
		color: var(--text);
	}

	.status-left,
	.status-right {
		display: flex;
		align-items: center;
		height: 100%;
		gap: 2px;
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 4px;
		height: 100%;
		padding: 0 6px;
		background: transparent;
		border: none;
		color: inherit;
		font-family: inherit;
		font-size: inherit;
		cursor: pointer;
		text-decoration: none;
		white-space: nowrap;
	}

	.status-item:hover {
		background: color-mix(in srgb, currentColor 15%, transparent);
	}

	.user-presence {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0 4px;
	}
	.user-avatar {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		object-fit: cover;
		margin-right: 2px;
	}
	.user-name {
		font-size: 11px;
		max-width: 60px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.spinner {
		display: inline-block;
		width: 12px;
		height: 12px;
		border: 1.5px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
