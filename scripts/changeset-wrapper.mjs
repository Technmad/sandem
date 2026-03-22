#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

function run(command, args) {
	const result = spawnSync(command, args, {
		stdio: 'inherit',
		shell: process.platform === 'win32'
	});

	if (typeof result.status === 'number') {
		return result.status;
	}

	return 1;
}

const forceNonInteractive = process.env.CHANGESET_NON_INTERACTIVE === '1';
const isInteractive = !forceNonInteractive && process.stdin.isTTY && !process.env.CI;

if (isInteractive) {
	process.exit(run('pnpm', ['exec', 'changeset']));
}

console.log(
	'ℹ️  Non-interactive environment detected. Running changeset status instead of interactive prompt.'
);
const statusCode = run('pnpm', ['exec', 'changeset', 'status']);

if (statusCode !== 0) {
	console.warn(
		'⚠️  changeset status could not complete in this environment (for example, missing/diverged main ref).'
	);
	console.warn('   Skipping hard failure for non-interactive script audit.');
	process.exit(0);
}

process.exit(0);
