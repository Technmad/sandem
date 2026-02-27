<div class="ide-window">
	<!-- Chrome bar -->
	<div class="ide-chrome">
		<div class="chrome-dots">
			<span class="dot red"></span>
			<span class="dot yellow"></span>
			<span class="dot green"></span>
		</div>
		<div class="chrome-tabs">
			<span class="chrome-tab active">App.jsx</span>
			<span class="chrome-tab">index.jsx</span>
		</div>
	</div>

	<!-- Body -->
	<div class="ide-body">
		<div class="code-view">
			<div class="line-nums" aria-hidden="true">
				{#each Array(14), i}
					<span>{i + 1}</span>
				{/each}
			</div>
			<pre class="code-content"><code
					><span class="kw">import</span> <span class="br">{'{'}</span> <span class="id"
						>useState</span
					> <span class="br">{'}'}</span> <span class="kw">from</span> <span class="str"
						>"react"</span
					><span class="dim">;</span>

<span class="kw">export default function</span> <span class="fn">App</span><span class="br">()</span
					> <span class="br">{'{'}</span>
  <span class="kw">const</span> <span class="br">[</span><span class="id">count</span><span
						class="dim">,</span
					> <span class="id">setCount</span><span class="br">]</span> <span class="dim">=</span
					> <span class="fn">useState</span><span class="br">(</span><span class="num">0</span><span
						class="br">)</span
					><span class="dim">;</span>

  <span class="kw">return</span> <span class="br">(</span>
    <span class="tag">&lt;div</span> <span class="attr">className</span><span class="dim">=</span
					><span class="str">"app"</span><span class="tag">&gt;</span>
      <span class="tag">&lt;h1&gt;</span>count<span class="dim">:</span> <span class="br"
						>{'{'}</span
					><span class="id">count</span><span class="br">{'}'}</span><span class="tag"
						>&lt;/h1&gt;</span
					>
      <span class="tag">&lt;button</span> <span class="attr">onClick</span><span class="dim">=</span
					><span class="br">{'{'}</span><span class="br">()</span> <span class="dim">=&gt;</span
					> <span class="fn">setCount</span><span class="br">(</span><span class="id">c</span> <span
						class="dim">=&gt;</span
					> <span class="id">c</span><span class="dim"> + </span><span class="num">1</span><span
						class="br">){'}'}</span
					><span class="tag">&gt;</span>
        increment
      <span class="tag">&lt;/button&gt;</span>
    <span class="tag">&lt;/div&gt;</span>
  <span class="br">)</span><span class="dim">;</span>
<span class="br">{'}'}</span></code
				></pre>
		</div>

		<!-- Terminal strip -->
		<div class="ide-terminal">
			<div class="term-bar">
				<span class="term-label">terminal</span>
				<span class="term-status">
					<span class="status-dot"></span>
					running
				</span>
			</div>
			<div class="term-output">
				<p><span class="tp">$</span> npm run dev</p>
				<p class="t-dim">VITE v5.4.0 ready in 312ms</p>
				<p class="t-ok">➜ Local: http://localhost:5173/</p>
				<p><span class="tp">$</span> <span class="blink">▌</span></p>
			</div>
		</div>
	</div>
</div>

<style>
	.ide-window {
		background: #060a10;
		border: 1px solid #0e1521;
		border-radius: 12px;
		overflow: hidden;
		box-shadow:
			0 24px 60px #00000070,
			0 0 0 1px #0e1521;
	}

	/* ── Chrome ── */
	.ide-chrome {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		background: #04070e;
		border-bottom: 1px solid #0c1420;
	}

	.chrome-dots {
		display: flex;
		gap: 5px;
	}

	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
	}
	.dot.red {
		background: #ff5f5670;
	}
	.dot.yellow {
		background: #ffbd2e70;
	}
	.dot.green {
		background: #27c93f70;
	}

	.chrome-tabs {
		display: flex;
	}

	.chrome-tab {
		font-family: 'JetBrains Mono', monospace;
		font-size: 10.5px;
		padding: 5px 14px;
		color: #2a3a50;
		border-right: 1px solid #0c1420;
		border-top: 2px solid transparent;
	}
	.chrome-tab.active {
		color: #c0cad6;
		background: #060a10;
		border-top-color: #3b7dd8;
	}

	/* ── Code view ── */
	.ide-body {
		display: flex;
		flex-direction: column;
	}

	.code-view {
		display: flex;
		padding: 14px 0 10px;
		min-height: 220px;
	}

	.line-nums {
		display: flex;
		flex-direction: column;
		padding: 0 12px 0 16px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: #1a2535;
		line-height: 1.65;
		user-select: none;
		border-right: 1px solid #0a1020;
		margin-right: 14px;
		min-width: 36px;
		text-align: right;
	}

	.code-content {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11.5px;
		line-height: 1.65;
		margin: 0;
		padding: 0;
		background: transparent;
		white-space: pre;
		overflow: hidden;
	}

	/* Syntax tokens — scoped now that code lives here */
	.kw {
		color: #c084fc;
	}
	.fn {
		color: #60a5fa;
	}
	.str {
		color: #86efac;
	}
	.num {
		color: #fb923c;
	}
	.id {
		color: #93c5fd;
	}
	.tag {
		color: #f87171;
	}
	.attr {
		color: #fbbf24;
	}
	.br {
		color: #e2e8f0;
	}
	.dim {
		color: #4a5a6e;
	}

	/* ── Terminal ── */
	.ide-terminal {
		border-top: 1px solid #0a1020;
		background: #040710;
	}

	.term-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 14px;
		border-bottom: 1px solid #08101a;
	}

	.term-label {
		font-family: 'JetBrains Mono', monospace;
		font-size: 9.5px;
		color: #1a2535;
		letter-spacing: 0.04em;
	}

	.term-status {
		display: flex;
		align-items: center;
		gap: 5px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 9.5px;
		color: #22c55e80;
	}

	.status-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: #22c55e;
		box-shadow: 0 0 5px #22c55e60;
	}

	.term-output {
		padding: 8px 14px 12px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 10.5px;
		color: #2a3a50;
		display: flex;
		flex-direction: column;
		gap: 3px;
		line-height: 1.5;
	}

	.tp {
		color: #3b7dd8;
		margin-right: 7px;
	}
	.t-dim {
		color: #1a2535;
		padding-left: 2px;
	}
	.t-ok {
		color: #22c55e70;
		padding-left: 2px;
	}

	.blink {
		animation: blink 1.1s step-end infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>
