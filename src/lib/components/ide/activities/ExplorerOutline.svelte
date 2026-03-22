<script lang="ts">
	import { Accordion } from 'bits-ui';
	import { ChevronRight, Braces, Square, Variable, Type } from '@lucide/svelte';

	interface OutlineSymbol {
		id: string;
		line: number;
		name: string;
		kind: 'function' | 'class' | 'interface' | 'type' | 'variable';
	}

	interface Props {
		activeFilePath: string | null;
	}

	let { activeFilePath }: Props = $props();

	let symbols = $state<OutlineSymbol[]>([]);

	function getActiveEditor():
		| {
				getModel: () => { getValue: () => string } | null;
				focus: () => void;
				setPosition: (position: { lineNumber: number; column: number }) => void;
				revealLineInCenter: (lineNumber: number) => void;
		  }
		| undefined {
		const monacoApi = (globalThis as { monaco?: { editor?: { getEditors?: () => unknown[] } } })
			.monaco;
		const editors = monacoApi?.editor?.getEditors?.() ?? [];
		return editors[0] as
			| {
					getModel: () => { getValue: () => string } | null;
					focus: () => void;
					setPosition: (position: { lineNumber: number; column: number }) => void;
					revealLineInCenter: (lineNumber: number) => void;
			  }
			| undefined;
	}

	function parseSymbols(content: string): OutlineSymbol[] {
		const lines = content.split(/\r?\n/);
		const parsed: OutlineSymbol[] = [];

		for (const [index, rawLine] of lines.entries()) {
			const line = rawLine.trim();
			if (!line || line.startsWith('//') || line.startsWith('*')) continue;

			const classMatch = line.match(/^export\s+class\s+([\w$]+)|^class\s+([\w$]+)/);
			if (classMatch) {
				const name = classMatch[1] ?? classMatch[2];
				if (name) {
					parsed.push({
						id: `class-${name}-${index + 1}`,
						line: index + 1,
						name,
						kind: 'class'
					});
					continue;
				}
			}

			const interfaceMatch = line.match(/^export\s+interface\s+([\w$]+)|^interface\s+([\w$]+)/);
			if (interfaceMatch) {
				const name = interfaceMatch[1] ?? interfaceMatch[2];
				if (name) {
					parsed.push({
						id: `interface-${name}-${index + 1}`,
						line: index + 1,
						name,
						kind: 'interface'
					});
					continue;
				}
			}

			const typeMatch = line.match(/^export\s+type\s+([\w$]+)|^type\s+([\w$]+)/);
			if (typeMatch) {
				const name = typeMatch[1] ?? typeMatch[2];
				if (name) {
					parsed.push({
						id: `type-${name}-${index + 1}`,
						line: index + 1,
						name,
						kind: 'type'
					});
					continue;
				}
			}

			const functionMatch = line.match(
				/^export\s+async\s+function\s+([\w$]+)|^export\s+function\s+([\w$]+)|^async\s+function\s+([\w$]+)|^function\s+([\w$]+)/
			);
			if (functionMatch) {
				const name = functionMatch[1] ?? functionMatch[2] ?? functionMatch[3] ?? functionMatch[4];
				if (name) {
					parsed.push({
						id: `function-${name}-${index + 1}`,
						line: index + 1,
						name,
						kind: 'function'
					});
					continue;
				}
			}

			const variableMatch = line.match(
				/^export\s+(const|let|var)\s+([\w$]+)|^(const|let|var)\s+([\w$]+)/
			);
			if (variableMatch) {
				const name = variableMatch[2] ?? variableMatch[4];
				if (name) {
					parsed.push({
						id: `variable-${name}-${index + 1}`,
						line: index + 1,
						name,
						kind: 'variable'
					});
				}
			}
		}

		return parsed.slice(0, 200);
	}

	function refreshOutline() {
		if (!activeFilePath) {
			symbols = [];
			return;
		}

		const editor = getActiveEditor();
		const model = editor?.getModel();
		if (!model) {
			symbols = [];
			return;
		}

		symbols = parseSymbols(model.getValue());
	}

	function jumpToLine(line: number) {
		const editor = getActiveEditor();
		if (!editor) return;

		editor.focus();
		editor.setPosition({ lineNumber: line, column: 1 });
		editor.revealLineInCenter(line);
	}

	function iconForKind(kind: OutlineSymbol['kind']) {
		if (kind === 'class' || kind === 'interface') return Braces;
		if (kind === 'function') return Square;
		if (kind === 'type') return Type;
		return Variable;
	}

	$effect(() => {
		if (activeFilePath) {
			// keep activeFilePath as a reactive dependency
		}
		refreshOutline();
	});

	import { onMount } from 'svelte';
	onMount(() => {
		const timer = setInterval(() => {
			refreshOutline();
		}, 1200);

		return () => {
			clearInterval(timer);
		};
	});
</script>

<Accordion.Item value="outline" class="explorer-section">
	<Accordion.Header>
		<Accordion.Trigger class="section-trigger">
			<span class="section-chevron" aria-hidden="true">
				<ChevronRight size={11} strokeWidth={2} />
			</span>
			<span class="section-title">OUTLINE</span>
		</Accordion.Trigger>
	</Accordion.Header>

	<Accordion.Content>
		{#if !activeFilePath}
			<p class="placeholder-message">Open a file to view symbols</p>
		{:else if symbols.length === 0}
			<p class="placeholder-message">No symbols found in the active editor</p>
		{:else}
			<div class="outline-list">
				{#each symbols as symbol (symbol.id)}
					{@const SymbolIcon = iconForKind(symbol.kind)}
					<button
						type="button"
						class="outline-item"
						onclick={() => jumpToLine(symbol.line)}
						title={`Go to line ${symbol.line}`}
					>
						<SymbolIcon size={11} strokeWidth={1.8} />
						<span class="name">{symbol.name}</span>
						<span class="line">Ln {symbol.line}</span>
					</button>
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

	.outline-list {
		display: flex;
		flex-direction: column;
		padding: 2px 0;
	}

	.outline-item {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
		height: 22px;
		padding: 0 10px;
		border: 0;
		background: transparent;
		color: var(--muted);
		font-size: 11px;
		text-align: left;
		cursor: pointer;
	}

	.outline-item:hover {
		background: color-mix(in srgb, var(--fg) 70%, transparent);
		color: var(--text);
	}

	.outline-item .name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.outline-item .line {
		color: var(--muted);
		font-size: 10px;
	}
</style>
