# Fleet authentication: frontend integration and demo

The fleet authentication UI is implemented behind a typed adapter. No backend or admin implementation is included. Production authentication deliberately fails closed with an unconnected-service message, even if the mock flag is set. Frontend navigation checks are not authorization; existing fleet dashboard pages still need backend access protection before production use.

## Routes and development preview

From `fastmet_fleet`, use Node.js 24 and the project's declared pnpm version:

```bash
NEXT_PUBLIC_FLEET_AUTH_MOCK=true pnpm dev
```

Alternatively set `NEXT_PUBLIC_FLEET_AUTH_MOCK=true` in your local, untracked `.env.local`, then restart the development server. Do not commit environment files. The flag works only with `NODE_ENV=development`. Without it, the pages redirect to `/login` and sign-in stays unconnected. Start review at `/login`; later routes are available only after the adapter permits them.

| Route                        | Purpose                                                    |
| ---------------------------- | ---------------------------------------------------------- |
| `/login`                     | Admin-issued email/password sign-in                        |
| `/change-password`           | Replace the temporary password                             |
| `/two-factor/setup`          | Scan the QR or copy the key, then confirm enrollment       |
| `/two-factor/verify`         | Returning-user authenticator or recovery-code verification |
| `/two-factor/recovery-codes` | Save and acknowledge recovery codes                        |
| `/operations/overview`       | Existing destination after the flow completes              |

The localhost port is printed by Next.js (normally 3000). Keep demo inputs synthetic. Any password of at least eight characters is accepted by the mock; it is never retained or compared to a real account password. “Keep me signed in for 7 days” preserves synthetic authenticated metadata across browser restarts for a fixed seven days after MFA completes. Unchecked sessions use sessionStorage with an eight-hour maximum for preview only. Neither option bypasses password or MFA on a new sign-in.

## Review scenarios

- **First login:** use `first@demo.example` and a synthetic password of at least eight characters. Set a matching new password, confirm setup with `012345`, save the displayed recovery codes, and check the acknowledgment before continuing.
- **Returning user:** use `returning@demo.example`, a synthetic password, and `012345` to continue to overview.
- **Invalid code:** enter `111111`. The error is inline, the challenge stays on its current step, and you can retry.
- **Expired code:** enter `000000`. Wait for the next code message is shown; retry with `012345`. This differs from expiry of the whole sign-in challenge.
- **Recovery:** on returning-user verification choose “Use a recovery code”. Use one of the saved demo codes, for example `DEMO-4821-7306`. It succeeds once; repeating it in the same tab after starting a new returning-user attempt fails. The mock tracks consumed fixture indices, not code values.
- **Expired challenge:** use `expiry@demo.example`. Wait 15 seconds on any pending step. The page returns to login with an expiry explanation. Normal demo challenges last 15 minutes and step transitions do not extend them.
- **Refresh and direct routes:** refresh at each pending step. It should restore the permitted step. Navigate directly to another authentication route; it should redirect to the permitted route. Fresh tabs without demo progress return to login.
- **Reset:** clear this site's sessionStorage and localStorage or start a fresh isolated browser context. This resets the synthetic flow and consumed fixture indices. This is a development preview mechanism, not a session.
- **Visuals:** review at a narrow mobile width and desktop width, toggle the theme, and tab through the controls. Try a mismatched password and submit incomplete codes to check error labels and focus.

The QR and manual key are explicitly public **demo fixtures**, generated from one provisioning URI. A scanned Google Authenticator app generates time-dependent codes, but the mock intentionally accepts the fixed code `012345` instead. It does not implement TOTP verification or issue a session.

Only synthetic step/expiry metadata, the sign-in preference, and consumed fixture indices are stored in sessionStorage to allow refresh. After successful authentication with the seven-day option, that synthetic snapshot moves to localStorage; logout or expiry removes it. These values are not real session credentials and provide no access protection. Passwords, TOTP secrets, entered codes, and recovery codes are never logged or written to browser storage or URLs. Setup data and recovery-code response values are held in component memory. On refresh the demo adapter reconstructs its public fixtures; the real backend must securely retrieve pending enrollment material. Copy/download are explicit user actions to save the codes; nothing is downloaded automatically.

## Typed integration boundary

`src/lib/auth/types.ts` defines `AuthAdapter`, `AuthState`, setup material, error codes, and fixed route mapping. `src/lib/auth/adapter.ts` selects the explicit development adapter or the disconnected production adapter. `src/lib/auth/login.ts` preserves and extends the original typed login entry point. UI state/route restoration lives in `src/components/auth/AuthStep.tsx`; individual forms call adapter functions and follow the returned state rather than predicting success.

Pending states include `expiresAt` (Unix epoch milliseconds) and a permitted `nextAction`. States are `SIGNED_OUT`, `PASSWORD_CHANGE_REQUIRED`, `TWO_FACTOR_SETUP_REQUIRED`, `TWO_FACTOR_REQUIRED`, `RECOVERY_CODES_REQUIRED`, and `AUTHENTICATED`. Authenticated state includes `expiresAt` and `sessionMode: "browser" | "seven_days"`; an expired session restores `SIGNED_OUT` with `reason: SESSION_EXPIRED`. Returning-user verification permits the alternative `verifyRecoveryCode` action in the same challenge. Setup material is returned only for the setup step; recovery codes are returned only while acknowledgment is pending. Expired challenges restore `SIGNED_OUT` with `reason: CHALLENGE_EXPIRED`.

## Proposed HTTP contract (not implemented)

Future backend fleet handlers should live in dedicated fleet folders and use `/api/fleet/...`. Connect a real implementation of `AuthAdapter` once the backend is ready; remove no fail-closed checks until real endpoints are available. Use same-origin credentialed requests, server-managed secure HttpOnly cookies for pending challenges and full sessions, and CSRF protection on mutations. Never use URL parameters or localStorage for secrets or session credentials.

| Adapter function           | Proposed endpoint                                 | Request / response                                                              |
| -------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------- |
| `login`                    | `POST /api/fleet/auth/login`                      | `{ email, password, keepSignedIn }` → `AuthState`                               |
| `changePassword`           | `POST /api/fleet/auth/change-password`            | `{ newPassword, confirmPassword }` → `AuthState`                                |
| `getTwoFactorSetup`        | `POST /api/fleet/auth/two-factor/setup`           | No body → `{ state, manualKey, provisioningUri, demo: false }`                  |
| `confirmTwoFactorSetup`    | `POST /api/fleet/auth/two-factor/setup/confirm`   | `{ code }` → `RECOVERY_CODES_REQUIRED` state with codes                         |
| `verifyTwoFactor`          | `POST /api/fleet/auth/two-factor/verify`          | `{ code }` → `AUTHENTICATED`                                                    |
| `verifyRecoveryCode`       | `POST /api/fleet/auth/two-factor/recovery`        | `{ code }` → `AUTHENTICATED`, consuming the code atomically                     |
| `acknowledgeRecoveryCodes` | `POST /api/fleet/auth/recovery-codes/acknowledge` | No body → `AUTHENTICATED`                                                       |
| `getAuthState`             | `GET /api/fleet/auth/state`                       | No body → current permitted `AuthState`, including pending codes only if needed |
| `logout`                   | `POST /api/fleet/auth/logout`                     | No body → `SIGNED_OUT`, revoking pending/full credentials                       |

Successful responses should match the discriminated union. Validate response bodies at the real adapter boundary. Translate structured failures such as `{ error: { code, message } }` into `AuthError`, with safe user-facing messages. Suggested statuses: 400 for malformed requests, 401 for invalid credentials/codes, 409 for unavailable steps or code replay, 410 for expired challenges, and 429 for rate limits. Distinguish `CODE_EXPIRED` (retry this step) from `CHALLENGE_EXPIRED` (restart login). Network/server failures must never advance the step.

## Backend responsibilities before production

- Provision companies and owner accounts in the main admin app; enforce temporary-password replacement and securely hash passwords server-side.
- Bind short-lived pending challenges to the user and company. Enforce every transition, deadline, company status/access check, and step on the server; never trust client storage or routing.
- Generate per-user TOTP secrets securely; encrypt them at rest. Generate matching QR provisioning URIs/manual keys, confirm enrollment with a valid code, and prevent replay across permitted time windows.
- Generate cryptographically random recovery codes; store hashes for future verification and consume them atomically once. For refresh before acknowledgment, define a short-lived encrypted pending delivery mechanism, then remove recoverable plaintext after acknowledgment/expiry. Do not store permanent plaintext recovery codes.
- Rate-limit credential and code attempts, enforce challenge attempt limits and revocation, and avoid credential/account enumeration in errors. Redact all secrets and entered values from logs, analytics, and error reporting.
- Send sensitive responses with `Cache-Control: no-store`. Do not expose challenge/setup/code payloads through URLs, shared caches, or telemetry.
- Issue a full session only when every required step succeeds, including initial recovery-code acknowledgment; use secure cookie/session policies and implement logout/revocation.
- Protect every fleet API and fleet company resource server-side. Existing dashboard UI routes and client guards alone provide no production access control.

## Seven-day sessions and deployment configuration

Google Authenticator requires no Google Cloud project, OAuth client, API key, or paid Google service. Users install the app and scan their unique provisioning QR once. Production issuer/account labels should identify `FastMet Fleet` and the user email. A fresh QR is only needed for enrollment or an authorized authenticator reset, not when a session expires.

The backend must bind `keepSignedIn` to the pending sign-in challenge and preserve it through password change, enrollment, recovery acknowledgment, or returning-user MFA. Issue a session only after all required steps succeed. For checked sessions, use a persistent Secure, HttpOnly cookie and a server-side absolute expiry of 604800 seconds from authentication completion; refresh must not extend that deadline. For unchecked sessions, omit cookie Max-Age/Expires and enforce a server-side maximum (proposed: eight hours) and an agreed idle timeout. Browser session restoration can retain session cookies, so browser closure alone is not an expiry guarantee.

An active session permits continued access without another code. After expiry or explicit logout, require password and an authenticator/recovery code again. This is not a separate trusted-device feature that skips MFA on future password logins. Revoke sessions after password reset, authenticator reset, account disablement, or company access revocation.

Deployment needs a backend-only TOTP encryption key, session signing/credential secrets and revocable session storage, HTTPS cookie settings, API routing/credentialed origin configuration, database fields for enrollment/challenges/recovery hashes/sessions, and synchronized server time. Never expose secrets through NEXT_PUBLIC variables. Keep the existing mock disabled in production. The backend and main admin implementation remain separate work; the current frontend does not issue secure cookies or enforce dashboard authorization.

Preview checks: complete first-login or returning-user MFA with the checkbox selected, then reopen `/login` in another tab to restore the synthetic authenticated state. Without the checkbox, a fresh isolated tab starts signed out (some browsers duplicate sessionStorage when duplicating tabs). To simulate expiry without waiting, change only the synthetic snapshot's `expiresAt` to a past timestamp in browser developer tools and revisit `/login`; the session-expired message should appear. Logout clears both preview stores. Never place real secrets or credentials in these stores.
