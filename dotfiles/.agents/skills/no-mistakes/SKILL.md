---
name: no-mistakes
description: Validates committed code changes through the no-mistakes review, test, documentation, lint, push, PR, and CI pipeline. Use when the user invokes /no-mistakes, asks to run no-mistakes, gate, ship, or safely push changes, or asks for implementation followed by validation; do not use for ordinary local checks that do not authorize publication.
---

# No Mistakes

Drive the local `no-mistakes axi` pipeline from committed feature-branch work to a terminal result. The CLI prints machine-readable TOON to stdout and progress to stderr.

## Safety invariants

- Treat pipeline control and permission to publish as distinct. Run this skill only when the user requested no-mistakes, gating, shipping, safe push, or implementation followed by validation.
- Never read or expose secrets. Never upload repository content except through the pipeline actions the user authorized.
- Never reset, stash, merge, rebase, force-push, replace a branch, or discard commits to resolve pipeline custody. Follow the returned `branch_sync.next_action` exactly.
- While a run is active, never edit its worktree, abort or rerun to bypass a gate, or push directly. The pipeline owns findings, fixes, commits, push, PR, and CI.
- Preserve unrelated pre-existing changes. In task-first mode, commit only the requested work.
- Never infer success from process exit alone. Continue until the CLI returns `outcome:`; gates and no-ops may also exit `0`.

## Active validation-step boundary

A validation-step agent already running inside an outer no-mistakes pipeline must inspect or fix only its assigned phase. It must never initialize, start, reattach, synchronize, respond to, abort, eject, rerun, or directly push a pipeline.

`NO_MISTAKES_GATE` is diagnostic evidence, not authorization. The runtime also checks managed Git identity and authenticated process ancestry. If any control command returns `error.code: nested_gate_context`, stop and return control to the outer executor. Safe inspection remains available through `no-mistakes axi status`, `no-mistakes axi logs`, command help, and `no-mistakes doctor`.

## Invocation modes

### Validate-only

For bare `/no-mistakes`, validate the user's already committed changes. Translate requested options into `axi run` flags; for example, “skip lint” becomes `--skip=lint`. Read `no-mistakes axi run --help` instead of guessing flags.

### Task-first

For `/no-mistakes <task>` or a request to implement and then validate:

1. Inspect repository status. Preserve unrelated work.
2. Implement the task and commit only its changes on a feature branch. If currently on the default branch, create a feature branch before committing.
3. Run the pipeline with the original request as `--intent`. Preserve the user's wording, constraints, exclusions, acceptance criteria, and later decisions; add implementation decisions or tradeoffs a diff-only reviewer would not know.

## Preconditions and discovery

The work must be committed on a non-default branch, the repository must already be initialized, and a supported pipeline agent must be configured. The agent may be a supported native binary, `agent: cursor`, or an explicit `acp:<target>` through `acpx`.

1. Run `no-mistakes axi` before starting.
2. If the current branch has an active run, inspect `no-mistakes axi status`:
   - At a gate: respond to it.
   - Still running and matching the submitted or current pipeline `HEAD`: rerun `no-mistakes axi run ...` to reattach.
   - Terminal with custody work outstanding: follow `branch_sync` before editing or committing.
3. If another branch has an active run, leave it alone and start the current branch's run.
4. If setup or the binary fails, follow the returned `error` and `help`; use `no-mistakes doctor` for installation or agent configuration failures. Run `no-mistakes init` only when the repository is not initialized.

See [branch custody](references/branch-custody.md) before any post-pipeline edit, commit, or fresh run.

## Intent

Every new run requires:

```sh
no-mistakes axi run --intent "<the user's complete objective>"
```

Intent describes what the user set out to accomplish, not the diff. Include deliberate behavior, constraints, rejected approaches, acceptance criteria, and surprising choices. A few sentences or a short paragraph is normal. Reuse the same original intent after fixes or recovery.

## Drive the run

1. Run `no-mistakes axi run --intent "..."` with any user-authorized flags.
2. Read the complete return:
   - `gate:` → decide and send one response using [gate responses](references/gate-responses.md).
   - Wait elapsed while the run remains active → inspect status, then reattach with `axi run` or the pending `axi respond`; do not classify it as failure.
   - `outcome:` → interpret it with [CI outcomes](references/ci-outcomes.md).
   - `error:` → follow its `help`; use [recovery](references/recovery.md) when the run or branch needs repair.
3. Repeat until an `outcome:` appears. A run never advances past a gate by itself.

`axi run` and `axi respond` are synchronous and default to `--wait 8m`. Review, test, and CI can each take several minutes. A long call is not evidence of a stall. Use `no-mistakes axi status` separately for non-disruptive progress checks.

## Test-quality rule

Tests must exercise a public or executable interface and assert observable behavior, state, output, side effects, or failure modes. For regressions, reproduce the reported failure when feasible so the test fails before the fix and passes after it.

Never treat source-text inspection as behavioral proof. Tests that merely read, grep, parse, or snapshot implementation files for strings, commands, function names, prompt wording, regexes, lines, tokens, or AST shapes are invalid proxies. For declarative artifacts, invoke the real consumer when feasible or parse a typed or normalized semantic model and assert meaning.

Reading bytes is valid only when the file itself is the owned contract: generated public output, a serialized protocol, persisted state, or an intentional snapshot. Deterministic CI may test a final emitted prompt as a generated interface; model interpretation belongs in development evaluation, not live-model CI.

## Inspection commands

```sh
no-mistakes axi
no-mistakes axi status
no-mistakes axi sync --check
no-mistakes axi logs --step <name> --full
no-mistakes axi abort
no-mistakes axi abort --run <id>
```

Use abort only to discard an active run intentionally or when recovery guidance explicitly offers it. Never use it to bypass a gate.

## Read CLI output literally

- TOON uses `key: value`, `name[N]{columns}:` tables, and `help[N]:` hints.
- Read actual table headers; fields and columns can vary by step and version.
- `status` without `--run` is scoped to the current branch. `other_branch_run` is not the current work. With detached `HEAD` or failed branch lookup, an explicit run carries no branch relationship.
- A successful status with no `run` object means the current branch has no run. An `error` proves nothing about ownership.
- `awaiting_agent: parked <duration>` means a gate awaits a response. Only an implicitly resolved current-branch gate may be answered; explicit `--run <id>` status is inspection-only.
- `active_steps` fields such as `active_for`, `round_active_for`, `last_activity`, `agent_pid`, and round labels are liveness clues only. `quiet` never authorizes cancellation or worktree edits.
- Exit codes: `0` for success, no-op, or a normal gate; `1` for failed or cancelled terminal outcomes; `2` for usage errors.

## Completion

Report the final outcome and what was actually validated. List every pipeline-applied fix from any `fixes` table so the user can review missed issues. For overrides or skips, state the missing evidence and recorded reason. For `checks-passed`, provide the PR link from `help` and ask the user to review and merge; do not wait or poll for merge.

## References

Read only the reference needed for the current state:

- [Branch custody](references/branch-custody.md): ownership, synchronization, and safe follow-up commits.
- [Gate responses](references/gate-responses.md): finding classes, response commands, `--yes`, and protected gates.
- [CI outcomes](references/ci-outcomes.md): terminal meanings, PR monitoring, and user reporting.
- [Recovery](references/recovery.md): timeouts, failures, reruns, preserved heads, and custody recovery.
