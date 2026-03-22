<script lang="ts">
	import { authClient } from '$lib/context';
	import { api } from '$convex/_generated/api.js';
	import { useQuery } from 'convex-svelte';
	import { useAuth } from '$lib/svelte/index.js';
	import Button from '$lib/components/ui/primitives/Button.svelte';
	import Form from '$lib/components/ui/primitives/Form.svelte';
	import Grid from '$lib/components/ui/primitives/Grid.svelte';
	import Tabs from '$lib/components/ui/primitives/Tabs.svelte';
	import type { AuthLayoutData } from '../../../types/routes.js';

	let { data }: { data: AuthLayoutData } = $props();

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

	const authTabs = $derived([
		{ id: 'signin', label: 'Sign in', active: showSignIn },
		{ id: 'signup', label: 'Sign up', active: !showSignIn }
	]);

	function setAuthTab(id: string) {
		showSignIn = id === 'signin';
		errorMsg = '';
	}
</script>

<div class="shell">
	{#if isLoading}
		<div class="center-screen">
			<p class="muted">initialising<span class="blink">_</span></p>
		</div>
	{:else if isAuthenticated && user}
		<div class="center-screen">
			<div class="session-card">
				<div>
					<p class="session-name">{user.name ?? 'User'}</p>
					<p class="muted">{user.email}</p>
				</div>
				<Button variant="outline" tone="warning" onclick={signOut}>Sign out</Button>
			</div>
			<p class="muted">redirecting to projects<span class="blink">_</span></p>
		</div>
	{:else}
		<div class="stage">
			<aside class="brand-col">
				<h1>sandem<span class="dot">.</span></h1>
				<p class="muted">in-browser dev environments, built for the web.</p>
				<Grid minWidth="12rem" gap="0.5rem" variant="compact">
					<div class="feature">instant WebContainer boot</div>
					<div class="feature">real-time collaboration</div>
					<div class="feature">persistent cloud projects</div>
				</Grid>
			</aside>

			<main class="form-col">
				<div class="auth-card">
					<Tabs variant="pills" tone="accent" tabs={authTabs} onSelect={setAuthTab} />

					<Form
						preset="card"
						variant="accent"
						ariaLabel="Authentication form"
						onsubmit={handleSubmit}
					>
						{#if !showSignIn}
							<label class="field" for="name">
								<span>Name</span>
								<input
									id="name"
									type="text"
									bind:value={name}
									placeholder="Ada Lovelace"
									required
									autocomplete="name"
								/>
							</label>
						{/if}

						<label class="field" for="email">
							<span>Email</span>
							<input
								id="email"
								type="email"
								bind:value={email}
								placeholder="ada@example.com"
								required
								autocomplete="email"
							/>
						</label>

						<label class="field" for="password">
							<span>Password</span>
							<input
								id="password"
								type="password"
								bind:value={password}
								placeholder="••••••••"
								required
								autocomplete={showSignIn ? 'current-password' : 'new-password'}
							/>
						</label>

						{#if errorMsg}
							<p class="error-msg">{errorMsg}</p>
						{/if}

						<Button type="submit" tone="accent" disabled={submitting}>
							{submitting
								? showSignIn
									? 'Signing in…'
									: 'Creating account…'
								: showSignIn
									? 'Sign in'
									: 'Create account'}
						</Button>
					</Form>

					<div class="auth-actions">
						<Button variant="outline" tone="neutral" onclick={handleGithub}
							>Continue with GitHub</Button
						>
						<Button variant="link" tone="info" onclick={toggle}>
							{showSignIn ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
						</Button>
					</div>
				</div>
			</main>
		</div>
	{/if}
</div>

<style>
	.shell {
		min-height: calc(100dvh - 4rem);
		display: grid;
		place-items: center;
		padding: 1rem;
	}

	.center-screen {
		display: grid;
		gap: 0.8rem;
		width: min(32rem, 100%);
	}

	.session-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--fg);
	}

	.session-name {
		font-weight: 600;
		margin: 0;
	}

	.stage {
		width: min(68rem, 100%);
		display: grid;
		grid-template-columns: 1fr minmax(20rem, 28rem);
		gap: 1rem;
	}

	.brand-col {
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--fg);
		display: grid;
		align-content: start;
		gap: 0.75rem;
	}

	h1 {
		margin: 0;
		font-size: 1.5rem;
	}

	.dot {
		color: var(--accent);
	}

	.feature {
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font-size: 0.86rem;
		color: var(--muted);
	}

	.form-col,
	.auth-card {
		display: grid;
		gap: 0.75rem;
	}

	.field {
		display: grid;
		gap: 0.35rem;
		font-size: 0.86rem;
		color: var(--muted);
	}

	.error-msg {
		margin: 0;
		padding: 0.5rem 0.6rem;
		border: 1px solid color-mix(in srgb, var(--error) 45%, var(--border));
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--error) 8%, transparent);
		color: var(--error);
		font-size: 0.85rem;
	}

	.auth-actions {
		display: grid;
		gap: 0.45rem;
	}

	.muted {
		margin: 0;
		color: var(--muted);
	}

	.blink {
		animation: blink 1s step-end infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	@media (max-width: 860px) {
		.stage {
			grid-template-columns: 1fr;
		}
	}
</style>
