import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

describe('Tabs accessibility semantics', () => {
	const tabsPath = path.resolve(process.cwd(), 'src/lib/components/ui/primitives/Tabs.svelte');
	const source = fs.readFileSync(tabsPath, 'utf-8');

	it('does not use nested role=button affordances', () => {
		expect(source).not.toContain('role="button"');
		expect(source).not.toContain('tabindex="0"');
	});

	it('renders close affordance as a real button', () => {
		expect(source).toContain('class="tab-close"');
		expect(source).toMatch(/<button[\s\S]*class="tab-close"/m);
	});
});
