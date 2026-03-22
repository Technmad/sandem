<script lang="ts">
	import { api } from '$convex/_generated/api.js';
	import { useQuery } from 'convex-svelte';
	import { useAuth } from '$lib/svelte/index.js';
	import { authClient } from '$lib/context';
	import PageSection from '$lib/components/ui/layout/PageSection.svelte';
	import Card from '$lib/components/ui/primitives/Card.svelte';
	import Form from '$lib/components/ui/primitives/Form.svelte';
	import Button from '$lib/components/ui/primitives/Button.svelte';

	const auth = useAuth();

	// Protected query without SSR initial data
	const user = useQuery(api.auth.getCurrentUser, () => (auth.isAuthenticated ? {} : 'skip'));

	// Form state
	let email = $state('');
	let password = $state('');
	let isSubmitting = $state(false);

	async function SignIn(event: Event) {
		event.preventDefault();
		isSubmitting = true;
		try {
			await authClient.signIn.email({ email, password });
		} catch (error) {
			console.error('Sign in error:', error);
		} finally {
			isSubmitting = false;
		}
	}

	async function SignOut() {
		await authClient.signOut();
	}
</script>

<PageSection
	heading="Client-Only Authentication Test"
	label="Client auth test page"
	variant="split"
>
	<p>This page has NO SSR auth state. Auth is purely client-side.</p>

	{#snippet aside()}
		<Card data-testid="auth-state" title="Auth State" variant="outline">
			<ul class="state-list">
				<li data-testid="is-loading"><strong>isLoading:</strong> {auth.isLoading}</li>
				<li data-testid="is-authenticated">
					<strong>isAuthenticated:</strong>
					{auth.isAuthenticated}
				</li>
			</ul>
		</Card>

		<Card data-testid="user-data" title="User Data" variant="outline">
			{#if auth.isLoading}
				<p data-testid="user-loading">Loading...</p>
			{:else if user.isLoading}
				<p data-testid="user-loading">Loading user...</p>
			{:else if user.data}
				<p data-testid="user-email">{user.data.email}</p>
			{:else}
				<p data-testid="user-none">No user data</p>
			{/if}
		</Card>
	{/snippet}

	{#if auth.isLoading}
		<Card data-testid="loading-state" title="Authentication" tone="info">
			<p>Checking authentication...</p>
		</Card>
	{:else if auth.isAuthenticated}
		<Card data-testid="authenticated-state" title="Signed In" tone="success">
			<p>You're signed in.</p>
			<Button onclick={SignOut} data-testid="sign-out-button">Sign Out</Button>
		</Card>
	{:else}
		<Card title="Sign In" tone="accent">
			<Form ariaLabel="sign-in-form" onsubmit={SignIn}>
				<div class="field" data-testid="sign-in-form">
					<label for="email">Email</label>
					<input type="email" id="email" bind:value={email} data-testid="email-input" required />
				</div>

				<div class="field">
					<label for="password">Password</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						data-testid="password-input"
						required
					/>
				</div>

				<Button type="submit" disabled={isSubmitting} data-testid="sign-in-button">
					{isSubmitting ? 'Signing in...' : 'Sign In'}
				</Button>
			</Form>
		</Card>
	{/if}
</PageSection>

<style>
	.state-list {
		display: grid;
		gap: 0.4rem;
	}

	.field {
		display: grid;
		gap: 0.35rem;
	}

	label {
		font-size: 0.85rem;
		color: var(--muted);
	}

	input {
		border: 1px solid var(--border);
		background: var(--bg);
		padding: 0.45rem 0.55rem;
		border-radius: 0.45rem;
	}
</style>
