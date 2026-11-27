# Development rules

> [!CAUTION]
> Follow the [Fleet WSL2 setup and environment checks](README.md#wsl2-setup) before contributing. Run local installs, scripts, tests, builds, and Git hooks inside WSL2 Ubuntu with a checkout on the Ubuntu filesystem. Windows shells, Windows Node.js, and Windows-mounted checkouts can break native bindings and Git hooks or introduce line-ending changes.

- Run `nvm use` to select Node.js 24 from `.nvmrc`, and verify that pnpm matches `package.json`. Stop and correct a runtime mismatch before installing or running Fleet. Do not use end-of-life Node releases, add deprecated dependencies as a workaround, or bypass engine checks.
- Install existing dependencies with `pnpm install --frozen-lockfile`. Commit `pnpm-lock.yaml` with intentional dependency changes and avoid generating an npm lockfile.
- Run `pnpm format` to format with Oxfmt and `pnpm format:check` to verify it. For editor formatting, open this project in VS Code and install the recommended Oxc extension.
- Husky runs Oxlint and then Oxfmt on staged JavaScript/TypeScript files before each commit. Staged JSON, CSS, Markdown, and YAML files run through Oxfmt only. Hooks are installed by the `prepare` script during dependency installation.
- Before pushing, Husky runs `npm run typecheck` for the whole project. TypeScript and production builds never run in pre-commit.
- Once Electron has its own `electron/tsconfig.json`, append `npx tsc -p electron --noEmit` to `.husky/pre-push`, after the app typecheck. Both commands must succeed.
- Hooks can be skipped with `--no-verify`; required CI checks remain the enforcement boundary. Do not bypass hooks during normal development.
- Before opening a pull request, run `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
- Use commit messages such as `feat(drivers-helpers): add crew management` or `fix(bookings): validate pickup time`.
- Keep UI changes consistent with shadcn Mira: compact controls, consistent spacing, restrained typography, and existing theme tokens.
- CI runs formatting, linting, type checks, and a production build for pull requests and pushes to `main` and `dev`.
- In GitHub branch protection, require the `Checks` and `Build` status checks and pull-request review before merging. These settings must be enabled in GitHub separately.
- Never commit secrets or `.env` files.
