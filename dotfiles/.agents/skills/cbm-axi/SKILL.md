---
name: cbm-axi
description: >
  Use cbm-axi for indexed codebase search, graph tracing, architecture, or
  source inspection through codebase-memory-mcp.
---

# cbm-axi

Use the `cbm-axi` CLI for compact, structured TOON output. Both
`codebase-memory-mcp` 0.10.2 or newer and `cbm-axi` are installed globally by
mise; if either binary is missing, run `mise install --locked`.
Run `cbm-axi setup hooks` only when user-level session hooks are wanted. The
CLI never prompts.

## Workflow

1. For indexed-codebase work, run `cbm-axi` for read-only status. Use
   `list_projects` or `index_status` when the project or index state needs
   clarification; use `get_graph_schema` when constructing graph queries.
2. If the relevant repo is not indexed, index it when graph context is useful
   to the task. For a narrow or simple lookup, use direct source search instead
   of indexing the whole repo. If indexing fails because the user cache is not
   writable, ask for permission before retrying with elevated filesystem access.
3. In an indexed repo, use `search_graph` or `search_code` before requesting
   graph snippets; use `get_code_snippet` after finding an exact qualified name.
   Read source directly where needed to verify what the index reports.
4. Use `trace_path`, `query_graph`, `get_architecture`, or `detect_changes`
   when relationships, architecture, or impact matter.
5. Use `check_index_coverage` when completeness matters or expected code is
   absent from search; it is a best-effort signal, not proof of completeness.

## CLI commands

```sh
cbm-axi
cbm-axi list_projects
cbm-axi index_repository --repo-path <path>
cbm-axi search_graph --project <project> --query "<terms>"
cbm-axi search_graph --project <project> --name-pattern ".*Handler.*"
cbm-axi get_code_snippet --project <project> --qualified-name <qualified-name>
cbm-axi trace_path --project <project> --function-name <name> --direction both
cbm-axi get_architecture --project <project>
cbm-axi check_index_coverage --project <project> --scopes .
cbm-axi query_graph --project <project> \
  --query "MATCH (f:Function) RETURN f.name LIMIT 20"
cbm-axi update --check
```

Use `--fields` for a smaller projection and `--full` when a detail response
reports truncation.

`CALLS` means a callable invocation. Query `CALL_REFERENCE` as well when the
task needs proven references to a callable passed as a value.

Search results default to 20 rows; follow `has_more` and the emitted next-page
guidance for more.

Successful data and errors are TOON on stdout. Exit code 0 means success, 1
means an operational failure, and 2 means invalid usage.

Run `cbm-axi <command> --help` for the upstream command's required flags and
examples.
