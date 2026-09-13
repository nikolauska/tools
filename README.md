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
```

git clone <https://github.com/nikolauska/tools.git> "$HOME\.config\mise"

Then install the configured tools:

```bash

mise install
```

## Update

```bash
cd ~/.config/mise
git pull
mise install
```
