---
name: cbm-axi
description: >
  Use cbm-axi for indexed codebase search, graph tracing, architecture, or
  source inspection through codebase-memory-mcp.
---

# cbm-axi

`cbm-axi` wraps an installed `codebase-memory-mcp` (0.11.0 or newer) and prints
compact TOON. Both binaries must already be on `PATH`; cbm-axi never installs
or manages the backend, and it never prompts.

The CLI documents itself; rely on it rather than guessing flags or output
meaning:

- `cbm-axi` shows the current directory's project, whether its index needs
  indexing or a rebuild, and the next commands to run.
- `cbm-axi --help` lists every command by the question it answers, plus the
  rules for reading results, paging, and exit codes.
- `cbm-axi <command> --help` lists that command's flags and notes.
- Every response ends with `help` lines for the next page or next step; run
  them, replacing `<placeholders>` with values from the results.

Run commands that change state (`delete_project`, `ingest_traces`, ADR writes
with `manage_adr`, `setup hooks`, `update`) only when the user asks. Ask before
retrying a failed index with elevated filesystem access.
