# Fleet authentication context

## Status and scope

This document preserves the project owner's requirements for the remaining FastMet Fleet authentication UI. It is planning context, not a claim that the functionality exists. Do not begin implementation until the owner explicitly requests it. Later explicit instructions may update these requirements.

Apply this context to relevant work throughout the fleet project. Inspect the repository and applicable `AGENTS.md` files before making changes. Do not modify the backend or main admin app, add unrelated dashboard features, or redesign other pages.

At the time these requirements were supplied, the fleet login page already existed at `/login`. Backend company provisioning and authentication were not implemented; another developer was responsible for backend/admin work. Reinspect the current implementation when work is authorized.

## Product and technology constraints

- Reuse Next.js App Router, TypeScript, shadcn UI Mira components, theme tokens, React Hook Form, and Zod.
- Platform admins create companies and their initial owner accounts in the main app and issue an email and temporary password. There is no public registration.
- Authentication requires email/password plus Google Authenticator codes (TOTP).
- Google Authenticator is separate from Google sign-in. Do not add Google, Microsoft, or SSO login buttons.
- Focus on fleet frontend work and prepare typed integration boundaries for the future backend.

## Required flows and routes

First login:

1. Enter the admin-issued email and temporary password at `/login`.
2. Change the temporary password at `/change-password`.
3. Enroll Google Authenticator using a QR code or manual setup key at `/two-factor/setup`.
4. Enter a six-digit code to confirm enrollment.
5. Save recovery codes at `/two-factor/recovery-codes`.
6. Continue to `/operations/overview`.

Returning users:

1. Enter email and password at `/login`.
2. Enter a Google Authenticator code at `/two-factor/verify`, with an option to use a recovery code on that page.
3. Continue to `/operations/overview`.

Use the existing routing conventions for all four new pages.

## Page requirements

### Change password

- Provide new password and confirm password fields with accessible show/hide controls.
- Validate with Zod: at least eight characters and matching confirmation.
- Show concise password requirements, loading states, inline validation, and form-level errors.
- Advance to Authenticator setup after successful submission. Do not allow skipping this step.

### Authenticator setup

- Provide short instructions for enrolling in Google Authenticator.
- Show a QR code and copyable manual setup key. Both must correspond to the same provisioning URI.
- Provide a six-digit verification input supporting paste and leading zeros.
- Mark setup complete only after the API adapter confirms the code.
- Handle loading, invalid codes, expired challenges, and retry states.
- Do not allow skipping enrollment.

### Authenticator verification

- Provide a six-digit code input with validation, paste support, and preservation of leading zeros.
- Handle loading and invalid/expired codes.
- Include a “Use a recovery code” option within this page.
- Advance to the dashboard only after successful adapter verification.
- Model recovery codes as single-use in the eventual backend contract.

### Recovery codes

- Display the codes returned by the adapter after enrollment.
- Provide copy and download controls and explain that each code can be used once.
- Require acknowledgment that the codes have been saved before continuing.
- Do not persist recovery codes in localStorage or include them in URLs.

## Authentication state and API integration

Reuse and extend the existing typed login adapter. Keep UI components separate from authentication state and API adapters.

Define a discriminated union for backend responses, including:

- `PASSWORD_CHANGE_REQUIRED`
- `TWO_FACTOR_SETUP_REQUIRED`
- `TWO_FACTOR_REQUIRED`
- `RECOVERY_CODES_REQUIRED`
- `AUTHENTICATED`

Explicitly model the current step, challenge expiry, and permitted next action. Prepare typed functions for:

- `login`
- `changePassword`
- `getTwoFactorSetup`
- `confirmTwoFactorSetup`
- `verifyTwoFactor`
- `verifyRecoveryCode`
- `acknowledgeRecoveryCodes`
- `getAuthState`
- `logout`

The UI must follow the state returned by the adapter. On refresh, restore the current permitted step through `getAuthState`. Redirect direct navigation to an unavailable step to the correct step. Expired challenges must return users to login with a clear explanation.

Client-side redirects and route guards are navigation behavior, not backend authorization.

## Development mock and sensitive data

- Provide an explicit development-only mock adapter so the complete flow can be reviewed before backend integration.
- Keep production authentication unconnected and fail closed until real APIs exist.
- Document how to enable the mock and exercise first-login, returning-user, invalid-code, recovery-code, and expired-challenge scenarios.
- Use synthetic data only. Clearly identify any mock setup QR code and secret as demo data.
- Never log or persist passwords, TOTP secrets, entered codes, or recovery codes. Do not put authentication secrets in query strings.
- Do not implement real session issuance or claim that frontend checks provide production security.

## Design and accessibility

- Preserve the existing login page's appearance, neutral grid brand panel, logo, and theme switch.
- Reuse a shared auth layout where practical without changing the visual direction.
- Follow Mira styling: compact controls, small radii, restrained typography, and consistent spacing.
- Support mobile layouts and light/dark themes.
- Provide accessible labels, visible keyboard focus, `aria-invalid`, `aria-describedby` for errors, and sensible error focus.
- Reuse existing shadcn components. Install additional components through the shadcn CLI only when needed.

## Future backend contract and responsibilities

When implementation is requested, deliver a short API-contract/mock-usage document. Describe request/response types, authentication transitions, expiry, and error handling needed by the frontend. Future backend fleet code should use dedicated fleet folders and `/api/fleet/...` endpoints.

Document backend responsibilities, including:

- Password hashing and temporary-password enforcement.
- Encrypted TOTP secrets and server-side enrollment/code verification.
- Hashed, single-use recovery codes.
- Rate limits and code replay prevention.
- Company access checks and server-side enforcement of permitted steps and challenge expiry.
- Issuing a full session only after all required steps succeed.

These are backend integration requirements; this frontend scope does not implement them.

## Verification and eventual deliverables

When implementation is authorized:

- Run the checks required by `AGENTS.md`. Use `pnpm lint` to run Oxlint.
- Verify first-login and returning-user flows, refresh restoration, direct-route navigation, challenge expiry, and recovery-code handling.
- Check mobile layouts and both themes.
- Report failures honestly and distinguish existing tooling failures from introduced errors.
- Do not bypass Husky, commit, or push unless explicitly requested.

Deliver working frontend pages and the development mock flow, typed adapters ready for backend integration, a short API-contract/mock-usage document, and a concise summary of files changed, checks run, and remaining backend work.
