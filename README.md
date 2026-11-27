# FastMet Fleet

Fleet management app built with Next.js App Router, TypeScript, and shadcn UI with Mira styling. The app source lives in `src/`.

See the [Fleet authentication guide](docs/authentication-api.md) for local setup, the development account seed, and authentication tests.

## Requirements

> [!CAUTION]
> WSL2 Ubuntu is required for local Fleet development. Follow the setup below before installing or running Fleet. Windows Node.js, Windows shells, and checkouts on Windows-mounted drives can break native dependencies, file permissions, line endings, and Git hooks.

- WSL2 Ubuntu, using Linux bash and Linux Node/pnpm for all commands
- Node.js 24.0.0 or newer, below 27.0.0. Node.js 24 is recommended for development and used in CI.
- pnpm 12.11.2 (the version declared in `package.json`)
- Docker Desktop with WSL integration enabled for Ubuntu and the Docker Compose plugin
- Git, for cloning the repository and installing Git hooks

Use pnpm for dependencies and project commands. Keep `pnpm-lock.yaml`; do not generate an npm or Yarn lockfile.

## WSL2 setup

Keep your checkout in the Ubuntu filesystem, for example `/home/jorel/fleet_project/fastmet_fleet`. In each session, open **Ubuntu** from the Windows Start menu or launch `wsl -d Ubuntu` from Windows Terminal. Once in Ubuntu, `cd` to the Fleet directory and run `nvm use`. Run all project commands in Ubuntu Bash. Never run Fleet tooling from PowerShell, CMD, or Git Bash for Windows, work under `/mnt/c/...` or another Windows-mounted drive, or copy `node_modules` between operating systems.

### First-time WSL2 setup

1. On Windows, open PowerShell as administrator to install WSL and Ubuntu. Restart Windows if prompted. Use PowerShell here for WSL setup only. [Microsoft's WSL installation guide](https://learn.microsoft.com/en-us/windows/wsl/install)

   ```powershell
   wsl --install -d Ubuntu
   ```

2. Open **Ubuntu** from the Start menu and create a Linux username and password when prompted. In Windows PowerShell, run `wsl --list --verbose` and confirm Ubuntu shows `VERSION 2`. If it shows `1`, run `wsl --set-version Ubuntu 2` before continuing.
3. Return to Ubuntu Bash and install Git and the prerequisites for NVM. Install NVM inside Ubuntu, then open a new Ubuntu shell. [NVM installation instructions](https://github.com/nvm-sh/nvm#installing-and-updating)

   ```bash
   sudo apt update
   sudo apt install -y git curl ca-certificates
   ```

4. If you already have a Fleet checkout under your Ubuntu home directory, use it. Otherwise, clone the Fleet repository from Ubuntu into a directory under `~/` and enter the Fleet directory containing `.nvmrc` and `package.json`. For VS Code, install the **WSL** extension and run `code .` from that Ubuntu directory. [VS Code WSL setup](https://code.visualstudio.com/docs/remote/wsl)
5. For the local databases, start Docker Desktop and enable **Settings → Resources → WSL Integration → Ubuntu**. Back in Ubuntu Bash, run `docker compose version` to check that Compose is available. [Docker Desktop WSL integration](https://docs.docker.com/desktop/features/wsl/)

### Verify the environment

From the Fleet directory in Ubuntu, run `nvm install` if Node.js 24 is missing, then run `nvm use`. Verify the environment before installing dependencies or running Fleet:

```bash
uname -a                   # Linux with microsoft / WSL2
head -2 /etc/os-release    # Ubuntu
pwd -P                     # Under /home/<linux-user>/...
command -v node pnpm       # Both under the Linux NVM installation
```

After confirming both executable paths are in the Linux NVM installation, check the runtime:

```bash
node -p 'process.platform' # linux
node --version             # v24.x.x for the default setup
pnpm --version             # 12.11.2
```

If the Node path is on a Windows mount, activate the Linux NVM installation and run `nvm use` again. If pnpm is missing, resolves to a Windows path, or reports the wrong version, verify that `command -v npm` points to the Linux Node.js 24 installation, then run `npm install --global pnpm@12.11.2` there. Run `hash -r` and repeat the checks. Use pnpm for all Fleet dependency installs and project scripts.

If a check shows a Windows executable path, a Windows-mounted checkout, or an application-control blocking error, stop and correct the environment before continuing. Windows Smart App Control can block Oxlint's native binary and report “Cannot find native binding.” Do not add Windows bindings, edit the package manifest or lockfile, remove lint tools, or bypass Git hooks to fix this environment issue.

## Install and run

> [!IMPORTANT]
> Use Node.js 24, the version selected by `.nvmrc` and used in CI. Unsupported or end-of-life versions can trigger deprecation warnings and break dependencies or builds. Correct the runtime first. Avoid adding deprecated modules or relaxing engine checks to get an install to pass.

With the environment checks passing, install the dependencies and verify that Oxlint loads its Linux native binding.

```sh
pnpm install --frozen-lockfile
pnpm exec oxlint --version
```

If you explicitly need a different Node version, use a stable release within the `engines.node` range in `package.json` (`>=24.0.0 <27.0.0`). pnpm uses that range and `engineStrict` to reject unsupported versions. If a deprecation warning persists after switching to Node.js 24, identify and report the module that emits it before changing dependencies.

If you don't have `.env.local`, run `cp .env.example .env.local` and `chmod 600 .env.local`. Keep this file private. Run `openssl rand -hex 24` twice for separate MongoDB and Redis passwords. Use the MongoDB password in both `FLEET_MONGO_PASSWORD` and `FLEET_MONGODB_URI`, and put the Redis password in `REDIS_PASSWORD`. Run `openssl rand -hex 32` for `FLEET_AUTH_ENCRYPTION_KEY` and keep that key stable. The [Fleet authentication guide](docs/authentication-api.md#turnstile-configuration) gives public Turnstile test keys for local sign-in.

Start the databases, then run Next.js natively in WSL.

```sh
pnpm docker:up
pnpm dev:custom
```

Open [Fleet sign-in](http://localhost:4001/login). Local MongoDB starts empty. Follow the [development seed instructions](docs/authentication-api.md#start-fleet-locally) to create a synthetic approved account. For port 3000, use `pnpm dev` and set `FLEET_AUTH_ORIGIN=http://localhost:3000`.

MongoDB listens on `127.0.0.1:27017`. Redis listens on `127.0.0.1:14639` by default. If that Redis port is occupied, choose a free port in `REDIS_PORT` before starting Compose. MongoDB uses standalone mode because Fleet's DAL uses single-document operations and has no change-stream subscriptions. MongoDB and Redis use named volumes, and Redis enables append-only persistence and `noeviction`. MongoDB creates its local admin user when the volume is initialized. Editing the password in `.env.local` alone will not change the password on an existing volume.

Stop Next.js with `Ctrl+C`. Run `pnpm docker:stop` to stop the services or `pnpm docker:down` to remove their containers. Both preserve the volumes. Run `pnpm docker:up` to bring the services back and wait for their health checks. These Docker commands also work from the monorepo root through its local runner scripts.

### Backend-dependent workflows

Fleet owns sign-in, sessions, and rate limiting. The requirements checklist, document previews, and replacement uploads also require a separate FastMet Backend development instance. Set its `MONGODB_URI` to the same local URI and database as Fleet's `FLEET_MONGODB_URI` so it can validate Fleet's sessions and read the associated application records. Point Fleet's `FLEET_BACKEND_URL` at that backend. Fleet's rate limiter connects directly to Redis and can use its own instance. Document storage remains on Cloudinary through the backend.

### Switch back to cloud services

Stop Next.js and run `pnpm docker:down` while the local settings are active. In `.env.local`, comment out the local Docker block and restore the original `FLEET_MONGODB_URI`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, and `REDIS_TLS` settings together. Set `REDIS_TLS=true` if the cloud endpoint requires TLS. Confirm that `FLEET_BACKEND_URL` points to the backend for that database, then restart Next.js.

## Production mode

```sh
pnpm build
pnpm start
```

Build first, then start the production server. Open [Operations overview](http://localhost:3000/operations/overview).

## Available commands

| Command                | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| `pnpm dev`             | Start development on port 3000                     |
| `pnpm dev:custom`      | Start development on port 4001                     |
| `pnpm docker:up`       | Start MongoDB and Redis and wait for health checks |
| `pnpm docker:down`     | Remove the service containers and keep volumes     |
| `pnpm docker:stop`     | Stop the service containers                        |
| `pnpm docker:restart`  | Restart the service containers                     |
| `pnpm docker:logs`     | Follow MongoDB and Redis logs                      |
| `pnpm docker:ps`       | Show service status, including stopped containers  |
| `pnpm build`           | Create a production build                          |
| `pnpm start`           | Serve the production build                         |
| `pnpm lint`            | Run Oxlint checks                                  |
| `pnpm typecheck`       | Check TypeScript using the project configuration   |
| `pnpm test:fleet-auth` | Run authentication tests with isolated databases   |
| `pnpm format`          | Format supported files with Oxfmt                  |
| `pnpm format:check`    | Check formatting without modifying files           |

## Git hooks and CI

Dependency installation attempts to configure Husky automatically.

- **Before committing:** lint-staged runs Oxlint and Oxfmt on staged source files, in that order. Staged JSON, CSS, Markdown, and YAML files run through Oxfmt only. Successful fixes are re-staged automatically.
- **Before pushing:** the hook runs the project TypeScript check. A failure blocks the push.
- **In GitHub Actions:** the `Checks` and `Build` jobs validate formatting, linting, TypeScript, and production compilation for pull requests and pushes to `main` and `dev`.

Required status checks must also be configured in GitHub branch protection. The authentication test suite requires `redis-server` on your PATH. See the [authentication checks](docs/authentication-api.md#checks).

See [CONTRIBUTING.md](CONTRIBUTING.md) for development rules and [AGENTS.md](AGENTS.md) for coding-agent instructions.

## Troubleshooting

- **“Cannot find native binding” with “An Application Control policy has blocked this file”:** the command is running on Windows. Stop and use Ubuntu bash with Linux Node/pnpm; repeat the WSL2 setup checks above.
- **Dependencies were installed on Windows or appear broken:** in the Ubuntu repository directory, run `rm -rf node_modules`, then `pnpm install --frozen-lockfile`. Never copy dependencies across operating systems.
- **`/bin/sh^M: bad interpreter`:** use Linux Node/pnpm and ensure scripts use LF line endings.
- **`wsl: command not found` inside Ubuntu:** `wsl` is a Windows-only command; run project commands directly in Ubuntu bash.
- **App port is occupied:** stop the existing server or use `pnpm dev:custom` for port 4001.
- **Docker socket access is denied:** confirm Docker Desktop's Ubuntu integration is enabled. If your user was recently added to the `docker` group, start a fresh WSL login and check `id -nG` before rerunning Docker.
- **Git hooks are missing:** run `pnpm exec husky`, then check `git config --get core.hooksPath`; it should report `.husky/_`.
- **Formatting fails:** run `pnpm format`, review the changes, and stage the files you intend to commit.
- **Type checking blocks a push:** run `pnpm typecheck`, fix the reported errors, and retry.
- **Dependency installation fails in CI:** ensure `package.json` and `pnpm-lock.yaml` are both updated using `pnpm install` and included in the same change.

## Requests sidebar preview

The request sidebar shows matching mock requests under each active vehicle.
Use **Alt+Shift+Q** to toggle it. In development, try
`?scenario=same-type` to see shared requests, or `?scenario=stress` for a busy fleet.
See [the sidebar guide](docs/request-sidebar.md) for all seven scenarios and the
field mapping.
