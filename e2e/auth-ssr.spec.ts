import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

function requireTestCredentials() {
	const email = process.env.TEST_USER_EMAIL;
	const password = process.env.TEST_USER_PASSWORD;

	if (!email || !password) {
		throw new Error(
			'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set. ' +
				'Copy .env.test.example to .env.test and run: pnpm run setup:test-user'
		);
	}

	return { email, password };
}

async function ensureAuthenticated(page: import('@playwright/test').Page) {
	const { email, password } = requireTestCredentials();

	await page.goto('/test/client-only');
	await expect(page.locator('[data-testid="is-loading"]')).toHaveText(/false$/, {
		timeout: 15000
	});

	const signInForm = page.locator('[data-testid="sign-in-form"]');
	const isSignInFormVisible = await signInForm.isVisible({ timeout: 5000 }).catch(() => {
		throw new Error('Could not determine if sign-in form is visible');
	});

	if (isSignInFormVisible) {
		await page.fill('[data-testid="email-input"]', email);
		await page.fill('[data-testid="password-input"]', password);
		await page.click('[data-testid="sign-in-button"]');
	}

	await expect(page.locator('[data-testid="is-authenticated"]')).toHaveText(/true$/, {
		timeout: 15000
	});

	// Ensure server-side auth state has caught up as well.
	// Some environments need one SSR round-trip after client sign-in
	// before protected SSR data is non-null.
	await page.goto('/test/ssr');
	await expect(page.locator('[data-testid="ssr-auth-state"]')).toHaveText(/true$/, {
		timeout: 15000
	});
}

/**
 * Test Scenarios:
 * 1. SSR Authenticated - Server provides auth state, client hydrates
 * 2. SSR Not Authenticated - Server says no auth, client shows login
 * 3. SSR → Sign Out - Start authenticated, sign out
 * 4. Client-only Auth - No SSR state, client handles everything
 * 5. Client-only → Sign In - Start unauthenticated, sign in
 * 6. Public Queries - Work regardless of auth state
 * 7. Protected Queries - Skip when unauthenticated, run when authenticated
 */

test.describe('SSR Authentication', () => {
	test('authenticated user sees content immediately without loading flash', async ({ page }) => {
		await page.goto('/test/ssr');

		// SSR should provide auth state immediately
		const authState = page.locator('[data-testid="auth-state"]');
		await expect(authState).toBeVisible({ timeout: 5000 });

		// isLoading should be false immediately (no loading flash)
		await expect(page.locator('[data-testid="is-loading"]')).toHaveText(/false$/);

		// isAuthenticated should be true immediately
		await expect(page.locator('[data-testid="is-authenticated"]')).toHaveText(/true$/);

		// SSR data should show authenticated state
		await expect(page.locator('[data-testid="ssr-auth-state"]')).toHaveText(/true$/);

		// User email should be visible (from SSR initialData)
		await expect(page.locator('[data-testid="user-email"]')).toBeVisible({ timeout: 5000 });
	});

	test('SSR provides initial data that persists after hydration', async ({ page }) => {
		await page.goto('/test/ssr');

		// SSR current user should be populated (not null, not undefined)
		const currentUserEl = page.locator('[data-testid="ssr-current-user"]');
		await expect(currentUserEl).toBeVisible({ timeout: 5000 });
		const userText = await currentUserEl.textContent({ timeout: 5000 });
		if (!userText || userText.includes('null') || userText.includes('undefined')) {
			throw new Error('SSR current user should not be null or undefined');
		}

		// Wait for hydration
		await page.waitForLoadState('networkidle');

		// User data should still be visible (no flash to undefined)
		await expect(page.locator('[data-testid="user-email"]')).toBeVisible({ timeout: 5000 });
		await expect(page.locator('[data-testid="user-none"]')).not.toBeVisible();
	});

	test('no loading flash on initial SSR render when authenticated', async ({ page }) => {
		// Capture the initial HTML state immediately after navigation
		// This catches bugs where isLoading flashes before settling
		const response = await page.goto('/test/ssr');
		expect(response?.status()).toBe(200);

		// Get initial DOM state BEFORE any client-side hydration effects
		const initialState = await page.evaluate(() => {
			const isLoadingEl = document.querySelector('[data-testid="is-loading"]');
			const isAuthEl = document.querySelector('[data-testid="is-authenticated"]');
			return {
				isLoading: isLoadingEl?.textContent?.includes('true'),
				isAuthenticated: isAuthEl?.textContent?.includes('true')
			};
		});

		// SSR should render isLoading: false immediately (no flash)
		expect(initialState.isLoading).toBe(false);
		expect(initialState.isAuthenticated).toBe(true);
	});
});

test.describe('SSR Not Authenticated', () => {
	test.use({ storageState: { cookies: [], origins: [] } });

	test('unauthenticated user sees correct state from SSR', async ({ page }) => {
		await page.goto('/test/ssr');

		// isLoading should be false (SSR provides definitive state)
		await expect(page.locator('[data-testid="is-loading"]')).toHaveText(/false$/);

		// isAuthenticated should be false
		await expect(page.locator('[data-testid="is-authenticated"]')).toHaveText(/false$/);

		// SSR auth state should show not authenticated
		await expect(page.locator('[data-testid="ssr-auth-state"]')).toHaveText(/false$/);
	});

	test('no loading flash on initial SSR render when unauthenticated', async ({ page }) => {
		// Capture the initial HTML state immediately after navigation
		// This catches bugs where isLoading starts as true then becomes false
		const response = await page.goto('/test/ssr');
		expect(response?.status()).toBe(200);

		// Get initial DOM state BEFORE any client-side hydration effects
		const initialState = await page.evaluate(() => {
			const isLoadingEl = document.querySelector('[data-testid="is-loading"]');
			const isAuthEl = document.querySelector('[data-testid="is-authenticated"]');
			return {
				isLoading: isLoadingEl?.textContent?.includes('true'),
				isAuthenticated: isAuthEl?.textContent?.includes('true')
			};
		});

		// SSR should render isLoading: false immediately (no flash)
		expect(initialState.isLoading).toBe(false);
		expect(initialState.isAuthenticated).toBe(false);
	});
});

test.describe('SSR Sign Out Flow', () => {
	test('authenticated user can sign out', async ({ page }) => {
		await page.goto('/test/ssr');

		// Wait for hydration to complete
		await page.waitForLoadState('networkidle');

		// Should be authenticated initially
		await expect(page.locator('[data-testid="is-authenticated"]')).toHaveText(/true$/, {
			timeout: 5000
		});
		await expect(page.locator('[data-testid="sign-out-button"]')).toBeVisible({ timeout: 5000 });

		// Wait for event handlers to be attached after hydration
		await page.waitForTimeout(500);

		// Click sign out - should be enabled and clickable
		const signOutBtn = page.locator('[data-testid="sign-out-button"]');
		await signOutBtn.click({ timeout: 5000 });

		// Should show unauthenticated state immediately after click
		await expect(page.locator('[data-testid="is-authenticated"]')).toHaveText(/false$/, {
			timeout: 10000
		});

		// Sign out button should be hidden
		await expect(page.locator('[data-testid="sign-out-button"]')).not.toBeVisible({
			timeout: 5000
		});
	});
});

test.describe('Client-only Authentication', () => {
	test.use({ storageState: { cookies: [], origins: [] } });

	test('shows loading state initially then resolves', async ({ page }) => {
		await page.goto('/test/client-only');

		// Should show sign-in form (no SSR auth)
		await expect(page.locator('[data-testid="sign-in-form"]')).toBeVisible({ timeout: 10000 });

		// isAuthenticated should be exactly false (not loading)
		await expect(page.locator('[data-testid="is-authenticated"]')).toHaveText(/false$/, {
			timeout: 10000
		});

		// isLoading should resolve to false
		await expect(page.locator('[data-testid="is-loading"]')).toHaveText(/false$/, {
			timeout: 10000
		});
	});

	test('isLoading is true on initial render without SSR state', async ({ page }) => {
		// Capture the initial HTML state immediately after navigation
		// Without SSR state, isLoading should be true initially
		const response = await page.goto('/test/client-only');
		if (response?.status() !== 200) {
			throw new Error(`Expected status 200 but got ${response?.status()}`);
		}

		// Get initial DOM state - should show loading since no SSR state
		const initialState = await page.evaluate(() => {
			const isLoadingEl = document.querySelector('[data-testid="is-loading"]');
			const loadingStateEl = document.querySelector('[data-testid="loading-state"]');
			if (!isLoadingEl) throw new Error('is-loading element not found');
			if (!loadingStateEl) throw new Error('loading-state element not found');
			return {
				isLoadingText: isLoadingEl.textContent?.includes('true') ?? false,
				loadingStateVisible: loadingStateEl !== null
			};
		});

		// Without SSR state, isLoading should be true initially
		if (!initialState.isLoadingText) {
			throw new Error('isLoading should be true on initial render');
		}
		if (!initialState.loadingStateVisible) {
			throw new Error('loading-state should be visible on initial render');
		}

		// Wait for auth to resolve - should show sign-in form
		await expect(page.locator('[data-testid="sign-in-form"]')).toBeVisible({ timeout: 10000 });

		// After resolution, isLoading should be exactly false
		await expect(page.locator('[data-testid="is-loading"]')).toHaveText(/false$/, {
			timeout: 10000
		});
	});

	test('can sign in from unauthenticated state', async ({ page }) => {
		const { email, password } = requireTestCredentials();

		await page.goto('/test/client-only');

		// Wait for sign in form
		await expect(page.locator('[data-testid="sign-in-form"]')).toBeVisible({ timeout: 10000 });
		// Verify email input is enabled
		await expect(page.locator('[data-testid="email-input"]')).toBeEditable({ timeout: 5000 });

		// Fill credentials
		await page.fill('[data-testid="email-input"]', email);
		await page.fill('[data-testid="password-input"]', password);

		// Verify filled credentials before submit
		const filledEmail = await page.inputValue('[data-testid="email-input"]');
		if (filledEmail !== email)
			throw new Error(`Email input mismatch: expected ${email}, got ${filledEmail}`);

		// Submit
		const signInBtn = page.locator('[data-testid="sign-in-button"]');
		await signInBtn.click({ timeout: 5000 });

		// Should show authenticated state
		await expect(page.locator('[data-testid="authenticated-state"]')).toBeVisible({
			timeout: 10000
		});
		await expect(page.locator('[data-testid="is-authenticated"]')).toHaveText(/true$/, {
			timeout: 10000
		});

		// User email should appear and be exact
		const userEmailEl = page.locator('[data-testid="user-email"]');
		await expect(userEmailEl).toBeVisible({ timeout: 5000 });
		const userEmailText = await userEmailEl.textContent();
		if (!userEmailText?.includes(email)) throw new Error(`User email should contain ${email}`);
	});
});

test.describe('Query Behavior - Authenticated', () => {
	test('public query runs and shows data', async ({ page }) => {
		await ensureAuthenticated(page);

		await page.goto('/test/queries');

		// Public query should show exact data
		await expect(page.locator('[data-testid="public-message"]')).toHaveText('This is public data', {
			timeout: 8000
		});
	});

	test('protected query runs when authenticated', async ({ page }) => {
		await ensureAuthenticated(page);

		await page.goto('/test/queries');

		// Should be authenticated
		await expect(page.locator('[data-testid="is-authenticated"]')).toHaveText(/true$/, {
			timeout: 5000
		});

		const protectedEmail = page.locator('[data-testid="protected-email"]');
		await expect(protectedEmail).toBeVisible({ timeout: 8000 });
		const emailText = await protectedEmail.textContent({ timeout: 5000 });
		if (!emailText || emailText.includes('null') || emailText.length === 0) {
			throw new Error('Protected email should contain actual email, not null or empty');
		}
	});

	test('SSR provides initial data for both queries', async ({ page }) => {
		await ensureAuthenticated(page);

		await page.goto('/test/queries');

		// SSR public data should be present in the labeled value
		await expect(page.locator('[data-testid="ssr-public"]')).toHaveText(/This is public data$/, {
			timeout: 5000
		});

		// SSR protected data should be present (authenticated user) - not null or empty
		const ssrProtected = page.locator('[data-testid="ssr-protected"]');
		await expect(ssrProtected).toBeVisible({ timeout: 5000 });
		const protectedText = await ssrProtected.textContent();
		if (!protectedText || protectedText.includes('null')) {
			throw new Error('SSR protected data should not be null');
		}
	});
});

test.describe('Query Behavior - Unauthenticated', () => {
	test.use({ storageState: { cookies: [], origins: [] } });

	test('public query runs without auth', async ({ page }) => {
		await page.goto('/test/queries');

		// Public query should still work - exact match
		await expect(page.locator('[data-testid="public-message"]')).toHaveText('This is public data', {
			timeout: 8000
		});
	});

	test('protected query is skipped when unauthenticated', async ({ page }) => {
		await page.goto('/test/queries');

		// Should not be authenticated
		await expect(page.locator('[data-testid="is-authenticated"]')).toHaveText(/false$/, {
			timeout: 5000
		});

		// Protected query should be skipped - must be visible as explicit skip indicator
		await expect(page.locator('[data-testid="protected-skipped"]')).toBeVisible({ timeout: 5000 });
	});
});
