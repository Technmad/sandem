<script lang="ts">
	import type { Id } from '$convex/_generated/dataModel.js';
	import { api } from '$convex/_generated/api.js';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { useAuth } from '$lib/svelte/index.js';
	import { authClient } from '$lib/hooks/auth-client.js';
	import { goto } from '$app/navigation';
	import { setIDEContext } from '$lib/utils/ide-context.js';
	import { VITE_REACT_TEMPLATE } from '$lib/utils/template.js';

	// Layout Components
	import PageSection from '$lib/components/layout/PageSection.svelte';
	import PageFooter from '$lib/components/layout/PageFooter.svelte';

	// UI Components
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { Liveblocks } from '@liveblocks/node';

	let { data } = $props();
	const auth = useAuth();
	const client = useConvexClient();

	const USER = useQuery(
		api.auth.getCurrentUser,
		() => (auth.isAuthenticated ? {} : 'skip'),
		() => ({ initialData: data.currentUser, keepPreviousData: true })
	);

	const projects = useQuery(api.projects.getProjects, () =>
		USER.data?._id ? { owner: USER.data._id } : 'skip'
	);

	let creating = $state(false);
	async function handleNewProject() {
		if (!USER.data?._id || creating) return;
		creating = true;
		try {
			// template already holds array of {name,contents}
			const FILES = VITE_REACT_TEMPLATE.files;

			// create project record
			const project = await client.mutation(api.projects.createProject, {
				title: 'Untitled Project',
				owner: USER.data._id,
				files: FILES,
				entry: VITE_REACT_TEMPLATE.entry,
				room: ''
			});

			if (project) {
				setIDEContext({	});
				await goto(`/projects/${project}`);
			}
		} finally {
			creating = false;
		}
	}

	let deleting = $state(false);
	async function handleDeleteProject(e: MouseEvent, id: string) {
		if (USER.data?._id || !deleting) return window.alert('not ur repo buddy!')
		deleting= true;
		
		e.preventDefault();
		e.stopPropagation();
		if (confirm('Are you sure you want to delete this project?')) {
			await client.mutation(api.projects.deleteProject, { id: id as Id<'projects'> });
		}
		deleting = false;
	}


</script>

<!-- Projects Grid Section -->
<PageSection variant="grid" label="YOUR PROJECTS" heading="Active Projects">
	<!-- Create New Project Card Button -->
	<button onclick={handleNewProject} disabled={creating} aria-label="Create new project">
		<Card variant="create">
			<span>Create new project</span>
		</Card>
	</button>

	{:else if projects.data && projects.data.length > 0}
		<!-- Project Cards -->
		{#each projects.data as project (project._id)}
			<a href={`/projects/${project._id}`} data-sveltekit-preload-data="hover">
				<Card variant="project">
					<div class="project-header">
						<Button
							variant="delete"
							onclick={(e) => handleDeleteProject(e, project._id)}
							aria-label="Delete project"
							title="Delete project"
						></Button>
					</div>

					<div class="project-body">
						<h3 class="project-title">{project.title}</h3>
					</div>

				</Card>
			</a>
		{/each}
	{:else if projects.data?.length === 0}
		<!-- Empty State -->
		<div class="empty-state" style="grid-column: 1 / -1;">
			<h3>No projects yet</h3>
			<p>Create your first project to get started</p>
		</div>
	{/if}
</PageSection>

<!-- CTA Footer -->
<PageFooter
	variant="default"
	heading="Ready to start coding?"
	subtitle="Create a new project and begin building your next web application today."
>
	<Button onclick={handleNewProject} disabled={creating}>
		{creating ? 'Creating...' : 'Create Project'}
	</Button>
</PageFooter>
