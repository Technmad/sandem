<script lang="ts">
	import { Accordion } from 'bits-ui';
	import { ChevronRight, History, CircleAlert, FileClock } from '@lucide/svelte';

	interface TimelineEvent {
		id: string;
		at: number;
		kind: 'action' | 'error' | 'file-open' | 'folder-toggle';
		label: string;
		path?: string;
	}

	interface Props {
		events: TimelineEvent[];
		onOpenPath: (path: string) => void;
	}

	let { events, onOpenPath }: Props = $props();

	function formatTime(timestamp: number) {
		return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<Accordion.Item value="timeline" class="explorer-section">
	<Accordion.Header>
		<Accordion.Trigger class="section-trigger">
			<span class="section-chevron" aria-hidden="true">
				<ChevronRight size={11} strokeWidth={2} />
			</span>
			<span class="section-title">TIMELINE</span>
		</Accordion.Trigger>
	</Accordion.Header>

	<Accordion.Content>
		{#if events.length === 0}
			<p class="placeholder-message">No recent explorer activity</p>
		{:else}
			<div class="timeline-list">
				{#each events as event (event.id)}
					<div class="timeline-item" class:error={event.kind === 'error'}>
						<span class="timeline-icon" aria-hidden="true">
							{#if event.kind === 'error'}
								<CircleAlert size={11} strokeWidth={1.9} />
							{:else if event.path}
								<FileClock size={11} strokeWidth={1.9} />
							{:else}
								<History size={11} strokeWidth={1.9} />
							{/if}
						</span>
						<div class="timeline-text">
							<div class="timeline-label">{event.label}</div>
							<div class="timeline-meta">{formatTime(event.at)}</div>
						</div>
						{#if event.path}
							<button
								type="button"
								class="open-path"
								onclick={() => onOpenPath(event.path ?? '')}
								title={event.path}
							>
								Open
							</button>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</Accordion.Content>
</Accordion.Item>

<style>
	.placeholder-message {
		padding: 6px 12px;
		color: var(--muted);
		font-size: 11px;
		margin: 0;
	}

	.timeline-list {
		display: flex;
		flex-direction: column;
		padding: 2px 0;
	}

	.timeline-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 4px 10px;
		color: var(--muted);
		font-size: 11px;
	}

	.timeline-item.error {
		color: var(--error);
	}

	.timeline-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.timeline-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
	}

	.timeline-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.timeline-meta {
		font-size: 10px;
		color: var(--muted);
	}

	.open-path {
		border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
		background: color-mix(in srgb, var(--mg) 86%, var(--bg));
		color: var(--text);
		border-radius: 4px;
		font-size: 10px;
		line-height: 1;
		height: 18px;
		padding: 0 6px;
		cursor: pointer;
		flex-shrink: 0;
	}

	.open-path:hover {
		background: color-mix(in srgb, var(--fg) 70%, transparent);
	}
</style>
