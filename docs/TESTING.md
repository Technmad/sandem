**[← Home](./README.md) | [← Previous](./10_Next_Steps.md)**

---

# Testing Guide for Developers

> How to write strict, reliable tests that catch real failures

## Testing Philosophy

Tests in this project are **strict by default**. We avoid false positives by:

- Making timing expectations explicit (always set timeouts)
- Validating data quality, not just absence of errors
- Using exact assertions instead of loose string matching
- Handling errors explicitly instead of silently swallowing them
- Cleaning up resources properly with try-finally blocks

This guide shows you how to follow these patterns when writing new tests.

---

## Best Practices

### 1. Always Set Explicit Timeouts

Elements don't magically appear. Always tell Playwright how long to wait.

**❌ Don't:**

```typescript
if (await signInForm.isVisible()) {
	// ...
}
```

**✅ Do:**

```typescript
const isSignInVisible = await signInForm.isVisible({ timeout: 5000 });
if (isSignInVisible) {
	// ...
}
```

**Why:** Makes timing expectations explicit. Fails faster when elements don't appear within the expected window.

---

### 2. Use Exact Assertions Instead of Substring Matching

`toHaveText()` checks exact content. `toContainText()` is loose and can hide issues.

**❌ Don't:**

```typescript
await expect(page.locator('[data-testid="is-loading"]')).toContainText('false');
// Passes even if text is "something false something"
```

**✅ Do:**

```typescript
await expect(page.locator('[data-testid="is-loading"]')).toHaveText('false');
// Only passes if the ENTIRE text content is exactly 'false'
```

**Why:** Prevents false passes when your assertion string appears buried in larger output.

---

### 3. Validate Data Quality, Not Just Absence of Errors

Don't just check that "null" doesn't appear. Check that valid data is present.

**❌ Don't:**

```typescript
await expect(page.locator('[data-testid="ssr-current-user"]')).not.toContainText('null');
// Could still contain invalid or malformed data
```

**✅ Do:**

```typescript
const currentUserEl = page.locator('[data-testid="ssr-current-user"]');
await expect(currentUserEl).toBeVisible({ timeout: 5000 });
const userText = await currentUserEl.textContent({ timeout: 5000 });

if (!userText || userText.includes('null') || userText.includes('undefined')) {
	throw new Error('SSR current user should not be null or undefined');
}
if (userText.length === 0) {
	throw new Error('User text is empty');
}
```

**Why:** Validates that data is present and in the expected format, not just "not broken".

---

### 4. Verify Input Values Before Proceeding

Fill operations can fail silently. Verify they succeeded.

**❌ Don't:**

```typescript
await page.fill('[data-testid="email-input"]', email);
// Assume it worked
await page.click('[data-testid="submit-btn"]');
```

**✅ Do:**

```typescript
await page.fill('[data-testid="email-input"]', email);
const filledEmail = await page.inputValue('[data-testid="email-input"]');

if (filledEmail !== email) {
	throw new Error(`Email input mismatch: expected ${email}, got ${filledEmail}`);
}

await page.click('[data-testid="submit-btn"]');
```

**Why:** Catches silent failures where inputs don't populate, preventing cascading test failures.

---

### 5. Use Explicit Error Handling for Multiple Paths

Don't use `catch()` to silently handle multiple possible states.

**❌ Don't:**

```typescript
if (await signInForm.isVisible().catch(() => false)) {
	// What does false mean? Timeout? Element doesn't exist? Error?
}
```

**✅ Do:**

```typescript
const isSignInVisible = await signInForm.isVisible({ timeout: 5000 }).catch(() => false);
const isAuthenticated = await authenticatedCard.isVisible({ timeout: 5000 }).catch(() => false);

if (!isSignInVisible && !isAuthenticated) {
	throw new Error('Neither sign-in form nor authenticated state visible');
}
```

**Why:** Makes it clear what states are valid and what should be treated as failures.

---

### 6. Use Try-Finally for Resource Cleanup

Always clean up resources, even if the test fails.

**❌ Don't:**

```typescript
await signInIfNeeded(page1);
// ... test code ...
await ctx1.close();
await ctx2.close();
```

**✅ Do:**

```typescript
try {
	await signInIfNeeded(page1);
	// ... test code ...
} finally {
	await ctx1.close();
	await ctx2.close();
}
```

**Why:** Ensures cleanup happens even if the test throws an error midway. Prevents resource leaks.

---

### 7. Add Multiple Assertions Per Test

A single test should validate the complete scenario. Use multiple assertions.

**❌ Don't:**

```typescript
it('reports error text', () => {
	const appError = report('Request denied', new Error('Token expired'));
	expect(appError).toEqual({
		/* ... */
	});
});
```

**✅ Do:**

```typescript
it('reports error text through callback and returns app error', () => {
	const appError = report('Request denied', new Error('Token expired'));

	// Validate structure
	expect(appError).toEqual({
		/* ... */
	});

	// Validate individual properties
	expect(appError.message).toBe('Request denied');
	expect(appError.code).toBe('UNAUTHORIZED');
	expect(appError.requestId).toBe('base-request');

	// Validate side effects
	expect(setError).toHaveBeenCalledTimes(1);
	expect(setError).toHaveBeenCalledWith(expect.stringContaining('[UNAUTHORIZED]'));

	// Validate error message quality
	const callArgument = setError.mock.calls[0]?.[0] ?? '';
	expect(callArgument).toContain('[UNAUTHORIZED] Request denied');
	expect(callArgument).toContain('[INTERNAL_ERROR] Token expired');
	expect(callArgument.length).toBeGreaterThan(0);
});
```

**Why:** Tests validate complete behavior and edge cases. A single test failure tells you exactly what broke.

---

### 8. For Multi-User/Async Tests: Use Convergence Assertions

When testing distributed state, explicitly assert convergence.

**❌ Don't:**

```typescript
await expect
	.poll(async () => getAllMonacoContent(page1), { timeout: 60000 })
	.toContain(markerBToken);
// Doesn't tell you what the actual content was
```

**✅ Do:**

```typescript
const page1HasBoth = await expect
	.poll(async () => getAllMonacoContent(page1), { timeout: 30000 })
	.toContain(markerBToken);

if (!page1HasBoth) {
	const actualContent = await getAllMonacoContent(page1);
	throw new Error(
		`Page1 did not receive markerB (convergence failed). Actual content: ${actualContent}`
	);
}
```

**Why:** Provides explicit failure messages showing what the actual state was, not just "assertion failed".

---

## E2E Test Patterns

### Testing Auth Flows

```typescript
// 1. Verify initial state
const isSignInVisible = await signInForm.isVisible({ timeout: 5000 });
if (!isSignInVisible) throw new Error('Sign-in form not visible on load');

// 2. Perform action
await page.fill('[data-testid="email"]', testEmail);
await page.fill('[data-testid="password"]', testPassword);
await page.click('[data-testid="submit"]');

// 3. Verify state changed
const isAuthenticatedNow = await authenticatedCard.isVisible({ timeout: 10000 });
if (!isAuthenticatedNow) throw new Error('Auth state did not update after sign-in');

// 4. Verify data quality
const userEl = page.locator('[data-testid="current-user"]');
const userName = await userEl.textContent({ timeout: 5000 });
if (!userName || userName === 'null') {
	throw new Error('User name is invalid after authentication');
}
```

### Testing Editor Changes

```typescript
// 1. Setup
await editor.focus();
await page.keyboard.type('const x = 42;');

// 2. Verify input was registered
const editorContent = await getMonacoContent(page);
if (!editorContent.includes('const x = 42;')) {
	throw new Error('Text not found in editor after typing');
}

// 3. Wait for side effects (autosave, collaboration, etc.)
await expect.poll(async () => hasSyncedToServer(page), { timeout: 10000 }).toBeTruthy();

// 4. Verify persistence
if (!(await hasSyncedToServer(page))) {
	throw new Error('Changes did not sync to server');
}
```

### Testing Collaboration

```typescript
try {
	// Setup both clients
	const page1Content = 'marker from page1';
	const page2Content = 'marker from page2';

	// Page 1 makes change
	await page1.focus();
	await page1.keyboard.type(page1Content);

	// Page 2 makes change
	await page2.focus();
	await page2.keyboard.type(page2Content);

	// Assert convergence: both see both changes
	const page1HasBoth = await expect
		.poll(async () => getAllMonacoContent(page1), { timeout: 30000 })
		.toContain(page2Content);

	if (!page1HasBoth) throw new Error('Page1 did not converge');

	const page2HasBoth = await expect
		.poll(async () => getAllMonacoContent(page2), { timeout: 30000 })
		.toContain(page1Content);

	if (!page2HasBoth) throw new Error('Page2 did not converge');
} finally {
	await context1.close();
	await context2.close();
}
```

---

## Unit Test Patterns

### Testing Error Utilities

```typescript
describe('createAppError', () => {
	it('preserves error message and adds context', () => {
		const originalError = new Error('Network timeout');
		const appError = createAppError(originalError, { context: 'fetch' });

		// Validate message
		expect(appError.message).toBe('Network timeout');

		// Validate code assignment
		expect(appError.code).toBeDefined();

		// Validate context was added
		expect(appError.originalError).toBe(originalError);

		// Validate it's an AppError
		expect(appError instanceof AppError).toBe(true);
	});
});
```

### Testing Async Utilities

```typescript
it('retries on failure and succeeds on third attempt', async () => {
	let attempts = 0;
	const fn = async () => {
		attempts++;
		if (attempts < 3) throw new Error('Not ready yet');
		return 'success';
	};

	const result = await retryWithBackoff(fn, { maxRetries: 3 });

	expect(result).toBe('success');
	expect(attempts).toBe(3);
});
```

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests once
pnpm run test

# Run unit tests in watch mode
pnpm run test:unit

# Run specific test file
pnpm run test src/demo.spec.ts

# Run tests matching a pattern
pnpm run test --grep "error"
```

### E2E Tests

```bash
# Run all E2E tests
pnpm run test:e2e

# Run specific E2E test
pnpm run test:e2e e2e/auth-ssr.spec.ts

# Run in UI mode (interactive)
pnpm run test:e2e --ui

# Run with headed browser (see what's happening)
pnpm run test:e2e --headed
```

### First Time Setup

```bash
# Install Playwright browsers
pnpm run test:e2e:install-browsers

# Setup test user (if E2E tests require auth)
pnpm run setup:test-user
```

---

## Common Issues

### Test Times Out

**Problem:** Test waits forever for element that never appears.

**Solution:** Check your timeout value and increase if needed. Look at browser logs:

```bash
pnpm run test:e2e --debug
```

### Test Passes Locally but Fails in CI

**Problem:** Timing is different in CI environment.

**Solution:**

- Increase timeouts in CI (use `PLAYWRIGHT_TIMEOUT` env var)
- Check for animations or transitions that take longer
- Verify test data is set up correctly in CI

### Flaky Test (Sometimes Passes, Sometimes Fails)

**Problem:** Race conditions or timing-dependent assertions.

**Solution:**

- Add explicit waits for state changes
- Use `expect.poll()` instead of single assertions
- Check for missing `.catch()` blocks that hide errors

### Test Creates Side Effects

**Problem:** Test leaves data behind, affects other tests.

**Solution:**

- Use try-finally to cleanup
- Create unique test data (timestamps, GUIDs)
- Run tests in isolation if needed

---

## Test File Organization

```
project-root/
├── e2e/
│   ├── auth-ssr.spec.ts          # Auth flow validation
│   ├── repo-happy-path.spec.ts    # Happy path & collaboration
│   └── auth.setup.ts              # Shared setup (creates test user)
├── src/
│   ├── demo.spec.ts               # Error utility tests
│   └── ... (other unit tests)
└── docs/
    └── TESTING.md                 # This file
```

---

## Checklist for New Tests

When writing a new test, verify:

- [ ] All waits have explicit timeouts
- [ ] Assertions are exact (`toHaveText` not `toContainText`)
- [ ] Data quality is validated, not just absence of errors
- [ ] Input operations are verified immediately after
- [ ] Resources are cleaned up in finally blocks
- [ ] Multiple assertions validate complete behavior
- [ ] Error messages are descriptive
- [ ] Async operations use proper polling/convergence
- [ ] Test data is unique/isolated
- [ ] Test can run independently of other tests

---

## Benefits of Strict Tests

✅ **Catch Real Issues**: No more false positives  
✅ **Fail Fast**: Tests fail immediately when something breaks  
✅ **Clear Messages**: Error messages explain what went wrong  
✅ **Prevent Flakes**: Explicit timing prevents race conditions  
✅ **Data Validation**: Confirms quality, not just presence  
✅ **Resource Safety**: Cleanup guaranteed even on failure  
✅ **Reliable CI**: Same results locally and in CI  
✅ **Confidence**: Green tests mean the code actually works

---

**[← Previous](./10_Next_Steps.md) | [Home](./README.md)**

---

## Further Reading

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Principles](https://testing-library.com/docs/principles)
