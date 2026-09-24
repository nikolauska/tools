---
name: quota-axi
description: "Report local provider quota headroom, usage, reset times, and pace with quota-axi when checking remaining capacity or comparing provider windows. Data only; not for routing or credential management."
user-invocable: false
author: Kun Chen (kunchenguid)
metadata:
  hermes:
    tags:
      - quota
      - rate-limits
      - pace
      - claude
      - codex
      - cursor
      - copilot
      - grok
      - kimi
      - zai
      - agy
      - alibaba
      - opencode-go
      - minimax
      - mimo
      - deepseek
      - openrouter
      - antigravity
      - commandcode
      - elevenlabs
      - cli
    category: observability
---

# quota-axi

Report local Claude, Codex, Cursor, GitHub Copilot, Grok, Kimi, Z.AI, Alibaba, OpenCode Go, Antigravity, Command Code, MiniMax, MiMo, DeepSeek, OpenRouter, and ElevenLabs quota windows.
quota-axi is data only: it never routes, recommends, ranks, or mints credentials. Every quota read
may delegate renewal of an expired session to its vendor CLI; `--no-credential-refresh` disables
delegated renewal. The `auth` command is always read-only.

Use it when you need local quota headroom before deciding whether it is safe to keep spending a
provider, when the user asks about usage, rate limits, pace, or remaining quota, or when comparing
local provider headroom.

For current instructions, output shape, and field semantics, run the mise-managed CLI:

- `quota-axi` - default TOON report
- `quota-axi --help` - commands and flags
- `quota-axi --json` / `quota-axi --full` - current output shape and field semantics

If the CLI is not on `PATH`, invoke it with `mise exec -- quota-axi`.
