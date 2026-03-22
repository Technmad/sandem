<script lang="ts">
	import { Accordion } from 'bits-ui';
	import { ChevronRight } from '@lucide/svelte';
	import type { IDEProject } from '$types/projects';

	interface Props {
		activeProject: IDEProject | null;
		projectFolderName: string | null;
	}

	const { activeProject, projectFolderName }: Props = $props();
</script>

<Accordion.Item value="project-info" class="explorer-section">
	<Accordion.Header>
		<Accordion.Trigger class="section-trigger">
			<span class="section-chevron" aria-hidden="true">
				<ChevronRight size={11} strokeWidth={2} />
			</span>
			<span class="section-title">PROJECT DETAILS</span>
		</Accordion.Trigger>
	</Accordion.Header>

	<Accordion.Content>
		{#if activeProject}
			<div class="project-info-grid">
				<div class="info-row">
					<span class="label">Name:</span>
					<span class="value">{activeProject.title}</span>
				</div>
				{#if projectFolderName}
					<div class="info-row">
						<span class="label">Folder:</span>
						<span class="value">{projectFolderName}</span>
					</div>
				{/if}
				<div class="info-row">
					<span class="label">Files:</span>
					<span class="value">{activeProject.files?.length ?? '—'}</span>
				</div>
			</div>
		{:else}
			<p class="empty-state">No project selected</p>
		{/if}
	</Accordion.Content>
</Accordion.Item>

<style>
	.project-info-grid {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 8px 10px;
		font-size: 11px;
	}

	.info-row {
		display: flex;
		gap: 6px;
		color: var(--muted);
	}

	.label {
		font-weight: 600;
		color: var(--text);
		flex-shrink: 0;
	}

	.value {
		color: var(--accent);
		word-break: break-word;
	}

	.empty-state {
		padding: 8px 10px;
		color: var(--muted);
		font-size: 11px;
		margin: 0;
	}
</style>
