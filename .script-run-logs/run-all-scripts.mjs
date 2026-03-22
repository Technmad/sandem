import fs from 'node:fs';
import cp from 'node:child_process';
import pkg from '../package.json' with { type: 'json' };

const scripts = Object.keys(pkg.scripts || {});
const skip = new Set(['test:e2e:install-browsers', 'release:publish']);
const shortTimeout = 180_000;
const longTimeout = 20_000;
const longRunning = new Set([
	'dev',
	'dev:client',
	'dev:frontend',
	'dev:server',
	'check:watch',
	'test:unit',
	'test:e2e:ui'
]);

const results = [];

for (const name of scripts) {
	if (skip.has(name)) {
		results.push({
			name,
			status: 'skipped',
			code: null,
			reason:
				name === 'release:publish' ? 'skipped to avoid accidental publish' : 'excluded by request'
		});
		continue;
	}

	const logPath = `.script-run-logs/${name.replace(/[^a-zA-Z0-9_.-]/g, '_')}.log`;
	const timeout = longRunning.has(name) ? longTimeout : shortTimeout;
	const started = Date.now();

	try {
		cp.execSync(`pnpm run ${name}`, {
			stdio: ['ignore', fs.openSync(logPath, 'w'), fs.openSync(logPath, 'a')],
			timeout,
			env: { ...process.env, PLAYWRIGHT_HTML_OPEN: 'never' }
		});

		results.push({
			name,
			status: 'passed',
			code: 0,
			durationMs: Date.now() - started,
			logPath
		});
	} catch (e) {
		const durationMs = Date.now() - started;
		let status = 'failed';
		let code = e.status ?? null;
		let reason = '';

		if (e.killed || /timed out/i.test(String(e.message)) || code === null) {
			status = 'timeout';
			reason = 'likely long-running/interactive';
		}

		results.push({ name, status, code, durationMs, reason, logPath });
	}
}

fs.writeFileSync('.script-run-logs/summary.json', JSON.stringify(results, null, 2));

const counts = results.reduce((acc, r) => {
	acc[r.status] = (acc[r.status] || 0) + 1;
	return acc;
}, {});

console.log('SUMMARY', counts);
for (const r of results) {
	console.log(
		`${r.status.toUpperCase()}\t${r.name}\tcode=${r.code === null ? 'n/a' : r.code}\t${r.durationMs || 0}ms${r.reason ? `\t${r.reason}` : ''}`
	);
}
