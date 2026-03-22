import { describe, it, expect, vi } from 'vitest';
import {
	createError,
	toError,
	formatError,
	composeErrorMessage,
	createErrorReporter
} from '$lib/sveltekit/errors';

describe('error utilities', () => {
	it('preserves explicit code and request id', () => {
		const error = createError('Boom', { code: 'BAD_REQUEST', requestId: 'req-123' });

		expect(error).toEqual({
			message: 'Boom',
			code: 'BAD_REQUEST',
			requestId: 'req-123'
		});
		expect(error.message).toBe('Boom');
		expect(error.code).toBe('BAD_REQUEST');
		expect(error.requestId).toBe('req-123');
	});

	it('normalizes unknown values with fallback message', () => {
		const undefinedError = toError(undefined, 'Fallback message');
		expect(undefinedError).toEqual({
			message: 'Fallback message',
			code: 'INTERNAL_ERROR',
			requestId: undefined
		});
		expect(undefinedError.message).toBe('Fallback message');
		expect(undefinedError.code).toBe('INTERNAL_ERROR');
		expect(undefinedError.requestId).toBeUndefined();

		const exceptionError = toError(new Error('From exception'));
		expect(exceptionError.message).toBe('From exception');
		expect(exceptionError.code).toBe('INTERNAL_ERROR');
		expect(exceptionError.requestId).toBeUndefined();
	});

	it('formats nested errors consistently', () => {
		const top = createError('Top level', { code: 'FORBIDDEN', requestId: 'root' });
		const nested = new Error('Low level');

		const formattedTop = formatError(top);
		expect(formattedTop).toBe('[FORBIDDEN] Top level (request: root)');
		expect(formattedTop).toContain('FORBIDDEN');
		expect(formattedTop).toContain('Top level');
		expect(formattedTop).toContain('root');

		const composed = composeErrorMessage(top, nested);
		expect(composed).toContain('[FORBIDDEN] Top level');
		expect(composed).toContain('[INTERNAL_ERROR] Low level');
		expect(composed).toBeDefined();
		expect(composed.length).toBeGreaterThan(0);
	});

	it('reports error text through callback and returns app error', () => {
		const setError = vi.fn<(next: string) => void>();
		const report = createErrorReporter(setError, {
			code: 'UNAUTHORIZED',
			requestId: 'base-request'
		});

		const appError = report('Request denied', new Error('Token expired'));

		expect(appError).toEqual({
			message: 'Request denied',
			code: 'UNAUTHORIZED',
			requestId: 'base-request'
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
});
