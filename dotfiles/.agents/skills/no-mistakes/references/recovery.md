# Recovery

Recovery begins from structured AXI state, never from an improvised Git command.

## Wait expiry and apparent inactivity

`axi run` and `axi respond` default to `--wait 8m`. A wait expiry is not failure and does not mean the daemon died.

1. Run `no-mistakes axi status`.
2. If a step is `running` or `fixing`, leave the worktree untouched. `active_for`, `round_active_for`, `last_activity`, `agent_pid`, and round labels are liveness evidence only. A `quiet` prefix is a clue, not permission to cancel.
3. If the run is parked at a gate, send the pending response.
4. Otherwise reattach with the same `axi run` command. A slow live daemon is health-probed and retried.

Never cancel and reissue merely because a call took several minutes.

## Failed or cancelled outcome

After a terminal `failed` or `cancelled` outcome:

1. Read the reported failure, `help`, and `branch_sync`.
2. Return branch custody using the exact offered command before editing or committing.
3. Fix the failing test, lint error, or unresolved finding on the same feature branch.
4. Commit on top of all pipeline commits.
5. Start a fresh run with the original complete intent.

Do not leave a failed outcome without retrying or naming the concrete blocker.

## Rerun selection

`no-mistakes rerun` selects the gate head or the latest terminal run's verified unpublished preserved head while custody remains outstanding. If a known clean caller `HEAD` differs, it refuses before starting or superseding a run and reports both full SHAs. It never substitutes the caller head or moves either branch.

On refusal, inspect `no-mistakes axi status` and its `branch_sync`. Dirty callers and callers without clean-head evidence retain the CLI's documented selection behavior. Never use rerun mid-run to bypass a gate.

## Custody recovery commands

When `branch_sync.next_action.code` is `recover_custody`, run its exact `next_action.command`:

- `no-mistakes axi sync --recover` takes a still-available preserved pipeline head.
- `no-mistakes axi sync --recover --keep-local` is offered only when:
  - an accessible gate proves the verified preserved head is missing and the operator is explicitly discarding those unpublished commits; or
  - a bound archive proves divergent later work remains preserved while recovery keeps the branch at the exact required head. It never selects, merges, or replays the archive.

Never substitute plain `--recover`, `--keep-local`, or `rerun` for the reported command.

Ordinary recovery either fast-forwards or adopts a diverged preserved head proven to contain every local change, as when the pipeline rebased commits onto a newer base. Before moving the branch it anchors the pre-recovery head under `refs/no-mistakes/recover-local/<run>`.

The containment proof is intentionally narrow. If fix rounds also rewrote the user's own lines, recovery refuses because it cannot distinguish a deliberate pipeline fix from a dropped change.

For a dirty worktree or unprovable divergence, recovery returns explicit choices. `--keep-local` keeps the current head while preserved commits remain anchored under `refs/no-mistakes/recover/<run>`. When a verified preserved head is missing and recovery refs are compatible, the offered keep-local action can return custody without that object.

If recovery blocks, present its choices. Never reset, stash, merge, rebase, force, replace the branch, or guess which history to keep.

## Command and setup failures

- Repository not initialized: run `no-mistakes init` only when instructed by the error.
- Missing or unhealthy command, daemon, or pipeline agent: run `no-mistakes doctor` and act on its diagnosis.
- `error.code: nested_gate_context`: stop all pipeline control and return to the outer executor.
- Usage error or unsupported option: read command help; do not retry guessed flags.
- Active run still owns the branch: follow the reported continuation command instead of recovering or starting over.
