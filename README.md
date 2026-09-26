# Tools

Personal global [mise](https://mise.jdx.dev/) configuration for CLI tools.

## Install mise

### Linux / macOS

```bash
curl https://mise.run | sh
```

### Windows

Using Scoop:

```powershell
scoop install mise
```

Or winget:

```powershell
winget install jdx.mise
```

## Install this config

Clone the repository directly into mise's global config directory.

### Linux / macOS

```bash
git clone https://github.com/nikolauska/tools.git ~/.config/mise
```

### Windows

```powershell
git clone https://github.com/nikolauska/tools.git "$HOME\.config\mise"
```

Then install the configured tools:

```bash

mise bootstrap
```

## Herdr plugins

Local Herdr plugins live in `herdr-plugins/`. When mise installs or upgrades Herdr, it links them in place with `herdr plugin link`, so Herdr runs the files straight from this repository. Linking again is harmless, so on a machine where Herdr is already installed you can link by hand:

```bash
herdr plugin link ~/.config/mise/herdr-plugins/treehouse-worktree
```

Herdr's own config, including plugin keybindings, lives in `dotfiles/.config/herdr/config.toml` and is copied to `~/.config/herdr/config.toml` as a mise dotfile. After changing it here, apply it and reload Herdr:

```bash
mise dot apply ~/.config/herdr/config.toml
herdr server reload-config
```

If you change settings from inside Herdr instead, copy them back into the repo with `mise dot add --changed`.

## Update

```bash
mise update
```
