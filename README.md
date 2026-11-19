# FastMet Fleet

Fleet management app built with Next.js App Router, TypeScript, and shadcn UI with Mira styling. The app source lives in `src/`.

## Requirements

- WSL2 Ubuntu, using Linux bash and Linux Node/pnpm for all commands
- Node.js 24
- pnpm 12.11.2 (the version declared in `package.json`)
- Git, for cloning the repository and installing Git hooks

Use pnpm for dependencies and project commands. Keep `pnpm-lock.yaml`; do not generate an npm or Yarn lockfile.

## WSL2 setup

This project's local development environment is WSL2 Ubuntu. Keep your checkout in the Linux filesystem (for example, `/home/jorel/projects/<repo>`), and open it through your editor's WSL integration. Run commands in Ubuntu bash, never PowerShell, CMD, or Windows Node. Do not work from `/mnt/c/...` or copy `node_modules` between Windows and Ubuntu.

Before running project commands, check from the repository directory:

```bash
uname -a                    # Linux with microsoft / WSL2
head -2 /etc/os-release      # Ubuntu
which node pnpm             # Under /home/jorel/.nvm/, not /mnt/c/...
pnpm exec oxlint --version   # Prints a version
```

If a check shows a Windows executable path or an application-control blocking error, stop and switch to Ubuntu before continuing. On this machine, Windows Smart App Control blocks Oxlint's unsigned native binary and can produce a misleading “Cannot find native binding” error. Do not add OS-specific bindings, edit the package manifest or lockfile, remove lint tools, or bypass Git hooks to fix this environment issue.

## Install and run

From the repository directory:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [Operations overview](http://localhost:3000/operations/overview). The app currently has no `/` page, so use an application route rather than the root URL.

To use the project's alternate development port:

```sh
pnpm dev:custom
```

Then open [Operations overview on port 4000](http://localhost:4000/operations/overview).

Changes to files in `src/` appear automatically while the development server is running. Stop the server with `Ctrl+C`.

The current app uses sample data and does not require environment variables to start. Some interactions are demos; data persistence depends on the feature.

## Production mode

```sh
pnpm build
pnpm start
```

Build first, then start the production server. Open [Operations overview](http://localhost:3000/operations/overview).

## Available commands

| Command             | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `pnpm dev`          | Start development on port 3000                   |
| `pnpm dev:custom`   | Start development on port 4000                   |
| `pnpm build`        | Create a production build                        |
| `pnpm start`        | Serve the production build                       |
| `pnpm lint`         | Run Oxlint checks                                |
| `pnpm typecheck`    | Check TypeScript using the project configuration |
| `pnpm format`       | Format supported files with Oxfmt                |
| `pnpm format:check` | Check formatting without modifying files         |

## Git hooks and CI

Dependency installation attempts to configure Husky automatically.

- **Before committing:** lint-staged runs Oxlint and Oxfmt on staged source files, in that order. Staged JSON, CSS, Markdown, and YAML files run through Oxfmt only. Successful fixes are re-staged automatically.
- **Before pushing:** the hook runs the project TypeScript check. A failure blocks the push.
- **In GitHub Actions:** the `Checks` and `Build` jobs validate formatting, linting, TypeScript, and production compilation for pull requests and pushes to `main` and `dev`.

Local hooks do not replace CI. Required status checks must also be configured in GitHub branch protection. No test suite or Electron project is configured yet.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development rules and [AGENTS.md](AGENTS.md) for coding-agent instructions.

## Troubleshooting

- **“Cannot find native binding” with “An Application Control policy has blocked this file”:** the command is running on Windows. Stop and use Ubuntu bash with Linux Node/pnpm; repeat the WSL2 setup checks above.
- **Dependencies were installed on Windows or appear broken:** in the Ubuntu repository directory, run `rm -rf node_modules`, then `pnpm install --frozen-lockfile`. Never copy dependencies across operating systems.
- **`/bin/sh^M: bad interpreter`:** use Linux Node/pnpm and ensure scripts use LF line endings.
- **`wsl: command not found` inside Ubuntu:** `wsl` is a Windows-only command; run project commands directly in Ubuntu bash.
- **Port is occupied:** stop the existing server or use `pnpm dev:custom` for port 4000.
- **Git hooks are missing:** run `pnpm exec husky`, then check `git config --get core.hooksPath`; it should report `.husky/_`.
- **Formatting fails:** run `pnpm format`, review the changes, and stage the files you intend to commit.
- **Type checking blocks a push:** run `pnpm typecheck`, fix the reported errors, and retry.
- **Dependency installation fails in CI:** ensure `package.json` and `pnpm-lock.yaml` are both updated using `pnpm install` and included in the same change.
