---
name: tasks-axi
description: "Manage backlog task state with tasks-axi when filing, dispatching, completing, holding, or pruning tracked work, or checking dependencies and the ready queue; not for general project planning."
user-invocable: false
author: Kun Chen (kunchenguid)
metadata:
  hermes:
    tags: [tasks, backlog, planning, dependencies]
    category: productivity
---

# tasks-axi

Agent ergonomic task & backlog manager for the current workspace. Prefer this over hand-editing backlog.md for task state, dependency, or hold changes.

## When to use

Use tasks-axi whenever a task touches the backlog: filing or dispatching work, moving a task through queued -> in flight -> done, recording a PR url or report path on completion, tracking blocked-by dependencies, pausing dispatch with structured holds, finding dispatchable ready work or intentionally held work, or trimming the Done list.

Get every command, flag, and workflow from the mise-managed CLI - it is the single source of truth:

- `tasks-axi` - dashboard of the current backlog
- `tasks-axi --help` - global usage
- `tasks-axi <command> --help` - per-command usage

If the CLI is not on `PATH`, invoke it with `mise exec -- tasks-axi`.
