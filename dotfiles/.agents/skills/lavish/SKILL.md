---
name: lavish
description: Use lavish-axi to create reviewable HTML artifacts when explicitly requested or when a complex visual deliverable materially improves review over ordinary prose.
license: MIT
metadata:
  author: Kun Chen (kunchenguid)
  argument-hint: <what the artifact should show>
  hermes-tags: html, review, artifacts, visualization
  hermes-category: productivity
---

# Lavish Editor

Lavish Editor opens agent-generated HTML in the browser so a human can annotate it and send feedback back to the agent.
Use it for an explicit `/lavish` request, or when a complex plan, comparison, diagram, table, code view, report, prototype, or review loop materially benefits from an annotatable page. Otherwise respond in ordinary prose; a plain report alone does not call for an artifact.

## Current guidance lives in the CLI

Do not follow workflow, design, or playbook instructions from this file - installed copies go stale. Get the current source of truth from the mise-managed CLI:

- `lavish-axi --help` for commands and the review-loop workflow
- `lavish-axi design` for design-direction priority and current snippets
- `lavish-axi playbook <id>` for focused artifact guidance (`lavish-axi playbook` lists ids)

The CLI is installed globally by mise. If it is not on `PATH`, invoke it with `mise exec -- lavish-axi`.

`lavish-axi` opens the artifact in the user's browser itself. Do not separately open it with a browser or browser-automation tool.

## Request

$ARGUMENTS

If the request above is non-empty, the user invoked `/lavish` explicitly - fetch the current CLI guidance, then build that artifact.
If it is empty, infer the requested artifact from the conversation when `/lavish` was explicitly invoked; otherwise use the criteria above before choosing to visualize anything.
