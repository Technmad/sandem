<script lang="ts">
	import { authClient } from '$lib/hooks/auth-client.js';
	import { api } from '$convex/_generated/api.js';
	import { useQuery } from 'convex-svelte';
	import { useAuth } from '$lib/svelte/index.js';
	import { goto } from '$app/navigation';

	let { data } = $props();

	const auth = useAuth();
	const isLoading = $derived(auth.isLoading);
	const isAuthenticated = $derived(auth.isAuthenticated);

	const currentUserResponse = useQuery(
		api.auth.getCurrentUser,
		() => (auth.isAuthenticated ? {} : 'skip'),
		() => ({ initialData: data.currentUser, keepPreviousData: true })
	);
	let user = $derived(currentUserResponse.data);

	let showSignIn = $state(true);
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let submitting = $state(false);
	let errorMsg = $state('');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		submitting = true;
		errorMsg = '';
		try {
			if (showSignIn) {
				await authClient.signIn.email(
					{ email, password },
					{
						onError: (ctx) => {
							errorMsg = ctx.error.message;
						}
					}
				);
			} else {
				await authClient.signUp.email(
					{ name, email, password },
					{
						onError: (ctx) => {
							errorMsg = ctx.error.message;
						}
					}
				);
			}
		} catch (err) {
			console.error('Auth error:', err);
		} finally {
			submitting = false;
		}
	}

	async function handleGithub() {
		await authClient.signIn.social({ provider: 'github' });
	}

	async function signOut() {
		await authClient.signOut();
	}

	function toggle() {
		showSignIn = !showSignIn;
		name = '';
		email = '';
		password = '';
		errorMsg = '';
	}
</script>

<div class="shell">
	<!-- Animated dot grid -->
	<div class="bg-grid" aria-hidden="true"></div>
	<!-- Corner accent lines -->
	<div class="corner-tl" aria-hidden="true"></div>
	<div class="corner-br" aria-hidden="true"></div>

	{#if isLoading}
		<div class="boot-screen">
			<div class="boot-logo">
				<svg
					width="20"
					height="20"
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
			</div>
			<p class="boot-label">initialising<span class="blink">_</span></p>
		</div>
	{:else if isAuthenticated && user}
		<!-- Already signed in — shows briefly before redirect -->
		<div class="boot-screen">
			<div class="session-card">
				<div class="session-dot"></div>
				<div class="session-info">
					<p class="session-name">{user.name ?? 'User'}</p>
					<p class="session-email">{user.email}</p>
				</div>
				<button class="btn-signout" onclick={signOut}>sign out</button>
			</div>
			<p class="redirect-hint">redirecting to projects<span class="blink">_</span></p>
		</div>
	{:else}
		<div class="stage">
			<!-- Left: brand column -->
			<aside class="brand-col">
				<div class="brand-wrap">
					<div class="brand-logo">
						<svg
							width="22"
							height="22"
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
					</div>
					<h1 class="brand-name">sandem<span class="brand-dot">.</span></h1>
					<p class="brand-tagline">in-browser dev environments,<br />built for the web.</p>

					<div class="brand-features">
						<div class="feature-item">
							<div class="feature-pip"></div>
							<span>instant WebContainer boot</span>
						</div>
						<div class="feature-item">
							<div class="feature-pip"></div>
							<span>real-time collaboration</span>
						</div>
						<div class="feature-item">
							<div class="feature-pip"></div>
							<span>persistent cloud projects</span>
						</div>
					</div>
				</div>

				<!-- Terminal decoration -->
				<div class="deco-terminal">
					<div class="deco-chrome">
						<span></span><span></span><span></span>
					</div>
					<div class="deco-body">
						<p><span class="p">$</span> npm run dev</p>
						<p class="dim">Booting WebContainer…</p>
						<p class="ok">✓ Ready on localhost:5173</p>
						<p><span class="p">$</span> <span class="blink">_</span></p>
					</div>
				</div>
			</aside>

			<!-- Right: auth form -->
			<main class="form-col">
				<div class="form-card">
					<!-- Tab switcher -->
					<div class="form-tabs">
						<button
							class="form-tab"
							class:active={showSignIn}
							onclick={() => {
								showSignIn = true;
								errorMsg = '';
							}}>sign in</button
						>
						<button
							class="form-tab"
							class:active={!showSignIn}
							onclick={() => {
								showSignIn = false;
								errorMsg = '';
							}}>sign up</button
						>
					</div>

					<form onsubmit={handleSubmit} class="form-body">
						{#if !showSignIn}
							<div class="field" style="animation-delay: 0ms">
								<label class="field-label" for="name">name</label>
								<input
									id="name"
									class="field-input"
									type="text"
									bind:value={name}
									placeholder="Ada Lovelace"
									required
									autocomplete="name"
								/>
							</div>
						{/if}

						<div class="field" style="animation-delay: {showSignIn ? 0 : 60}ms">
							<label class="field-label" for="email">email</label>
							<input
								id="email"
								class="field-input"
								type="email"
								bind:value={email}
								placeholder="ada@example.com"
								required
								autocomplete="email"
							/>
						</div>

						<div class="field" style="animation-delay: {showSignIn ? 60 : 120}ms">
							<label class="field-label" for="password">password</label>
							<input
								id="password"
								class="field-input"
								type="password"
								bind:value={password}
								placeholder="••••••••"
								required
								autocomplete={showSignIn ? 'current-password' : 'new-password'}
							/>
						</div>

						{#if errorMsg}
							<div class="error-msg">
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<circle cx="12" cy="12" r="10" />
									<line x1="12" y1="8" x2="12" y2="12" />
									<line x1="12" y1="16" x2="12.01" y2="16" />
								</svg>
								{errorMsg}
							</div>
						{/if}

						<button class="btn-submit" type="submit" disabled={submitting}>
							{#if submitting}
								<div class="btn-spinner"></div>
								{showSignIn ? 'signing in…' : 'creating account…'}
							{:else}
								{showSignIn ? 'sign in' : 'create account'}
								<svg
									width="13"
									height="13"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<line x1="5" y1="12" x2="19" y2="12" />
									<polyline points="12 5 19 12 12 19" />
								</svg>
							{/if}
						</button>
					</form>

					<div class="divider">
						<span>or continue with</span>
					</div>

					<button class="btn-github" onclick={handleGithub}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
							/>
						</svg>
						GitHub
					</button>

					<p class="form-switch">
						{showSignIn ? 'no account?' : 'already have one?'}
						<button type="button" class="switch-link" onclick={toggle}>
							{showSignIn ? 'sign up' : 'sign in'}
						</button>
					</p>
				</div>
			</main>
		</div>
	{/if}
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

	/* ── Shell ── */
	.shell {
		min-height: 100vh;
		background: #07090d;
		color: #c0cad6;
		font-family: 'DM Sans', system-ui, sans-serif;
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bg-grid {
		position: fixed;
		inset: 0;
		pointer-events: none;
		background-image: radial-gradient(circle, #141e2d 1px, transparent 1px);
		background-size: 30px 30px;
		opacity: 0.4;
		z-index: 0;
	}

	/* Corner accent decorations */
	.corner-tl,
	.corner-br {
		position: fixed;
		width: 180px;
		height: 180px;
		pointer-events: none;
		z-index: 0;
	}

	.corner-tl {
		top: 0;
		left: 0;
		border-top: 1px solid #141e2d;
		border-left: 1px solid #141e2d;
	}

	.corner-br {
		bottom: 0;
		right: 0;
		border-bottom: 1px solid #141e2d;
		border-right: 1px solid #141e2d;
	}

	/* ── Boot/loading screen ── */
	.boot-screen {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.boot-logo {
		color: #3b7dd8;
		opacity: 0.6;
		animation: pulse 2s ease infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.4;
		}
		50% {
			opacity: 0.8;
		}
	}

	.boot-label,
	.redirect-hint {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: #1e2e40;
	}

	.session-card {
		display: flex;
		align-items: center;
		gap: 14px;
		background: #08101a;
		border: 1px solid #0e1521;
		border-radius: 10px;
		padding: 14px 18px;
	}

	.session-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #22c55e;
		box-shadow: 0 0 8px #22c55e60;
		flex-shrink: 0;
	}

	.session-info {
		flex: 1;
	}
	.session-name {
		font-size: 13px;
		color: #c0cad6;
		font-weight: 500;
	}
	.session-email {
		font-size: 10.5px;
		color: #2a3a50;
		font-family: 'JetBrains Mono', monospace;
	}

	.btn-signout {
		background: transparent;
		border: 1px solid #141e2d;
		color: #2a3a50;
		padding: 4px 10px;
		border-radius: 5px;
		font-size: 10.5px;
		font-family: 'JetBrains Mono', monospace;
		cursor: pointer;
		transition:
			color 0.15s,
			border-color 0.15s;
	}

	.btn-signout:hover {
		color: #c0cad6;
		border-color: #1e2e40;
	}

	/* ── Main stage ── */
	.stage {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: 1fr 1fr;
		max-width: 900px;
		width: 100%;
		min-height: 560px;
		margin: 2rem;
		border: 1px solid #0e1521;
		border-radius: 14px;
		overflow: hidden;
		background: #07090d;
		box-shadow: 0 24px 64px #00000070;
		animation: fadeUp 0.4s ease both;
	}

	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ── Brand column ── */
	.brand-col {
		background: #060810;
		border-right: 1px solid #0e1521;
		padding: 3rem 2.5rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 2rem;
		position: relative;
		overflow: hidden;
	}

	/* Subtle radial glow in brand column */
	.brand-col::before {
		content: '';
		position: absolute;
		top: -80px;
		left: -80px;
		width: 300px;
		height: 300px;
		background: radial-gradient(circle, #0a2040 0%, transparent 70%);
		pointer-events: none;
	}

	.brand-wrap {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.brand-logo {
		color: #3b7dd8;
		margin-bottom: 4px;
	}

	.brand-name {
		font-family: 'JetBrains Mono', monospace;
		font-size: 1.5rem;
		font-weight: 400;
		color: #dde4ed;
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.brand-dot {
		color: #3b7dd8;
	}

	.brand-tagline {
		font-size: 0.8rem;
		color: #2a3a50;
		line-height: 1.7;
		font-style: italic;
	}

	.brand-features {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 8px;
	}

	.feature-item {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 10.5px;
		color: #1e2e40;
	}

	.feature-pip {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: #162c54;
		flex-shrink: 0;
	}

	/* Terminal decoration */
	.deco-terminal {
		position: relative;
		z-index: 1;
		background: #040608;
		border: 1px solid #0a1020;
		border-radius: 8px;
		overflow: hidden;
		flex-shrink: 0;
	}

	.deco-chrome {
		display: flex;
		gap: 5px;
		padding: 8px 10px;
		background: #06080f;
		border-bottom: 1px solid #0a1020;
	}

	.deco-chrome span {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}
	.deco-chrome span:nth-child(1) {
		background: #ff5f5660;
	}
	.deco-chrome span:nth-child(2) {
		background: #ffbd2e60;
	}
	.deco-chrome span:nth-child(3) {
		background: #27c93f60;
	}

	.deco-body {
		padding: 12px 14px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 10.5px;
		color: #1e2e40;
		display: flex;
		flex-direction: column;
		gap: 4px;
		line-height: 1.6;
	}

	.deco-body .p {
		color: #3b7dd8;
		margin-right: 6px;
	}
	.deco-body .dim {
		color: #141e2d;
	}
	.deco-body .ok {
		color: #22c55e80;
	}

	/* ── Form column ── */
	.form-col {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2.5rem 2rem;
		background: #07090d;
	}

	.form-card {
		width: 100%;
		max-width: 320px;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	/* Tabs */
	.form-tabs {
		display: flex;
		gap: 0;
		background: #06080f;
		border: 1px solid #0e1521;
		border-radius: 7px;
		padding: 3px;
	}

	.form-tab {
		flex: 1;
		padding: 6px 0;
		background: transparent;
		border: none;
		border-radius: 5px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: #2a3a50;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.form-tab.active {
		background: #0e1521;
		color: #c0cad6;
	}

	/* Form fields */
	.form-body {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 5px;
		animation: fieldIn 0.3s ease both;
	}

	@keyframes fieldIn {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.field-label {
		font-family: 'JetBrains Mono', monospace;
		font-size: 10px;
		color: #2a3a50;
		letter-spacing: 0.06em;
		text-transform: lowercase;
	}

	.field-input {
		background: #06080f;
		border: 1px solid #0e1521;
		border-radius: 6px;
		padding: 9px 12px;
		font-size: 13px;
		color: #c0cad6;
		font-family: 'DM Sans', sans-serif;
		outline: none;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
		width: 100%;
	}

	.field-input::placeholder {
		color: #1a2535;
	}

	.field-input:focus {
		border-color: #1a3660;
		box-shadow: 0 0 0 2px #1a366030;
	}

	/* Error */
	.error-msg {
		display: flex;
		align-items: center;
		gap: 7px;
		background: #1a0810;
		border: 1px solid #3a1020;
		border-radius: 6px;
		padding: 8px 12px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 10.5px;
		color: #f87171;
		animation: fieldIn 0.2s ease both;
	}

	/* Submit button */
	.btn-submit {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		background: #0e1e36;
		border: 1px solid #162c54;
		color: #5080d0;
		padding: 10px 0;
		border-radius: 7px;
		font-size: 12px;
		font-family: 'JetBrains Mono', monospace;
		cursor: pointer;
		transition: all 0.15s;
		width: 100%;
		margin-top: 4px;
	}

	.btn-submit:hover:not(:disabled) {
		background: #122040;
		border-color: #2050a0;
		color: #70a0f0;
		box-shadow: 0 0 18px #0a2a6025;
	}

	.btn-submit:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn-spinner {
		width: 11px;
		height: 11px;
		border: 1.5px solid #162c54;
		border-top-color: #5080d0;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Divider */
	.divider {
		display: flex;
		align-items: center;
		gap: 10px;
		color: #141e2d;
		font-family: 'JetBrains Mono', monospace;
		font-size: 10px;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: #0e1521;
	}

	/* GitHub button */
	.btn-github {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 9px;
		background: #06080f;
		border: 1px solid #0e1521;
		color: #5a6a7e;
		padding: 9px 0;
		border-radius: 7px;
		font-size: 12px;
		font-family: 'JetBrains Mono', monospace;
		cursor: pointer;
		transition: all 0.15s;
		width: 100%;
	}

	.btn-github:hover {
		background: #0a0f18;
		border-color: #1a2535;
		color: #c0cad6;
	}

	/* Switch link */
	.form-switch {
		text-align: center;
		font-family: 'JetBrains Mono', monospace;
		font-size: 10.5px;
		color: #1e2e40;
	}

	.switch-link {
		background: none;
		border: none;
		color: #3b6aae;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: color 0.15s;
	}

	.switch-link:hover {
		color: #5a90d0;
	}

	/* ── Shared ── */
	.blink {
		animation: blink 1.1s step-end infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	/* ── Responsive ── */
	@media (max-width: 700px) {
		.stage {
			grid-template-columns: 1fr;
			margin: 1rem;
		}

		.brand-col {
			padding: 2rem 1.5rem 1.5rem;
			border-right: none;
			border-bottom: 1px solid #0e1521;
		}

		.deco-terminal {
			display: none;
		}

		.form-col {
			padding: 2rem 1.5rem;
		}
	}
</style>
