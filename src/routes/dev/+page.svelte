<script lang="ts">
	import { authClient } from '$lib/auth-client.js';
	import { api } from '$convex/_generated/api.js';
	import { useQuery } from 'convex-svelte';
	import { useAuth } from '$lib/svelte/index.js';
	import  Button  from '$lib/components/ui/Button.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { data } = $props();

	// Auth state store
	const auth = useAuth();
	const isLoading = $derived(auth.isLoading);
	const isAuthenticated = $derived(auth.isAuthenticated);

	$inspect(auth.isLoading, 'isLoading');
	$inspect(auth.isAuthenticated, 'isAuthenticated');

	const currentUserResponse = useQuery(
		api.auth.getCurrentUser,
		() => (auth.isAuthenticated ? {} : 'skip'),
		() => ({
			initialData: data.currentUser,
			keepPreviousData: true
		})
	);
	let user = $derived(currentUserResponse.data);
	$inspect(currentUserResponse, 'currentUserResponse');
	$inspect(user, 'user');

	// Sign in/up form state
	let showSignIn = $state(true);
	let name = $state('');
	let email = $state('');
	let password = $state('');

	// Handle form submission
	async function handlePasswordSubmit(event: Event) {
		event.preventDefault();

		try {
			if (showSignIn) {
				await authClient.signIn.email(
					{ email, password },
					{
						onError: (ctx) => {
							alert(ctx.error.message);
						}
					}
				);
			} else {
				await authClient.signUp.email(
					{ name, email, password },
					{
						onError: (ctx) => {
							alert(ctx.error.message);
						}
					}
				);
			}
		} catch (error) {
			console.error('Authentication error:', error);
		}
	}

	// Sign out function
	async function signOut() {
		const result = await authClient.signOut();
		if (result.error) {
			console.error('Sign out error:', result.error);
		}
	}

	// Toggle between sign in and sign up
	function toggleSignMode() {
		showSignIn = !showSignIn;
		// Clear form fields when toggling
		name = '';
		email = '';
		password = '';
	}

	// Demo: Fetch access token
	let accessToken = $state<string | null>(null);
	let tokenLoading = $state(false);

	async function fetchToken() {
		tokenLoading = true;
		try {
			const token = await auth.fetchAccessToken({ forceRefreshToken: true });
			accessToken = token;
		} catch (error) {
			console.error('Error fetching access token:', error);
			accessToken = 'Error fetching token';
		} finally {
			tokenLoading = false;
		}
	}
</script>

<div>
	{#if isLoading}
		<div>Loading...</div>
	{:else if !isAuthenticated}
		<!-- Sign In Component -->
		<div class="flex w-full max-w-md flex-col gap-4 rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-6 text-center text-2xl font-bold text-gray-800">
				{showSignIn ? 'Sign In' : 'Sign Up'}
			</h2>

			<form onsubmit={handlePasswordSubmit} class="flex flex-col gap-4">
				{#if !showSignIn}
					<input
						bind:value={name}
						placeholder="Name"
						required
						class="rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				{/if}
				<input
					type="email"
					bind:value={email}
					placeholder="Email"
					required
					class="rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				<input
					type="password"
					bind:value={password}
					placeholder="Password"
					required
					class="rounded-md border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
				<button
					type="submit"
					class="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
				>
					{showSignIn ? 'Sign in' : 'Sign up'}
				</button>
			</form>
			<div
				class="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-gray-300 after:mt-0.5 after:flex-1 after:border-t after:border-gray-300"
			>
				<p class="mx-4 mb-0 text-center text-sm font-semibold text-gray-600">OR</p>
			</div>

			<button
				type="button"
				onclick={() => authClient.signIn.social({ provider: 'github' })}
				class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-white transition-colors hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none"
			>
				<svg class="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill-rule="evenodd"
						d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
						clip-rule="evenodd"
					/>
				</svg>
				Continue with GitHub
			</button>

			<p class="mt-4 text-center text-gray-600">
				{showSignIn ? "Don't have an account? " : 'Already have an account? '}
				<button
					type="button"
					onclick={toggleSignMode}
					class="cursor-pointer border-none bg-transparent text-blue-600 underline hover:text-blue-800"
				>
					{showSignIn ? 'Sign up' : 'Sign in'}
				</button>
			</p>
		</div>
	{:else if isAuthenticated}
		<!-- Dashboard Component -->
		<div>
			<div>
				Hello {user?.name}!
			</div>

			<!-- Demo: Access Token Section -->
			<div>
				<h3>Access Token Demo</h3>
				<Button variant="pop" onclick={fetchToken} disabled={tokenLoading}>
					{tokenLoading ? 'Fetching...' : 'Fetch Access Token'}
				</Button>
				{#if accessToken}
					<div>
						{accessToken.length > 50 ? accessToken.substring(0, 50) + '...' : accessToken}
					</div>
				{/if}
			</div>

			<Button variant="push" onclick={signOut}>Sign out</Button>
			<ThemeToggle />
		</div>
	{/if}
</div>
