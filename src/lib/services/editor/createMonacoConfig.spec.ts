import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

describe('createMonacoConfig production asset strategy', () => {
	const monacoConfigPath = path.resolve(
		process.cwd(),
		'src/lib/services/editor/createMonacoConfig.svelte.ts'
	);
	const source = fs.readFileSync(monacoConfigPath, 'utf-8');

	it('does not depend on node_modules runtime paths', () => {
		expect(source).not.toContain('/node_modules/monaco-editor');
	});

	it('uses static /monaco/vs asset path candidates', () => {
		expect(source).toContain('monaco/vs');
		expect(source).toContain('/monaco/vs');
	});
});
