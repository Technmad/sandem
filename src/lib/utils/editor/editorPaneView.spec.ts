import { describe, it, expect } from 'vitest';
import { deriveEditorSaveStatusVariant } from './editorPaneView.js';

describe('deriveEditorSaveStatusVariant', () => {
	it('maps each known autosave state to a deterministic variant', () => {
		expect(deriveEditorSaveStatusVariant('Saved')).toBe('saved');
		expect(deriveEditorSaveStatusVariant('Saving...')).toBe('saving');
		expect(deriveEditorSaveStatusVariant('Unsaved changes')).toBe('unsaved');
		expect(deriveEditorSaveStatusVariant('Session only')).toBe('session');
		expect(deriveEditorSaveStatusVariant('Save failed')).toBe('error');
	});

	it('never maps unsaved/session/error states to saved', () => {
		for (const status of ['Unsaved changes', 'Session only', 'Save failed'] as const) {
			expect(deriveEditorSaveStatusVariant(status)).not.toBe('saved');
		}
	});
});
