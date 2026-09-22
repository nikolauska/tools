# Gate responses

A `gate:` is a normal decision point, not a terminal result. Read every row in its actual `findings` header before responding.

## Finding actions

- `auto-fix`: mechanical and low-risk. Decide on your own judgment; normally authorize the pipeline to fix it.
- `no-op`: informational. Approve when no actionable finding remains.
- `ask-user`: challenges deliberate intent or changes product behavior. Relay it and wait for the user's decision unless the user already gave standing `--yes` consent.

Review auto-fix defaults to disabled (`auto_fix.review: 0`), though repository or global configuration may override it. Test and lint may auto-fix and rerun before producing a gate.

## Response commands

```sh
no-mistakes axi respond --action approve
no-mistakes axi respond --action fix --findings <id1,id2> --instructions "<guidance>"
no-mistakes axi respond --action skip
```

- Omit `--step` to answer the active gate. Use `--step <name>` only when the CLI explicitly identifies a non-current step to answer.
- `--wait` bounds the synchronous hold; its default is `8m`.
- For Test only, `--reason "..."` records an authorized exception with `--step test --action approve`. It records rationale; it does not grant approval authority. Missing rationale still creates an override with no operator reason.
- With `--action fix`, `--add-finding '<json>'` can add a problem you observed but the gate omitted.
- While the run is active, fixes must go through `respond --action fix`. Never edit the worktree, abort, or rerun to fix a gate finding yourself.

Each response blocks until the next gate, a `checks-passed` decision point, a final outcome, or its wait bound. Read the returned object and continue immediately; a gate never resumes on its own.

## Escalate `ask-user`

Without prior standing consent:

1. Relay each finding's `id`, `file`, and full `description` verbatim. Do not paraphrase or prejudge it.
2. Ask whether to fix, approve, or skip.
3. Translate the answer into the matching response. Pass fix guidance unchanged through `--instructions`.

Never approve, fix, or skip an `ask-user` finding based only on your own judgment.

## Standing `--yes` consent

Use `--yes` only when the user asked you to drive eligible gates unattended. Pass it to `axi run` or `axi respond`. For eligible gates it:

- selects all current `auto-fix` and `ask-user` findings for one fix round;
- accepts the resulting fix review; and
- approves gates containing only `no-op` findings.

`--yes` does not bypass protected gates.

## Gates that always stop

### `protected-path-refusal`

Even under `--yes`, relay the path and rule. Do not approve, skip, or automatically fix it. The operator must inspect and resolve the reported edit, then send `--action fix` to retry the unfinished step. Approval is rejected.

### `test-agent-unvalidated-work`

A timed-out Test agent left commits or changes that no Test turn validated. Approval is rejected, so `--yes` stops without responding. Relay the named work and do not skip Test because that could publish unvalidated changes. The operator must choose:

- `--action fix` to spend another agent budget validating the work; or
- `no-mistakes axi abort` to stop the run.

## Example shape

```text
gate: review
findings[2]{id,severity,file,line,action,description}:
  r1,warning,internal/pipeline/executor.go,,auto-fix,Error from os.Remove is ignored
  r2,error,cmd/no-mistakes/main.go,,ask-user,New --force flag bypasses the confirm prompt
```

Fix `r1` through the pipeline. Escalate `r2` unless `--yes` was explicitly authorized. Exact fields vary; never assume the example's columns.
