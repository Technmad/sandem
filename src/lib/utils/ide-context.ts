import { setContext, getContext } from 'svelte';
import type { WebContainer } from '@webcontainer/api';
import type { Doc } from '$convex/_generated/dataModel.js';

// A unique symbol ensures our context key never collides with other libraries
const IDE_CONTEXT_KEY = Symbol('IDE');

// Define the shape of our context.
// Notice we are passing closures, not the raw objects!
interface IDEContext {
	getWebcontainer: () => WebContainer;
	getProject: () => Doc<'projects'>;
}

// Helper to set the context in the parent
export function setIDEContext(context: IDEContext) {
	setContext(IDE_CONTEXT_KEY, context);
}

// Helper to get the context in the children
export function getIDEContext(): IDEContext {
	const context = getContext<IDEContext>(IDE_CONTEXT_KEY);
	if (!context) {
		throw new Error(
			'getIDEContext must be called within a component that has called setIDEContext'
		);
	}
	return context;
}
