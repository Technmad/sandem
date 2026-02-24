<div class="page">
	<!-- Background layers -->
	<div class="bg-grid" aria-hidden="true"></div>
	<div class="bg-glow" aria-hidden="true"></div>

	<!-- ── Nav ───────────────────────────────────────────────── -->
	<nav class="nav">
		<div class="nav-brand">
			<svg
				width="15"
				height="15"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
			>
				<rect x="3" y="3" width="7" height="7" rx="1" />
				<rect x="14" y="3" width="7" height="7" rx="1" />
				<rect x="3" y="14" width="7" height="7" rx="1" />
				<rect x="14" y="14" width="7" height="7" rx="1" />
			</svg>
			<span>sandem</span>
		</div>
		<div class="nav-links">
			<a href="/docs" class="nav-link">docs</a>
			<a href="https://github.com" class="nav-link" target="_blank" rel="noopener">github</a>
		</div>
		<div class="nav-cta">
			<a href="/projects" class="btn-nav">open workspace →</a>
		</div>
	</nav>

	<!-- ── Hero ──────────────────────────────────────────────── -->
	<section class="hero">
		<div class="hero-left">
			<div class="eyebrow">
				<div class="eyebrow-dot"></div>
				<span>in-browser · Node.js · collaborative</span>
			</div>

			<h1 class="hero-heading">
				<span class="h-line h-line-1">A full dev</span>
				<span class="h-line h-line-2">environment.</span>
				<span class="h-line h-line-3 accent">In your browser.</span>
			</h1>

			<p class="hero-sub">
				Sandem runs a real Node.js OS in WebAssembly — no cloud VMs, no setup. Just open a project
				and start coding.
			</p>

			<div class="hero-actions">
				<a href="/projects" class="btn-primary">
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<polygon points="5 3 19 12 5 21 5 3" />
					</svg>
					start building
				</a>
				<a href="/login" class="btn-ghost-cta">sign in free</a>
			</div>

			<div class="hero-stats">
				<div class="stat">
					<span class="stat-val">~800ms</span>
					<span class="stat-label">container boot</span>
				</div>
				<div class="stat-divider"></div>
				<div class="stat">
					<span class="stat-val">0</span>
					<span class="stat-label">cloud VMs</span>
				</div>
				<div class="stat-divider"></div>
				<div class="stat">
					<span class="stat-val">∞</span>
					<span class="stat-label">concurrency</span>
				</div>
			</div>
		</div>

		<div class="hero-right">
			<!-- Faux IDE window -->
			<div class="ide-window">
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

				<div class="ide-body">
					<!-- Line numbers + code -->
					<div class="code-view">
						<div class="line-nums" aria-hidden="true">
							{#each Array(14) as i}
								<span>{i + 1}</span>
							{/each}
						</div>
						<pre class="code-content"><code
								><span class="tok-kw">import</span> <span class="tok-brace">{'{'}</span> <span
									class="tok-id">useState</span
								> <span class="tok-brace">{'}'}</span> <span class="tok-kw">from</span> <span
									class="tok-str">"react"</span
								><span class="tok-dim">;</span>

<span class="tok-kw">export default function</span> <span class="tok-fn">App</span><span
									class="tok-brace">()</span
								> <span class="tok-brace">{'{'}</span>
  <span class="tok-kw">const</span> <span class="tok-brace">[</span><span class="tok-id">count</span
								><span class="tok-dim">,</span> <span class="tok-id">setCount</span><span
									class="tok-brace">]</span
								> <span class="tok-dim">=</span> <span class="tok-fn">useState</span><span
									class="tok-brace">(</span
								><span class="tok-num">0</span><span class="tok-brace">)</span><span class="tok-dim"
									>;</span
								>

  <span class="tok-kw">return</span> <span class="tok-brace">(</span>
    <span class="tok-tag">&lt;div</span> <span class="tok-attr">className</span><span
									class="tok-dim">=</span
								><span class="tok-str">"app"</span><span class="tok-tag">&gt;</span>
      <span class="tok-tag">&lt;h1&gt;</span>count<span class="tok-dim">:</span> <span
									class="tok-brace">{'{'}</span
								><span class="tok-id">count</span><span class="tok-brace">{'}'}</span><span
									class="tok-tag">&lt;/h1&gt;</span
								>
      <span class="tok-tag">&lt;button</span> <span class="tok-attr">onClick</span><span
									class="tok-dim">=</span
								><span class="tok-brace">{'{'}</span><span class="tok-brace">()</span> <span
									class="tok-dim">=&gt;</span
								> <span class="tok-fn">setCount</span><span class="tok-brace">(</span><span
									class="tok-id">c</span
								> <span class="tok-dim">=&gt;</span> <span class="tok-id">c</span><span
									class="tok-dim"> + </span><span class="tok-num">1</span><span class="tok-brace"
									>){'}'}</span
								><span class="tok-tag">&gt;</span>
        increment
      <span class="tok-tag">&lt;/button&gt;</span>
    <span class="tok-tag">&lt;/div&gt;</span>
  <span class="tok-brace">)</span><span class="tok-dim">;</span>
<span class="tok-brace">{'}'}</span></code
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

			<!-- Floating badges -->
			<div class="badge badge-collab">
				<div class="badge-dot"></div>
				<span>3 collaborators live</span>
			</div>
			<div class="badge badge-save">
				<svg
					width="10"
					height="10"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
				<span>auto-saved</span>
			</div>
		</div>
	</section>

	<!-- ── Features ──────────────────────────────────────────── -->
	<section class="features">
		<div class="features-header">
			<p class="section-label">why sandem</p>
			<h2 class="section-heading">Everything you need.<br />Nothing you don't.</h2>
		</div>

		<div class="features-grid">
			<div class="feat-card feat-large">
				<div class="feat-icon">
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
						<line x1="8" y1="21" x2="16" y2="21" />
						<line x1="12" y1="17" x2="12" y2="21" />
					</svg>
				</div>
				<h3>WebContainer API</h3>
				<p>
					A full Node.js OS running in WebAssembly inside your tab. Install packages, run build
					tools, spawn processes — all client-side.
				</p>
				<div class="feat-pill">zero server overhead</div>
			</div>

			<div class="feat-card">
				<div class="feat-icon">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
						<circle cx="9" cy="7" r="4" />
						<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
						<path d="M16 3.13a4 4 0 0 1 0 7.75" />
					</svg>
				</div>
				<h3>Real-time collab</h3>
				<p>
					Liveblocks + Yjs keeps every cursor and keystroke in sync across all participants
					instantly.
				</p>
			</div>

			<div class="feat-card">
				<div class="feat-icon">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<polyline points="16 18 22 12 16 6" />
						<polyline points="8 6 2 12 8 18" />
					</svg>
				</div>
				<h3>Monaco editor</h3>
				<p>
					The same editor that powers VS Code, with syntax highlighting, multi-file tabs, and
					autosave to Convex.
				</p>
			</div>

			<div class="feat-card">
				<div class="feat-icon">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<polyline points="4 17 10 11 4 5" />
						<line x1="12" y1="19" x2="20" y2="19" />
					</svg>
				</div>
				<h3>Integrated terminal</h3>
				<p>
					xterm.js wired directly to the container shell. Run <code>npm install</code>, watch files,
					do anything.
				</p>
			</div>

			<div class="feat-card">
				<div class="feat-icon">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path
							d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
						/>
					</svg>
				</div>
				<h3>Convex backend</h3>
				<p>
					Projects persist to a real-time database. Open on any device and pick up exactly where you
					left off.
				</p>
			</div>

			<div class="feat-card feat-cta-card">
				<p class="feat-cta-sub">ready to try it?</p>
				<a href="/projects" class="btn-feat-cta">
					open workspace
					<svg
						width="13"
						height="13"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
					>
						<line x1="5" y1="12" x2="19" y2="12" />
						<polyline points="12 5 19 12 12 19" />
					</svg>
				</a>
			</div>
		</div>
	</section>

	<!-- ── Stack strip ───────────────────────────────────────── -->
	<section class="stack-strip">
		<p class="strip-label">built on</p>
		<div class="strip-items">
			{#each ['SvelteKit', 'Convex', 'WebContainer API', 'Monaco Editor', 'Liveblocks', 'Yjs', 'xterm.js', 'better-auth'] as item}
				<span class="strip-item">{item}</span>
			{/each}
		</div>
	</section>

	<!-- ── Footer ────────────────────────────────────────────── -->
	<footer class="footer">
		<div class="footer-brand">
			<svg
				width="13"
				height="13"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
			>
				<rect x="3" y="3" width="7" height="7" rx="1" />
				<rect x="14" y="3" width="7" height="7" rx="1" />
				<rect x="3" y="14" width="7" height="7" rx="1" />
				<rect x="14" y="14" width="7" height="7" rx="1" />
			</svg>
			<span>sandem</span>
			<span class="footer-version">v0.8.0</span>
		</div>
		<div class="footer-links">
			<a href="/projects">workspace</a>
			<a href="/login">sign in</a>
			<a href="https://github.com" target="_blank" rel="noopener">github</a>
		</div>
		<p class="footer-copy">MIT licensed · built in public</p>
	</footer>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;1,9..40,300&display=swap');

	/* ── Page shell ── */
	.page {
		min-height: 100vh;
		background: #07090d;
		color: #b8c4d0;
		font-family: 'DM Sans', system-ui, sans-serif;
		position: relative;
		overflow-x: hidden;
	}

	.bg-grid {
		position: fixed;
		inset: 0;
		pointer-events: none;
		background-image: radial-gradient(circle, #141e2d 1px, transparent 1px);
		background-size: 32px 32px;
		opacity: 0.38;
		z-index: 0;
	}

	.bg-glow {
		position: fixed;
		top: -200px;
		left: 50%;
		transform: translateX(-50%);
		width: 800px;
		height: 500px;
		background: radial-gradient(ellipse, #0a1e3a 0%, transparent 70%);
		pointer-events: none;
		z-index: 0;
	}

	/* ── Nav ── */
	.nav {
		position: sticky;
		top: 0;
		z-index: 50;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		padding: 0 2.5rem;
		height: 52px;
		border-bottom: 1px solid #0c1420;
		background: rgba(7, 9, 13, 0.88);
		backdrop-filter: blur(16px);
	}

	.nav-brand {
		display: flex;
		align-items: center;
		gap: 9px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 14px;
		color: #dde4ed;
	}

	.nav-brand svg {
		color: #3b7dd8;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
	}

	.nav-link {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: #2a3a50;
		text-decoration: none;
		transition: color 0.15s;
		letter-spacing: 0.04em;
	}

	.nav-link:hover {
		color: #6a7e96;
	}

	.nav-cta {
		display: flex;
		justify-content: flex-end;
	}

	.btn-nav {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: #4a80c8;
		text-decoration: none;
		border: 1px solid #142040;
		padding: 5px 14px;
		border-radius: 6px;
		background: #0a1828;
		transition: all 0.15s;
		letter-spacing: 0.02em;
	}

	.btn-nav:hover {
		color: #7aaaf0;
		border-color: #1e3a6a;
		background: #0e2040;
	}

	/* ── Hero ── */
	.hero {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
		max-width: 1140px;
		margin: 0 auto;
		padding: 6rem 2.5rem 5rem;
	}

	.eyebrow {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 10.5px;
		color: #2a3a50;
		letter-spacing: 0.06em;
		margin-bottom: 1.5rem;
		animation: fadeUp 0.5s ease both;
	}

	.eyebrow-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #3b7dd8;
		box-shadow: 0 0 8px #3b7dd860;
	}

	.hero-heading {
		display: flex;
		flex-direction: column;
		margin: 0 0 1.5rem;
	}

	.h-line {
		font-family: 'Syne', sans-serif;
		font-weight: 700;
		font-size: clamp(2.8rem, 5vw, 4.2rem);
		line-height: 1;
		letter-spacing: -0.04em;
		color: #dde4ed;
		display: block;
	}

	.h-line-1 {
		animation: fadeUp 0.5s 0.05s ease both;
	}
	.h-line-2 {
		animation: fadeUp 0.5s 0.12s ease both;
	}
	.h-line-3 {
		animation: fadeUp 0.5s 0.19s ease both;
	}

	.accent {
		color: transparent;
		-webkit-text-stroke: 1.5px #3b7dd8;
	}

	.hero-sub {
		font-size: 0.95rem;
		color: #3a4a5e;
		line-height: 1.75;
		max-width: 400px;
		margin-bottom: 2rem;
		animation: fadeUp 0.5s 0.25s ease both;
	}

	.hero-actions {
		display: flex;
		gap: 12px;
		align-items: center;
		margin-bottom: 2.5rem;
		animation: fadeUp 0.5s 0.3s ease both;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: #3b7dd8;
		color: #fff;
		padding: 10px 22px;
		border-radius: 7px;
		font-size: 13px;
		font-family: 'JetBrains Mono', monospace;
		text-decoration: none;
		transition: all 0.15s;
		border: 1px solid #5090e8;
	}

	.btn-primary:hover {
		background: #4a8ee8;
		box-shadow: 0 0 24px #3b7dd840;
		transform: translateY(-1px);
	}

	.btn-ghost-cta {
		font-family: 'JetBrains Mono', monospace;
		font-size: 12px;
		color: #2a3a50;
		text-decoration: none;
		padding: 10px 18px;
		border: 1px solid #0e1521;
		border-radius: 7px;
		transition: all 0.15s;
	}

	.btn-ghost-cta:hover {
		color: #8a9ab0;
		border-color: #1a2535;
	}

	.hero-stats {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		animation: fadeUp 0.5s 0.35s ease both;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.stat-val {
		font-family: 'JetBrains Mono', monospace;
		font-size: 1.1rem;
		color: #dde4ed;
		font-weight: 400;
	}
	.stat-label {
		font-family: 'JetBrains Mono', monospace;
		font-size: 9.5px;
		color: #1e2e40;
		letter-spacing: 0.05em;
	}
	.stat-divider {
		width: 1px;
		height: 28px;
		background: #0e1521;
	}

	/* ── IDE window ── */
	.hero-right {
		position: relative;
		animation: fadeUp 0.6s 0.1s ease both;
	}

	.ide-window {
		background: #060a10;
		border: 1px solid #0e1521;
		border-radius: 12px;
		overflow: hidden;
		box-shadow:
			0 24px 60px #00000070,
			0 0 0 1px #0e1521;
	}

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
		gap: 0;
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

	/* Syntax tokens */
	:global(.tok-kw) {
		color: #c084fc;
	}
	:global(.tok-fn) {
		color: #60a5fa;
	}
	:global(.tok-str) {
		color: #86efac;
	}
	:global(.tok-num) {
		color: #fb923c;
	}
	:global(.tok-id) {
		color: #93c5fd;
	}
	:global(.tok-tag) {
		color: #f87171;
	}
	:global(.tok-attr) {
		color: #fbbf24;
	}
	:global(.tok-brace) {
		color: #e2e8f0;
	}
	:global(.tok-dim) {
		color: #4a5a6e;
	}

	/* Terminal strip */
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

	.term-output .tp {
		color: #3b7dd8;
		margin-right: 7px;
	}
	.term-output .t-dim {
		color: #1a2535;
		padding-left: 2px;
	}
	.term-output .t-ok {
		color: #22c55e70;
		padding-left: 2px;
	}

	/* Floating badges */
	.badge {
		position: absolute;
		display: flex;
		align-items: center;
		gap: 7px;
		background: #060a10;
		border: 1px solid #0e1521;
		border-radius: 20px;
		padding: 6px 12px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 10.5px;
		color: #3a4a5e;
		box-shadow: 0 4px 16px #00000060;
		animation: badgeIn 0.6s ease both;
	}

	.badge-collab {
		bottom: -14px;
		left: -20px;
		animation-delay: 0.5s;
	}

	.badge-save {
		top: -14px;
		right: -16px;
		color: #22c55e80;
		animation-delay: 0.65s;
	}

	.badge-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #3b7dd8;
		box-shadow: 0 0 6px #3b7dd870;
	}

	/* ── Features ── */
	.features {
		position: relative;
		z-index: 2;
		max-width: 1140px;
		margin: 0 auto;
		padding: 5rem 2.5rem;
	}

	.features-header {
		margin-bottom: 3rem;
	}

	.section-label {
		font-family: 'JetBrains Mono', monospace;
		font-size: 10.5px;
		color: #2a3a50;
		letter-spacing: 0.08em;
		text-transform: lowercase;
		margin-bottom: 10px;
	}

	.section-heading {
		font-family: 'Syne', sans-serif;
		font-weight: 700;
		font-size: clamp(1.8rem, 3vw, 2.6rem);
		letter-spacing: -0.035em;
		color: #dde4ed;
		line-height: 1.15;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: auto auto;
		gap: 1px;
		background: #0c1420;
		border: 1px solid #0c1420;
		border-radius: 12px;
		overflow: hidden;
	}

	.feat-card {
		background: #07090d;
		padding: 2rem 1.75rem;
		display: flex;
		flex-direction: column;
		gap: 10px;
		transition: background 0.2s;
	}

	.feat-card:hover {
		background: #08101a;
	}

	.feat-large {
		grid-column: span 1;
		grid-row: span 2;
		background: #060810;
		border-right: 1px solid #0c1420;
	}

	.feat-large:hover {
		background: #07090f;
	}

	.feat-icon {
		color: #3b7dd8;
		opacity: 0.7;
		margin-bottom: 4px;
	}

	.feat-card h3 {
		font-family: 'Syne', sans-serif;
		font-weight: 600;
		font-size: 1rem;
		color: #c0cad6;
		letter-spacing: -0.02em;
	}

	.feat-card p {
		font-size: 0.83rem;
		color: #2a3a50;
		line-height: 1.7;
	}

	.feat-card code {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		background: #0a1020;
		border: 1px solid #0e1521;
		border-radius: 4px;
		padding: 1px 5px;
		color: #5a9af0;
	}

	.feat-pill {
		margin-top: 8px;
		display: inline-flex;
		align-self: flex-start;
		font-family: 'JetBrains Mono', monospace;
		font-size: 9.5px;
		color: #3b7dd870;
		border: 1px solid #142040;
		background: #0a1828;
		padding: 3px 9px;
		border-radius: 20px;
		letter-spacing: 0.04em;
	}

	.feat-cta-card {
		background: #060810;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 14px;
	}

	.feat-cta-sub {
		font-family: 'JetBrains Mono', monospace;
		font-size: 10.5px;
		color: #1e2e40;
	}

	.btn-feat-cta {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		background: #0e1e36;
		border: 1px solid #162c54;
		color: #5080d0;
		padding: 9px 18px;
		border-radius: 7px;
		font-size: 12px;
		font-family: 'JetBrains Mono', monospace;
		text-decoration: none;
		transition: all 0.15s;
	}

	.btn-feat-cta:hover {
		background: #122040;
		border-color: #2050a0;
		color: #70a0f0;
		box-shadow: 0 0 18px #0a2a6020;
	}

	/* ── Stack strip ── */
	.stack-strip {
		position: relative;
		z-index: 2;
		border-top: 1px solid #0c1420;
		border-bottom: 1px solid #0c1420;
		padding: 1.5rem 2.5rem;
		display: flex;
		align-items: center;
		gap: 2rem;
		overflow: hidden;
	}

	.strip-label {
		font-family: 'JetBrains Mono', monospace;
		font-size: 9.5px;
		color: #1a2535;
		letter-spacing: 0.06em;
		white-space: nowrap;
	}

	.strip-items {
		display: flex;
		gap: 0;
		flex-wrap: wrap;
	}

	.strip-item {
		font-family: 'JetBrains Mono', monospace;
		font-size: 10.5px;
		color: #1e2e40;
		padding: 4px 14px;
		border-right: 1px solid #0c1420;
		white-space: nowrap;
		transition: color 0.15s;
	}

	.strip-item:hover {
		color: #3a5a7e;
	}
	.strip-item:last-child {
		border-right: none;
	}

	/* ── Footer ── */
	.footer {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem 2.5rem;
		border-top: 1px solid #0c1420;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.footer-brand {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 12px;
		color: #2a3a50;
	}

	.footer-brand svg {
		color: #1e3a60;
	}

	.footer-version {
		font-size: 9.5px;
		color: #141e2d;
		border: 1px solid #0c1420;
		padding: 1px 6px;
		border-radius: 4px;
	}

	.footer-links {
		display: flex;
		gap: 1.5rem;
	}

	.footer-links a {
		font-family: 'JetBrains Mono', monospace;
		font-size: 10.5px;
		color: #1e2e40;
		text-decoration: none;
		transition: color 0.15s;
	}

	.footer-links a:hover {
		color: #3a5a7e;
	}

	.footer-copy {
		font-family: 'JetBrains Mono', monospace;
		font-size: 9.5px;
		color: #141e2d;
	}

	/* ── Animations ── */
	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes badgeIn {
		from {
			opacity: 0;
			transform: scale(0.9) translateY(6px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.blink {
		animation: blink 1.1s step-end infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	/* ── Responsive ── */
	@media (max-width: 900px) {
		.hero {
			grid-template-columns: 1fr;
			padding: 4rem 1.5rem 3rem;
			gap: 3rem;
		}
		.hero-right {
			order: -1;
		}
		.badge-collab {
			bottom: -10px;
			left: 0;
		}
		.badge-save {
			top: -10px;
			right: 0;
		}
		.features-grid {
			grid-template-columns: 1fr;
		}
		.feat-large {
			grid-row: span 1;
			border-right: none;
			border-bottom: 1px solid #0c1420;
		}
		.nav {
			padding: 0 1.5rem;
		}
		.features {
			padding: 3rem 1.5rem;
		}
		.footer {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	@media (max-width: 600px) {
		.nav-links {
			display: none;
		}
		.hero-stats {
			flex-wrap: wrap;
		}
		.features-grid {
			border-radius: 8px;
		}
	}
</style>
