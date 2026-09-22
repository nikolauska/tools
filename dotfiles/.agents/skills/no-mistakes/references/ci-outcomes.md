# CI outcomes

An `outcome:` is terminal for the current AXI drive call. Interpret its value, structured run fields, and `help` together.

## Outcome meanings

| Outcome | Meaning and required response |
|---|---|
| `checks-passed` | Validation and CI checks are green, or trusted default-branch configuration explicitly declares `no_ci: true` for a repository with no registered checks. The PR is ready but not proven merged. Give the PR link from `help`; ask the user to review and merge. Do not poll for merge. |
| `passed` | The requested pipeline steps completed, including any explicit per-run skips. Do not claim this proves a PR merged. |
| `passed-with-override` | Test or CI completed through an explicit exception. Report the exception and `run.test_override_reason`, including when readiness also reports `checks-passed`. Never call it a clean pass. |
| `passed-with-skips` | Publication or CI verification was automatically skipped. Report every missing proof and its cause from `run.automatic_skips`, which is bound to the full `run.head_sha`. It is not CI readiness and not a failing code verdict. |
| `failed` | The pipeline did not validate the change. Read the failure and branch custody state, repair it only after custody returns, then retry or explain the blocker. |
| `cancelled` | The run stopped without validation. Read custody state before touching the branch; retry only when the returned guidance permits it. |

A generic empty forge-check list is never green by itself. Only a trusted `no_ci: true` declaration makes zero checks ready.

## PR monitor behavior

After `checks-passed`, no-mistakes keeps monitoring the PR until merge, closure, or configured idle timeout. The operator is done driving the pipeline.

- A clean PR merely behind the default branch needs no action; the platform can merge it.
- If a real merge conflict appears while the monitor is active, the monitor rebases onto the base, resolves the conflict, restarts validation from Review, and pushes again through Push.
- Never hand-rebase or start a fresh `axi run` to refresh an active monitored PR. With unchanged `HEAD`, `axi run` reattaches and returns monitor output without rebasing.
- Use `no-mistakes rerun` only after the monitor is no longer active because the PR closed, the run was aborted or superseded, it idle-timed out, or auto-fix attempts were exhausted. An accepted rerun cancels stale monitoring and runs the full pipeline, including deterministic rebase.

## Final report

Report:

1. the exact outcome;
2. what steps were actually validated;
3. each pipeline-applied item in any `fixes` table;
4. every override, skip, or missing proof and its structured reason; and
5. the PR link and review/merge request for `checks-passed`.

Do not imply merge, CI, publication, or clean validation beyond the evidence in the outcome.
