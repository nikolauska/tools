# Branch custody

The pipeline owns the feature branch from the start of an active run until its structured state returns custody. Do not edit, commit, push, reset, stash, merge, rebase, or replace that branch while custody is active.

## Before a run

- Validation covers committed history, not the uncommitted working tree.
- Work from a feature branch, never the repository's default branch.
- Preserve unrelated uncommitted changes and commit only the user's task.
- An active run on another branch does not block a run for the current branch. Never operate on the other branch's run as if it were current.

## Read `branch_sync`

Before any post-pipeline edit, commit, or fresh `axi run`, read the structured `branch_sync` object returned by AXI home, status, or the latest drive response. Use only the exact reported action:

| `next_action.code` | Required action |
|---|---|
| `continue_active_run` | Run the reported command and keep driving the active run. Do not edit or commit locally. |
| `sync` | Run `no-mistakes axi sync`. This may strictly fast-forward or adopt a content-equivalent diverged advance after anchoring the old head. Genuine divergence remains blocked. |
| `recover_custody` | Run the exact `next_action.command`. It selects the valid recovery mode; do not reconstruct or substitute a command. |

`branch_sync.state: user_owned` means the terminal run never changed the submitted head and cancellation released the exact branch and head. No synchronization is required; a repeated `sync --recover` is a harmless no-op.

Use `no-mistakes axi sync --check` to freshly verify an offered plan. Never run synchronization merely because it appears generally useful; run it only when offered by `branch_sync`.

## After custody returns

1. Confirm the structured state permits local work.
2. Commit follow-up changes on top of the synchronized branch so every pipeline fix commit remains present, regardless of its commit subject.
3. Start a new run with the original complete user intent.

If synchronization refuses because the worktree is dirty or containment cannot be proven, stop improvising. Follow the explicit recovery choices. Never use a manual reset, stash, merge, rebase, force operation, or branch replacement to manufacture a clean state.
