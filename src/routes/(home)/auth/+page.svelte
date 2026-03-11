<script lang="ts">
	import { authClient } from '$lib/context/auth-client.js';
	import { api } from '$convex/_generated/api.js';
	import { useQuery } from 'convex-svelte';
	import { useAuth } from '$lib/svelte/index.js';

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
	{#if isLoading}
		<div class="boot-screen">
			<p class="boot-label">initialising<span class="blink">_</span></p>
		</div>
	{:else if isAuthenticated && user}
		<!-- Already signed in — shows briefly before redirect -->
		<div class="boot-screen">
			<div class="session-card">
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
