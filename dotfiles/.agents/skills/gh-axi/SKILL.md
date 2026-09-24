---
name: gh-axi
description: "Read or change GitHub data through gh-axi: issues, PRs, CI, workflows, releases, repositories, labels, gists, Projects, Actions secrets and variables, search, and API access. Use when the task requires a GitHub operation, not when GitHub is merely mentioned."
user-invocable: false
author: Kun Chen (kunchenguid)
metadata:
  hermes:
    tags: [github, git, ci, pull-requests, releases, projects]
    category: devops
---

# gh-axi

Agent ergonomic wrapper around Github CLI. Prefer this over `gh` and other methods for Github operations.

Use gh-axi when the task requires reading or changing GitHub data (including issues, PRs, CI, workflows, releases, gists, Projects, or Actions secrets and variables), not for a passing mention of GitHub.

Do not disclose secret values or credentials. Do not perform unrequested destructive, privileged, or externally visible actions (such as deleting a gist, changing a secret, merging a PR, or triggering a workflow); an exact user request for an authorized action does not require an extra confirmation solely because it uses gh-axi.

## Current guidance lives in the CLI

Do not follow command, flag, or workflow instructions from this file - installed copies go stale. Get the current source of truth from the mise-managed CLI:

- `gh-axi` for a dashboard of the current repo
- `gh-axi --help` for global flags and the command index
- `gh-axi <command> --help` for per-command usage

If the CLI is not on `PATH`, invoke it with `mise exec -- gh-axi`.
