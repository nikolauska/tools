import { spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, isAbsolute } from 'node:path';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function command(binary, args, cwd, json = false) {
  // stdin must stay empty: `treehouse return` asks "Clean and return? [Y/n]" for a dirty checkout,
  // and only an unanswerable prompt (EOF) makes it keep the changes instead of taking the default yes.
  const result = spawnSync(binary, args, { cwd, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${binary} ${args.join(' ')} exited with status ${result.status ?? result.signal}`);
  if (!json) return result.stdout;
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`${binary} returned invalid JSON: ${error.message}`);
  }
}

const herdr = () => required('HERDR_BIN_PATH');
const treehouse = () => process.env.TREEHOUSE_BIN_PATH || 'treehouse';

function stateDir() {
  // Workspace IDs are only meaningful within one Herdr session, and the plugin state dir is shared
  // by all sessions, so records are kept per session socket.
  const socket = required('HERDR_SOCKET_PATH');
  const dir = join(required('HERDR_PLUGIN_STATE_DIR'), createHash('sha256').update(socket).digest('hex'));
  mkdirSync(dir, { recursive: true });
  return dir;
}

function save(file, record) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  writeFileSync(temporary, JSON.stringify(record), { flag: 'wx', mode: 0o600 });
  renameSync(temporary, file);
}

function returnLease(record) {
  // --if-lease-id makes the return a no-op failure if the slot was released and leased to someone else.
  command(treehouse(), ['return', '--if-lease-id', record.lease_id, record.path], record.cwd);
}

function assertCommitsOnRef(path) {
  // Treehouse hands out detached checkouts and `return` only refuses uncommitted changes, so commits
  // made on the detached HEAD would be orphaned when the slot is reset for its next user.
  const ref = command('git', ['-C', path, 'for-each-ref', '--count=1', '--contains', 'HEAD', '--format=%(refname)', 'refs/heads', 'refs/remotes', 'refs/tags']);
  if (!ref.trim()) throw new Error(`${path} has commits that are not on any branch, tag, or remote branch; create a branch there (git switch -c <name>) or push them`);
}

function open() {
  const parent = JSON.parse(required('HERDR_PLUGIN_CONTEXT_JSON')).workspace_id;
  if (!parent) throw new Error('No focused parent workspace in action context');
  const info = command(herdr(), ['worktree', 'list', '--workspace', parent], undefined, true);
  const source = info.result?.source;
  const cwd = source?.repo_root;
  if (source?.source_workspace_id !== parent || !cwd || !isAbsolute(cwd)) {
    throw new Error(`Workspace ${parent} has no matching Treehouse repository source`);
  }
  const dir = stateDir();
  const lease = command(treehouse(), ['get', '--lease', '--json'], cwd, true);
  if (!lease.path || !isAbsolute(lease.path) || !lease.lease_id) throw new Error('Treehouse returned no absolute path or lease ID; inspect Treehouse leases manually');
  const file = join(dir, `${randomUUID()}.json`);
  const record = { cwd, path: lease.path, lease_id: lease.lease_id, parent_workspace_id: parent };
  try {
    save(file, record);
  } catch (error) {
    try { returnLease(record); } catch (returnError) {
      throw new Error(`Cannot record lease (${error.message}); return also failed: ${returnError.message}. Recover lease ${record.lease_id} at ${record.path} manually`);
    }
    throw error;
  }
  let opened;
  try {
    opened = command(herdr(), ['worktree', 'open', '--workspace', parent, '--path', lease.path, '--focus'], undefined, true);
  } catch (error) {
    try {
      returnLease(record);
    } catch (returnError) {
      throw new Error(`${error.message}; Treehouse return failed: ${returnError.message}. Lease retained at ${file}`);
    }
    unlinkSync(file);
    throw error;
  }
  const workspace = opened.result?.workspace;
  const child = workspace?.workspace_id;
  const checkout = workspace?.worktree?.checkout_path;
  if (!child || !checkout) throw new Error(`Herdr opened ${lease.path} without reporting its workspace ID and checkout path; lease retained at ${file} for manual recovery`);
  try {
    save(file, { ...record, workspace_id: child, checkout_path: checkout });
  } catch (error) {
    throw new Error(`Workspace ${child} opened, but recording it failed: ${error.message}. Lease retained at ${file} for manual recovery`);
  }
  console.log(`Opened workspace ${child}: ${lease.path}`);
}

function closed() {
  const { data } = JSON.parse(required('HERDR_PLUGIN_EVENT_JSON'));
  if (data?.type !== 'workspace_closed') return;
  const id = data.workspace_id;
  if (!id) throw new Error('workspace.closed event has no workspace_id');
  // Herdr restarts workspace numbering when it restarts with an empty session, so a retained record's
  // ID can later name an unrelated space. The checkout path proves the closed space is the one we opened;
  // a space without a worktree is never one of ours.
  const workspace = data.workspace;
  const dir = stateDir();
  const failures = [];
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith('.json')) continue;
    const file = join(dir, entry);
    const record = JSON.parse(readFileSync(file, 'utf8'));
    if (record.workspace_id !== id) continue;
    if (workspace && workspace.worktree?.checkout_path !== record.checkout_path) continue;
    try {
      if (!workspace) throw new Error(`Closed workspace ${id} was reported without details, so it cannot be matched to ${record.path}`);
      assertCommitsOnRef(record.path);
      returnLease(record);
      unlinkSync(file);
      console.log(`Returned Treehouse lease for workspace ${id}: ${record.path}`);
    } catch (error) {
      // Treehouse's own refusal message suggests `return --force`, which would discard exactly the work kept here.
      failures.push(`${error.message}. Lease retained at ${file}. Do not use treehouse return --force; it discards the checkout's changes. Save the work in ${record.path}, then run: treehouse return --if-lease-id ${record.lease_id} ${record.path}`);
    }
  }
  if (failures.length) throw new Error(failures.join('\n'));
}

try {
  if (process.argv[2] === 'open') open();
  else if (process.argv[2] === 'closed') closed();
  else throw new Error('Usage: node index.mjs open|closed');
} catch (error) {
  console.error(`Treehouse plugin: ${error.message}`);
  process.exitCode = 1;
}
