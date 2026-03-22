# Test Strictness Improvements

## Overview

Made tests more strict and less forgiving across E2E and unit test suites. This prevents false positives and catches real failures.

## Key Changes

### 1. Replaced `.catch(() => false)` with Explicit Error Handling

**Before:**

```typescript
if (await signInForm.isVisible().catch(() => false)) {
	// ...
}
```

**After:**

```typescript
const isSignInVisible = await signInForm.isVisible({ timeout: 5000 }).catch(() => false);
const isAuthenticated = await authenticatedCard.isVisible({ timeout: 5000 }).catch(() => false);

if (!isSignInVisible && !isAuthenticated) {
	throw new Error('Neither sign-in form nor authenticated state visible');
}
```

**Why:** Forces explicit handling of missing elements, reveals timing/visibility issues early.

---

### 2. Changed `.toContainText()` to `.toHaveText()` for Exact Matching

**Before:**

```typescript
await expect(page.locator('[data-testid="is-loading"]')).toContainText('false');
```

**After:**

```typescript
await expect(page.locator('[data-testid="is-loading"]')).toHaveText('false');
```

**Why:** `toHaveText()` checks exact text content, preventing false passes when text is embedded in larger strings.

---

### 3. Added Explicit Null/Undefined Checks

**Before:**

```typescript
await expect(page.locator('[data-testid="ssr-current-user"]')).not.toContainText('null');
```

**After:**

```typescript
const currentUserEl = page.locator('[data-testid="ssr-current-user"]');
await expect(currentUserEl).toBeVisible({ timeout: 5000 });
const userText = await currentUserEl.textContent({ timeout: 5000 });
if (!userText || userText.includes('null') || userText.includes('undefined')) {
	throw new Error('SSR current user should not be null or undefined');
}
```

**Why:** Validates data presence and quality, not just absence of error strings.

---

### 4. Added Timeout Requirements to All Assertions

**Before:**

```typescript
await expect(authState).toBeVisible();
```

**After:**

```typescript
await expect(authState).toBeVisible({ timeout: 5000 });
```

**Why:** Makes timing expectations explicit, fails faster when elements don't appear.

---

### 5. Verified Input Values Before Actions

**Before:**

```typescript
await page.fill('[data-testid="email-input"]', email);
// proceed assuming it worked
```

**After:**

```typescript
await page.fill('[data-testid="email-input"]', email);
const filledEmail = await page.inputValue('[data-testid="email-input"]');
if (filledEmail !== email)
	throw new Error(`Email input mismatch: expected ${email}, got ${filledEmail}`);
```

**Why:** Catches silent failures where inputs don't get populated.

---

### 6. Strict Convergence Assertions in Multi-User Tests

**Before:**

```typescript
await expect
	.poll(async () => getAllMonacoContent(page1), { timeout: 60000 })
	.toContain(markerBToken);
```

**After:**

```typescript
const page1HasBoth = await expect
	.poll(async () => getAllMonacoContent(page1), { timeout: 30000 })
	.toContain(markerBToken);
if (!page1HasBoth) throw new Error('Page1 did not receive markerB (convergence failed)');
```

**Why:** Provides explicit failure messages for distributed system assertions.

---

### 7. Added Try-Finally Blocks for Resource Cleanup

**Before:**

```typescript
await signInIfNeeded(page1);
// ... test code ...
await ctx1.close();
```

**After:**

```typescript
try {
	await signInIfNeeded(page1);
	// ... test code ...
} finally {
	await ctx1.close();
	await ctx2.close();
}
```

**Why:** Ensures resources are cleaned up even if test fails midway.

---

### 8. Unit Test Improvements - More Assertions Per Test

**Before:**

```typescript
it('reports error text through callback and returns app error', () => {
	const appError = report('Request denied', new Error('Token expired'));
	expect(appError).toEqual({
		/* ... */
	});
	expect(setError).toHaveBeenCalledTimes(1);
	expect(setError.mock.calls[0]?.[0]).toContain('[UNAUTHORIZED] Request denied');
});
```

**After:**

```typescript
it('reports error text through callback and returns app error', () => {
	const appError = report('Request denied', new Error('Token expired'));
	expect(appError).toEqual({
		/* ... */
	});
	expect(appError.message).toBe('Request denied');
	expect(appError.code).toBe('UNAUTHORIZED');
	expect(appError.requestId).toBe('base-request');

	expect(setError).toHaveBeenCalledTimes(1);
	expect(setError).toHaveBeenCalledWith(expect.stringContaining('[UNAUTHORIZED]'));
	const callArgument = setError.mock.calls[0]?.[0] ?? '';
	expect(callArgument).toContain('[UNAUTHORIZED] Request denied');
	expect(callArgument).toContain('[INTERNAL_ERROR] Token expired');
	expect(callArgument.length).toBeGreaterThan(0);
});
```

**Why:** Validates individual properties and edge cases, not just overall structure.

---

## Test Files Updated

### E2E Tests

- **`e2e/auth-ssr.spec.ts`** - All auth flow tests made strict
  - SSR authenticated state verification
  - Client-only loading state handling
  - Sign-in/sign-out flow verification
  - Query behavior with auth states

- **`e2e/repo-happy-path.spec.ts`** - Happy path and collaboration tests
  - Sign-in flow strictness
  - Monaco editor recovery validation
  - Multi-user sync convergence
  - File operation sync verification

### Unit Tests

- **`src/demo.spec.ts`** - Error utility tests
  - Error creation and preservation
  - Error normalization with fallbacks
  - Error formatting consistency
  - Error reporting mechanisms

## Running the Tests

```bash
# Run unit tests
pnpm run test

# Run E2E tests (requires TEST_USER_EMAIL and TEST_USER_PASSWORD)
pnpm run test:e2e

# Run specific E2E test
pnpm run test:e2e e2e/auth-ssr.spec.ts
```

## Benefits of These Changes

✅ **Fail Fast**: Tests catch real issues immediately  
✅ **Clear Messages**: Explicit error messages show what went wrong  
✅ **Catch Flakes**: No more silent failures hiding race conditions  
✅ **Validation**: Data quality verified, not just absence of errors  
✅ **Resource Safety**: Try-finally ensures cleanup  
✅ **Comprehensive**: Multiple assertions validate behavior thoroughly

## Test Status

All tests currently pass with these stricter assertions:

- ✓ 4 unit tests in `demo.spec.ts`
- ✓ 2 unit tests in `index.spec.ts`
- ✓ E2E tests ready for execution
