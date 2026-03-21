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

function hasNpmAuth() {
    const whoami = spawnSync('npm', ['whoami'], {
        stdio: 'pipe',
        shell: process.platform === 'win32',
        encoding: 'utf-8'
    });

    if (whoami.status === 0) return true;

    const tokenInEnv = Boolean(process.env.NPM_TOKEN?.trim());
    if (tokenInEnv) {
        console.log('ℹ️  NPM_TOKEN is set. Proceeding with publish attempt.');
        return true;
    }

    return false;
}

if (!hasNpmAuth()) {
    console.warn('⚠️  npm authentication is not configured. Skipping release publish.');
    console.warn('   Configure npm auth with `npm adduser` or set NPM_TOKEN to publish.');
    process.exit(0);
}

process.exit(run('pnpm', ['exec', 'changeset', 'publish']));
