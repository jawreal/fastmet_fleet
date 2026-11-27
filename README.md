# FastMet Fleet

Fleet management app built with Next.js App Router, TypeScript, and shadcn UI with Mira styling. The app source lives in `src/`.

See the [Fleet authentication guide](docs/authentication-api.md) for local setup, the development account seed, and authentication tests.

## Requirements

- WSL2 Ubuntu, using Linux bash and Linux Node/pnpm for all commands
- Node.js 24.0.0 or newer, below 27.0.0. Node.js 24 is recommended for development and used in CI.
- pnpm 12.11.2 (the version declared in `package.json`)
- Docker Desktop with WSL integration enabled for Ubuntu and the Docker Compose plugin
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

From the Fleet repository directory, install the dependencies.

```sh
nvm install
nvm use
node --version
pnpm install --frozen-lockfile
```

With NVM installed, `nvm install` and `nvm use` read `.nvmrc` and select Node.js 24. Other supported Node versions can be selected explicitly. pnpm rejects unsupported versions through `engines.node` and `engineStrict`.

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
