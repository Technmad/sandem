// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	namespace App {
		interface Error {
			message: string;
			code?: 'INTERNAL_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'BAD_REQUEST';
			requestId?: string;
		}

		interface Locals {
			token: string | undefined;
		}

		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
