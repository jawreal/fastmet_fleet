# Fleet authentication

FastMet Fleet owns credential verification, password changes, Google Authenticator enrollment and verification, recovery codes, sessions, and dashboard authorization. It reads the approved company's email and bcrypt hash directly from the shared `fleetapplications` collection. The FastMet backend provides registration and Fleet business data. The Fleet app uses its own same-origin auth endpoints and never calls the provisional Express auth routes.

## Development setup

Set these server-only values in `.env.local`.

| Variable                    | Purpose                                                                                                                                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FLEET_MONGODB_URI`         | Shared development MongoDB URI with the application database selected. The Fleet server reads application records and can update the password and change flag. It also manages its own authentication collections and their TTL indexes. |
| `FLEET_AUTH_ENCRYPTION_KEY` | Generate 32 random bytes as hex with `openssl rand -hex 32`. Keep the key stable. All app instances must use the same key to read enrolled authenticators.                                                                               |
| `FLEET_AUTH_ORIGIN`         | Canonical Fleet origin, with no trailing slash. Optional locally if Next sees the public origin directly. Set it when deploying behind a proxy.                                                                                          |

Run `pnpm install --frozen-lockfile`. Create a fresh account and start the app on port 4001.

```bash
NODE_ENV=development FLEET_ALLOW_DEV_SEED=1 pnpm seed:fleet-auth
pnpm dev:custom
```

The seed prints a generated email and initial password once. It inserts a synthetic approved application with `mustChangePassword: true` and creates no admin decision, email, or document upload. It requires an explicit development flag and accepts only the FastMet development cluster or loopback MongoDB. Production Fleet authentication excludes these fixtures even if they are copied into another database.

Open `http://localhost:4001/login`. Enter the credentials, replace the initial password, and scan the QR in Google Authenticator. Enter the current code and save and acknowledge the recovery codes. At the next sign-in, use the replacement password and a fresh authenticator code.

Approved records from the previous Express experiment may still store `temporaryPasswordHash`. Follow `fastmet_backend/docs/fleet-registration/README.md` and run the backend credential migration as part of the rollout. Fleet reads the single `password` field after migration.

## HTTP contract

The typed adapter in `src/lib/auth/adapter.ts` uses the endpoints under `/api/fleet/auth`. POST requests require same-origin JSON and all responses use `Cache-Control: no-store`.

| Method and path                    | Input and behavior                                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /login`                      | `{ email, password, keepSignedIn }`. Verifies an approved account and creates a restricted session for the required next step.                             |
| `POST /change-password`            | `{ newPassword, confirmPassword }`. Requires the password-change step. The backend updates the existing hash and clears `mustChangePassword` in one write. |
| `POST /two-factor/setup`           | `{}`. Returns the QR provisioning URI and its manual key for the current enrollment session.                                                               |
| `POST /two-factor/confirm`         | `{ code }`. Verifies TOTP and returns recovery codes for acknowledgment.                                                                                   |
| `POST /two-factor/verify`          | `{ code }`. Verifies and consumes a fresh TOTP time step.                                                                                                  |
| `POST /two-factor/recovery`        | `{ code }`. Consumes a recovery code atomically.                                                                                                           |
| `POST /recovery-codes/acknowledge` | `{}`. Clears the encrypted recovery delivery copy and grants an authenticated session after enrollment.                                                    |
| `POST /account-password`           | `{ currentPassword, newPassword, confirmPassword }`. Requires an authenticated session, replaces the hash, and returns the user to sign-in.                |
| `GET /state`                       | Returns the current step or `SIGNED_OUT` from the cookie and database.                                                                                     |
| `POST /logout`                     | `{}`. Revokes the current session and clears the cookie.                                                                                                   |

Initial passwords do not expire. Pending sessions expire in ten minutes. A full session lasts at most seven days with the checkbox selected. Otherwise the browser-session cookie has an eight-hour server maximum and a 30-minute idle timeout. Session tokens rotate across authentication steps, and changing the password invalidates sessions bound to the previous hash. Confirmation values are validated in memory.

The DAL verifies session expiry, approved status, the current credential version, password replacement, and the enrolled authenticator before exposing dashboard data. Both the shared dashboard layout and individual pages call the guard. New private route handlers and server actions must also authenticate at their data boundary. Use `requireStep("AUTHENTICATED")` for mutations in the Fleet auth flow.

The database stores hashed session tokens, AES-GCM encrypted authenticator secrets, and hashed recovery codes. An encrypted delivery copy of recovery codes exists until acknowledgment so the enrollment can be resumed. MongoDB atomically records the last accepted TOTP time step to prevent replay across sessions. Requests are throttled using MongoDB counters.

## Checks

Run `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm build`, and `pnpm test:fleet-auth`. The auth test starts Next and an isolated MongoDB instance. It exercises direct-page guards, wrong-step requests, first-login replacement, TOTP enrollment and replay, recovery acknowledgment and single use, and logout. Stop other Fleet development servers from the same checkout before running the test.
