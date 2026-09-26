<h1 align="center">Herdr Treehouse Plugin</h1>

<p align="center">Open Treehouse worktrees beneath their Herdr space, then return them to the pool when the space closes. Uncommitted changes and commits that are not on a branch stay in a leased worktree.</p>

See the [Treehouse worktrees guide](docs/domain/treehouse-worktrees.md) for how worktrees appear in Herdr and what happens when a space closes.

## Install and use

Install Node.js and Treehouse 3.x on the machine running Herdr 0.9.1 or newer, and ensure `node` and `treehouse` are on the Herdr server's `PATH`. This repository's mise config installs all three and links this directory when it installs Herdr. To link it by hand:

```sh
herdr plugin link ~/.config/mise/herdr-plugins/treehouse-worktree
```

Focus the main repository space and invoke the action:

```sh
herdr plugin action invoke treehouse.worktree.open
herdr plugin log list --plugin treehouse.worktree
```

The action runs asynchronously. Check the plugin log for the new workspace ID, checkout path, or errors. The shortcut `prefix+t` is bound in this repo's Herdr config, `dotfiles/.config/herdr/config.toml`, because plugin manifests can't declare keys:

```toml
[[keys.command]]
key = "prefix+t"
type = "plugin_action"
command = "treehouse.worktree.open"
description = "Open Treehouse worktree"
```

Close the nested Herdr space to return its Treehouse lease. The plugin keeps the lease, and the checkout's files, when the checkout has uncommitted changes or commits that are not on any branch, tag, or remote branch. Worktrees start on a detached HEAD, so if you commit there, create a branch (`git switch -c <name>`) or push before closing. Herdr's native **Remove** bypasses Treehouse; close the space instead.

## Recover a worktree that did not return

Check `herdr plugin log list --plugin treehouse.worktree` for the failed return and saved record path. The record contains the exact `path` and `lease_id`. Reopen the path in Herdr if needed, commit or discard the changes, and put any commits on a branch or push them. Then return that lease without `--force`. Treehouse's own message in the log suggests `--force`, but it discards the checkout's changes.

```sh
treehouse return --if-lease-id <lease-id> <path>
```

After Treehouse confirms the return, remove the corresponding saved plugin record. If a record has no workspace ID, opening was interrupted: check whether Herdr opened the worktree before returning it. A close only returns a lease when the closed space shows the same checkout the plugin opened, so a workspace ID that Herdr reuses after a restart cannot return another space's worktree. The plugin does not automatically discard uncommitted changes or return a lease whose space disappeared without a close event.
