export type ErrorCode = NonNullable<App.Error['code']>;

export type ErrorInit = {
	code?: ErrorCode;
	requestId?: string;
};

export type ErrorReporter = (message: string, error?: unknown, init?: ErrorInit) => App.Error;

export function createError(message: string, init: ErrorInit = {}): App.Error {
	return {
		message,
		code: init.code ?? 'INTERNAL_ERROR',
		requestId: init.requestId
	};
}

export function isError(value: unknown): value is App.Error {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as Partial<App.Error>;
	return typeof candidate.message === 'string';
}

export function toError(
	value: unknown,
	fallbackMessage = 'An unexpected error occurred.'
): App.Error {
	if (isError(value)) {
		return createError(value.message, {
			code: value.code,
			requestId: value.requestId
		});
	}

	if (value instanceof Error) {
		return createError(value.message);
	}

	if (typeof value === 'string' && value.trim()) {
		return createError(value);
	}

	return createError(fallbackMessage);
}

export function formatError(error: App.Error): string {
	const parts: string[] = [];
	if (error.code) parts.push(`[${error.code}]`);
	parts.push(error.message);
	if (error.requestId) parts.push(`(request: ${error.requestId})`);
	return parts.join(' ');
}

export function composeErrorMessage(Error: App.Error, error?: unknown): string {
	const nomalized = error ? toError(error, Error.message) : undefined;
	const detail = nomalized ? formatError(nomalized) : undefined;
	return detail ? `${formatError(Error)}\n\n${detail}` : formatError(Error);
}

export function createErrorReporter(
	setError: (next: string) => void,
	defaults: ErrorInit = { code: 'INTERNAL_ERROR' }
): ErrorReporter {
	return (message, error, init = {}) => {
		const Error = createError(message, {
			code: init.code ?? defaults.code,
			requestId: init.requestId ?? defaults.requestId
		});
		setError(composeErrorMessage(Error, error));
		return Error;
	};
}
