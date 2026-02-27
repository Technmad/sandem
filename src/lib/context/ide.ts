// src/lib/context/ide.ts
import { setContext, getContext } from 'svelte';
import type { WebContainer } from '@webcontainer/api';
import type { Doc } from '$convex/_generated/dataModel.js';

const IDE_CONTEXT_KEY = Symbol('IDE');

interface IDEContext {
	getWebcontainer: () => WebContainer;
	getProject: () => Doc<'projects'>;
}

export function setIDEContext(context: IDEContext) {
	setContext(IDE_CONTEXT_KEY, context);
}

export function getIDEContext(): IDEContext {
	const context = getContext<IDEContext>(IDE_CONTEXT_KEY);
	if (!context) {
		throw new Error(
			'getIDEContext must be called inside a component that has called setIDEContext'
		);
	}
	return context;
}
