# Treehouse worktrees

Treehouse is an optional way to manage worktrees in Herdr. From a repository space, a person can open a Treehouse-managed worktree. It appears beneath that repository space, where they can work in it like another Herdr space.

Closing the worktree space returns the worktree to Treehouse's pool for reuse, where it is reset for the next person. A new worktree is not on a branch, so commits made there need a branch or a push before the worktree can be returned. If the worktree has uncommitted changes, or commits that are not on any branch, tag, or remote branch, closing the space does not discard them or return the worktree. The checkout remains reserved; the person can reopen it, save their work and put it on a branch, then return it.

Herdr's native Remove command is separate from returning a worktree to Treehouse. It does not return the Treehouse lease, so people should close Treehouse-backed spaces rather than use Remove.
