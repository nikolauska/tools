import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./index.mjs', import.meta.url));
// Fake Herdr and Treehouse binaries are shebang scripts, which Windows cannot execute directly.
const posixOnly = { skip: process.platform === 'win32' && 'fake binaries rely on shebang scripts' };

// Records every call and answers like Treehouse: `get` prints the lease, `return` exits with FAKE_RETURN_STATUS.
const fakeTreehouse = `
const { appendFileSync } = require('node:fs');
const args = process.argv.slice(2);
appendFileSync(process.env.FAKE_LOG, JSON.stringify(args) + '\\n');
if (args[0] === 'get') console.log(process.env.FAKE_LEASE);
else process.exitCode = Number(process.env.FAKE_RETURN_STATUS || 0);
`;

// Answers `worktree list` for the focused workspace and fails `worktree open`.
const fakeHerdr = `
const args = process.argv.slice(2);
if (args[1] === 'list') console.log(JSON.stringify({ result: { source: { repo_root: process.env.FAKE_REPO, source_workspace_id: args[3] } } }));
else process.exitCode = 1;
`;

function executable(dir, name, body) {
  const file = join(dir, name);
  writeFileSync(file, `#!${process.execPath}\n${body}`, { mode: 0o755 });
  return file;
}

function git(cwd, ...args) {
  const result = spawnSync('git', ['-c', 'user.name=test', '-c', 'user.email=test@example.com', ...args], { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

// A repository whose linked worktree starts on a detached HEAD, like a Treehouse pool slot.
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'herdr-treehouse-'));
  const repo = join(root, 'repo');
  const worktree = join(root, 'worktree');
  mkdirSync(repo);
  git(repo, 'init', '-q');
  git(repo, 'commit', '-q', '--allow-empty', '-m', 'init');
  git(repo, 'worktree', 'add', '-q', '--detach', worktree);
  const socket = join(root, 'session');
  const dir = join(root, createHash('sha256').update(socket).digest('hex'));
  mkdirSync(dir);
  const log = join(root, 'treehouse.log');
  const env = {
    ...process.env,
    HERDR_SOCKET_PATH: socket,
    HERDR_PLUGIN_STATE_DIR: root,
    TREEHOUSE_BIN_PATH: executable(root, 'treehouse', fakeTreehouse),
    HERDR_BIN_PATH: executable(root, 'herdr', fakeHerdr),
    FAKE_LOG: log,
    FAKE_REPO: repo,
  };
  const calls = () => existsSync(log) ? readFileSync(log, 'utf8').trim().split('\n').map((line) => JSON.parse(line)) : [];
  return { root, repo, worktree, dir, env, calls };
}

test('closed event returns only the lease of the checkout that closed, and keeps unsaved work', posixOnly, () => {
  const { root, repo, worktree, dir, env, calls } = fixture();
  try {
    const record = join(dir, 'lease.json');
    const lease = { cwd: repo, path: worktree, lease_id: 'lease-123', parent_workspace_id: 'w1', workspace_id: 'w2', checkout_path: worktree };
    writeFileSync(record, JSON.stringify(lease));
    const close = (workspace_id, checkout_path, extra = {}) => spawnSync(process.execPath, [script, 'closed'], {
      env: {
        ...env,
        ...extra,
        HERDR_PLUGIN_EVENT_JSON: JSON.stringify({
          event: 'workspace_closed',
          data: { type: 'workspace_closed', workspace_id, workspace: { workspace_id, worktree: { checkout_path } } },
        }),
      },
      encoding: 'utf8',
    });
    const retained = () => assert.deepEqual(JSON.parse(readFileSync(record, 'utf8')), lease);

    const unrelated = close('w9', join(root, 'elsewhere'));
    assert.equal(unrelated.status, 0, unrelated.stderr);
    // Herdr reuses IDs after an empty-session restart; a stale record must not return another space's checkout.
    const reusedId = close('w2', join(root, 'elsewhere'));
    assert.equal(reusedId.status, 0, reusedId.stderr);
    const reusedByPlainSpace = close('w2', undefined);
    assert.equal(reusedByPlainSpace.status, 0, reusedByPlainSpace.stderr);
    assert.deepEqual(calls(), []);
    retained();

    const refused = close('w2', worktree, { FAKE_RETURN_STATUS: '3' });
    assert.equal(refused.status, 1);
    assert.match(refused.stderr, /Lease retained at .*Do not use treehouse return --force/);
    retained();

    git(worktree, 'commit', '-q', '--allow-empty', '-m', 'work on detached HEAD');
    const detached = close('w2', worktree);
    assert.equal(detached.status, 1);
    assert.match(detached.stderr, /not on any branch, tag, or remote branch/);
    assert.equal(calls().length, 1, 'commits off every ref must stop the return before Treehouse runs');
    retained();

    git(worktree, 'switch', '-q', '-c', 'saved');
    const returned = close('w2', worktree);
    assert.equal(returned.status, 0, returned.stderr);
    assert.deepEqual(calls().at(-1), ['return', '--if-lease-id', 'lease-123', worktree]);
    assert.equal(existsSync(record), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('open returns the lease and drops its record when Herdr cannot open the worktree', posixOnly, () => {
  const { root, worktree, dir, env, calls } = fixture();
  try {
    const result = spawnSync(process.execPath, [script, 'open'], {
      env: {
        ...env,
        HERDR_PLUGIN_CONTEXT_JSON: JSON.stringify({ workspace_id: 'w1' }),
        FAKE_LEASE: JSON.stringify({ path: worktree, lease_id: 'lease-456' }),
      },
      encoding: 'utf8',
    });
    assert.equal(result.status, 1);
    assert.deepEqual(calls(), [['get', '--lease', '--json'], ['return', '--if-lease-id', 'lease-456', worktree]]);
    assert.deepEqual(readdirSync(dir), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
