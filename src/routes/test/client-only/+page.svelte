<script lang="ts">
	import { api } from '$convex/_generated/api.js';
	import { useQuery } from 'convex-svelte';
	import { useAuth } from '$lib/svelte/index.js';
	import { authClient } from '$lib/context/auth-client.js';

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

<h1>Client-Only Authentication Test</h1>
<p>This page has NO SSR auth state. Auth is purely client-side.</p>

<div>
	<div data-testid="auth-state">
		<h2>Auth State</h2>
		<ul>
			<li data-testid="is-loading">
				<strong>isLoading:</strong>
				{auth.isLoading}
			</li>
			<li data-testid="is-authenticated">
				<strong>isAuthenticated:</strong>
				{auth.isAuthenticated}
			</li>
		</ul>
	</div>

	<div data-testid="user-data">
		<h2>User Data</h2>
		{#if auth.isLoading}
			<p data-testid="user-loading">Loading...</p>
		{:else if user.isLoading}
			<p data-testid="user-loading">Loading user...</p>
		{:else if user.data}
			<p data-testid="user-email">{user.data.email}</p>
		{:else}
			<p data-testid="user-none">No user data</p>
		{/if}
	</div>

	{#if auth.isLoading}
		<div data-testid="loading-state">
			<p>Checking authentication...</p>
		</div>
	{:else if auth.isAuthenticated}
		<div data-testid="authenticated-state">
			<p>You're are signed in!</p>
			<button onclick={SignOut} data-testid="sign-out-button"> Sign Out </button>
		</div>
	{:else}
		<form onsubmit={SignIn} data-testid="sign-in-form">
			<h2>Sign In</h2>
			<div>
				<label for="email">Email</label>
				<input type="email" id="email" bind:value={email} data-testid="email-input" required />
			</div>
			<div>
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					data-testid="password-input"
					required
				/>
			</div>
			<button type="submit" disabled={isSubmitting} data-testid="sign-in-button">
				{isSubmitting ? 'Signing in...' : 'Sign In'}
			</button>
		</form>
	{/if}
</div>
