# Largest Contentful Paint Debugging

Use this workflow for slow hero images or text and page-load Core Web Vitals. Keep the URL, viewport, throttling, and cache assumptions stable across comparisons.

## Workflow

1. Open the exact route and select a stable device or network profile with `emulate` when relevant.
2. Run `perf-start`, reload the page, then run `perf-stop`.
3. Use `perf-insight <set> <name>` for available `LCPBreakdown`, `DocumentLatency`, `RenderBlocking`, and `LCPDiscovery` insights.
4. Run `eval` with the "Identify LCP Element" snippet from `lcp-snippets.md`.
5. Inspect `network`, then `network-get <id>` for the LCP resource. Check discovery time, duration, and dependency chains.
6. Run the "Audit Common Issues" snippet from `lcp-snippets.md`. Use `lcp-elements-and-size.md` to check candidate eligibility.
7. Diagnose the dominant subpart with `lcp-breakdown.md`, then choose the smallest matching fix from `lcp-optimization-strategies.md`.
8. Repeat the same trace once to verify the change. Stop after two trace-and-fix loops unless the user asks for deeper tuning.

Prefer read-only investigation. Do not change application or production configuration unless the user asks for a fix.
