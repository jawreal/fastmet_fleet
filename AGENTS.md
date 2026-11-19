# Agent development rules

## Fleet authentication context

- Read [the fleet authentication context](docs/authentication-context.md) before planning or changing authentication, onboarding, or related routing in this project. Apply its constraints throughout this folder and its subfolders where relevant.
- This document records requirements, not completed functionality or authorization to implement them. Wait for an explicit implementation request before starting the authentication build.
- Keep fleet frontend work separate from backend provisioning and the main admin app. Preserve the existing development rules below.

## WSL2 Ubuntu environment

- This project runs in WSL2 Ubuntu. Run every command in Linux bash, never PowerShell, CMD, or Windows Node.
- Keep the repository in the Linux filesystem (for example, `/home/jorel/projects/<repo>`). Use the existing Linux checkout; do not move it to or work from `/mnt/c/...`. Use Linux paths in commands and file references.
- Before running project commands, verify the environment from the repository directory:

  ```bash
  uname -a
  head -2 /etc/os-release
  which node pnpm
  pnpm exec oxlint --version
  ```

  Expect Linux with `microsoft` / WSL2, Ubuntu, Node and pnpm under `/home/jorel/.nvm/`, and an Oxlint version.

- If a check shows a Windows executable path or an application-control blocking error, stop and tell the user. Do not work around it by changing dependencies or checks.
- Windows Smart App Control blocks Oxlint's unsigned native binary on this machine. Its “Cannot find native binding” error alongside “An Application Control policy has blocked this file” means the command is running on Windows; run it in Ubuntu.
- Never add OS-specific bindings such as `@oxlint/binding-win32-x64-msvc`, or edit `package.json` / `pnpm-lock.yaml` just to resolve tooling errors. Preserve Oxlint, lint-staged, and Husky hooks.
- Do not copy `node_modules` between Windows and Ubuntu. If dependencies are broken, remove the repository's `node_modules` and reinstall in Ubuntu with `pnpm install --frozen-lockfile`.
- `/bin/sh^M: bad interpreter` indicates a Windows script or CRLF line endings; use Linux Node/pnpm and LF scripts. `wsl: command not found` inside Ubuntu is expected: `wsl` is a Windows command.

## Dependencies and runtime

- Use the Node.js range and pnpm version declared in `package.json`. Node.js 24 is recommended for development and used in CI.
- Use pnpm for dependency installation and project scripts. Do not introduce `package-lock.json`, `yarn.lock`, or another package manager.
- Install existing dependencies with `pnpm install --frozen-lockfile`.
- Include `pnpm-lock.yaml` whenever dependency changes require it. Never edit the lockfile manually or bypass frozen-lockfile failures in CI.
- Keep dependency changes relevant to the task. Do not upgrade unrelated packages or approve package-provided agent skills automatically.

## Formatting

- Follow `.oxfmtrc.json` and `.gitattributes`; use LF line endings, including in Husky hooks.
- Format changed supported files with `pnpm exec oxfmt --write <paths>` and validate with `pnpm format:check`.
- Use `pnpm format` for an explicitly requested repository-wide formatting pass. Avoid unrelated formatting churn during focused changes.
- Do not disable formatting checks, add ignore patterns, or weaken rules merely to make validation pass.

## Git hooks and commits

- Preserve the `prepare` script and Husky hooks. Pre-commit runs lint-staged: Oxlint and Oxfmt sequentially for staged JS/TS; Oxfmt only for staged JSON/CSS/Markdown/YAML. Never run whole-project lint, formatting, TypeScript, or builds in pre-commit.
- Pre-push runs the project TypeScript check. Do not pass staged filenames to TypeScript; it must read the project configuration. Add the separate Electron project check only once Electron is configured.
- Do not bypass hooks with `HUSKY=0`, `--no-verify`, or Git configuration changes during local commits. Fix the cause of hook failures in Ubuntu. The existing `HUSKY=0` setting in CI is intentional.
- Inspect staged changes before committing. Respect partial staging and do not stage unrelated user changes unless asked to stage everything.
- Commit only when requested. Use `feat(page-name): description`, `fix(page-name): description`, or an appropriate Conventional Commit type and scope.
- Do not push, amend commits, or rewrite history unless requested.

## Validation and CI

- Use `pnpm lint` to run Oxlint for lint validation.
- For application or tooling changes, run `pnpm format:check`, `pnpm lint`, and `pnpm typecheck`. Run `pnpm build` before declaring changes ready for CI; documentation-only changes need formatting validation only.
- Report any failing or skipped checks accurately. Distinguish existing failures from failures caused by the change; never claim remote CI passed based on local checks.
- Preserve the CI `Checks` and `Build` jobs, read-only permissions, frozen pnpm installation, and checks on pull requests and pushes to `main` and `dev`.
- Do not remove checks, suppress failures, add `continue-on-error`, or weaken branch protections to obtain a green result.
- Keep workflow commands, runtime versions, cache paths, and dependency lockfiles aligned with the actual project structure.
- Do not change repository settings or enable branch protection without a user request. Document required GitHub settings in `CONTRIBUTING.md`.
- Never commit secrets, credentials, generated build output, or `.env` files.

## Component filenames

- Use PascalCase filenames for React component modules outside `src/components/ui` (for example, `LoginForm.tsx` and `AuthShell.tsx`). Component identifiers must also use PascalCase.
- Exception: preserve existing filenames and shadcn CLI naming conventions in `src/components/ui`; do not convert this folder to PascalCase. Keep imports/re-exports aligned with the exact filename casing.
- Keep component directories in their existing format. This rule does not rename hooks, utilities, stylesheets, or Next.js framework files such as `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `not-found.tsx`.
- Update references when renaming a component; do not keep duplicate modules with different casing.

## UI conventions

- Use shadcn UI Mira styling: compact controls, consistent spacing, restrained typography, and existing theme tokens.
- Reuse existing UI primitives and preserve accessible labels, keyboard interaction, and responsive layouts.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
