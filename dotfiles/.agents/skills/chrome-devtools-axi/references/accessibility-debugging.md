# Accessibility Debugging

Use this workflow for rendered-page accessibility issues, not static source review or formal compliance certification.

## Workflow

1. Open the target page and run `lighthouse`; record the accessibility score and failing audits.
2. Run `console` and treat browser-reported ARIA, label, and contrast issues as starting points.
3. Run `snapshot` and inspect landmarks, heading order, accessible names, and whether expected controls appear.
4. Test keyboard order with `press Tab` and `press Shift+Tab`, refreshing the snapshot after each state change.
5. Use `eval` with the targeted snippets from `a11y-snippets.md` for orphaned inputs, tap targets, approximate contrast, and global page checks.
6. Compare visual and reading order with `screenshot <path>` only when layout matters.
7. After a fix, rerun the smallest relevant checks and report the failure, evidence, affected UI, user impact, and recommended fix.

Do not sign in, submit destructive forms, change production data, or claim WCAG compliance from screenshots or automated checks alone.
