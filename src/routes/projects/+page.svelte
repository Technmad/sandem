<script lang="ts">
	import type { Id } from '$convex/_generated/dataModel.js';
	import { api } from '$convex/_generated/api.js';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { useAuth } from '$lib/svelte/index.js';
	import { authClient } from '$lib/utils/auth-client.js';
	import { goto } from '$app/navigation';
	import { VITE_REACT_TEMPLATE, templateToProjectFiles } from '$lib/utils/templates.js';

	// Components
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Grid from '$lib/components/ui/Grid.svelte';

	let { data } = $props();
	const auth = useAuth();
	const client = useConvexClient();

	const currentUserResponse = useQuery(
		api.auth.getCurrentUser,
		() => (auth.isAuthenticated ? {} : 'skip'),
		() => ({ initialData: data.currentUser, keepPreviousData: true })
	);

	const projects = useQuery(api.projects.listProjects, () =>
		currentUserResponse.data?._id ? { ownerId: currentUserResponse.data._id } : 'skip'
	);

	let creating = $state(false);

	async function handleNewProject() {
		if (!currentUserResponse.data?._id || creating) return;
		creating = true;
		try {
			const projectFiles = templateToProjectFiles(VITE_REACT_TEMPLATE.files);

			const projectId = await client.mutation(api.projects.createProject, {
				title: 'Untitled Project',
				ownerId: currentUserResponse.data._id,
				files: projectFiles,
				entry: VITE_REACT_TEMPLATE.entry,
				visibleFiles: VITE_REACT_TEMPLATE.visibleFiles
			});
			if (projectId) goto(`/projects/${projectId}`);
		} finally {
			creating = false;
		}
	}

	async function handleDeleteProject(e: MouseEvent, id: string) {
		e.preventDefault();
		e.stopPropagation();
		if (confirm('Are you sure you want to delete this project?')) {
			await client.mutation(api.projects.deleteProject, { id: id as Id<'projects'> });
		}
	}

	async function handleSignOut() {
		await authClient.signOut();
	}

	function formatRelative(timestamp: number) {
		const diff = Date.now() - timestamp;
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) return 'Today';
		if (days === 1) return 'Yesterday';
		if (days < 7) return `${days} days ago`;

		return new Date(timestamp).toLocaleDateString();
	}
</script>

<main class="container">
	<header class="header">
		<div class="header-content">
			<h1>Projects</h1>
			<p class="subtitle">Manage and launch your web containers</p>
		</div>
		<div class="header-actions">
			<Button variant="outline" onclick={handleSignOut}>Sign Out</Button>
			<Button onclick={handleNewProject} disabled={creating}>
				{creating ? 'Creating...' : 'New Project'}
			</Button>
		</div>
	</header>

	<Grid minWidth="280px" gap="1.5rem">
		<button class="ghost-card-wrapper" onclick={handleNewProject} disabled={creating}>
			<Card preset="flat">
				{#snippet content()}
					<div class="ghost-inner">
						<div class="ghost-icon">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path d="M12 5v14M5 12h14" />
							</svg>
						</div>
						<span>Create new project</span>
					</div>
				{/snippet}
			</Card>
		</button>

		{#if projects.data}
			{#each projects.data as project}
				<a href="/p/{project._id}" class="card-link">
					<Card>
						{#snippet content()}
							<div class="project-card-header">
								<div class="project-icon">
									<svg
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
									</svg>
								</div>
								<button
									class="delete-btn"
									onclick={(e) => handleDeleteProject(e, project._id)}
									aria-label="Delete project"
								>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
										/>
									</svg>
								</button>
							</div>

							<div class="project-card-body">
								<h3 class="project-title">{project.title}</h3>
							</div>

							<div class="project-card-footer">
								<span class="card-id">{project._id.slice(-6)}</span>
								<span class="card-time">{formatRelative(project._creationTime)}</span>
							</div>
						{/snippet}
					</Card>
				</a>
			{/each}
		{/if}
	</Grid>
</main>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 4rem 2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 3rem;
	}

	.header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text);
	}

	.subtitle {
		color: var(--muted);
		margin-top: 0.5rem;
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
	}

	/* Card Link Wrapper */
	.card-link {
		text-decoration: none;
		color: inherit;
		display: block;
	}

	/* Project Card Internals */
	.project-card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.5rem;
	}

	.project-icon {
		width: 40px;
		height: 40px;
		background: var(--mg);
		border-radius: calc(var(--radius) / 2);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--text);
	}

	.delete-btn {
		background: transparent;
		border: none;
		color: var(--muted);
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		transition: all var(--time);
	}

	.delete-btn:hover {
		color: var(--error);
		background: color-mix(in srgb, var(--error), transparent 90%);
	}

	.project-card-body {
		margin-bottom: 2rem;
	}

	.project-title {
		font-weight: 600;
		font-size: 1.125rem;
		color: var(--text);
	}

	.project-card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.card-id,
	.card-time {
		font-family: ui-monospace, SFMono-Regular, monospace;
		font-size: 0.75rem;
		color: var(--muted);
	}

	/* Ghost Card Styling */
	.ghost-card-wrapper {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		text-align: left;
		width: 100%;
	}

	.ghost-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		min-height: 180px;
		border: 2px dashed var(--border);
		border-radius: var(--radius);
		color: var(--muted);
		transition: all var(--time);
	}

	.ghost-card-wrapper:hover .ghost-inner {
		border-color: var(--text);
		color: var(--text);
		background: var(--mg);
	}
</style>
