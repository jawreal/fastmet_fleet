# Development rules

For installation, development servers, and production startup, see [README.md](README.md).

- Use Node.js 24 and the pnpm version specified in `package.json`.
- Install dependencies with `pnpm install`. Commit `pnpm-lock.yaml` with dependency changes; do not generate an npm lockfile.
- Run `pnpm format` to apply formatting and `pnpm format:check` to verify it.
- Husky runs Oxlint, ESLint, then Prettier sequentially on staged JavaScript/TypeScript files before each commit. Staged JSON, CSS, Markdown, and YAML files run through Prettier only. Hooks are installed by the `prepare` script during dependency installation.
- Before pushing, Husky runs `npm run typecheck` for the whole project. TypeScript and production builds never run in pre-commit.
- Once Electron has its own `electron/tsconfig.json`, append `npx tsc -p electron --noEmit` to `.husky/pre-push`, after the app typecheck. Both commands must succeed.
- Hooks can be skipped with `--no-verify`; required CI checks remain the enforcement boundary. Do not bypass hooks during normal development.
- Before opening a pull request, run `pnpm lint`, `pnpm lint:ox`, `pnpm typecheck`, and `pnpm build`.
- Use commit messages such as `feat(drivers-helpers): add crew management` or `fix(bookings): validate pickup time`.
- Keep UI changes consistent with shadcn Mira: compact controls, consistent spacing, restrained typography, and existing theme tokens.
- CI runs formatting, linting, type checks, and a production build for pull requests and pushes to `main` and `dev`.
- In GitHub branch protection, require the `Checks` and `Build` status checks and pull-request review before merging. These settings must be enabled in GitHub separately.
- Never commit secrets or `.env` files.
