# Fleet authentication

FastMet Fleet owns credential verification, password changes, Google Authenticator enrollment and verification, recovery codes, sessions, and dashboard authorization. It reads the company's email, password hash, account link, and current application status from the shared `fleetapplications` collection. The FastMet backend provides registration and Fleet business data. The Fleet app uses its own same-origin auth endpoints and never calls the provisional Express auth routes.

## Development setup

Set these server-only values in `.env.local`.

| Variable                    | Purpose                                                                                                                                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FLEET_BACKEND_URL`         | Backend origin for authenticated requirements reads and uploads. Use HTTPS in production.                                                                                                                                                |
| `FLEET_MONGODB_URI`         | Shared development MongoDB URI with the application database selected. The Fleet server reads application records and can update the password and change flag. It also manages its own authentication collections and their TTL indexes. |
| `FLEET_AUTH_ENCRYPTION_KEY` | Generate 32 random bytes as hex with `openssl rand -hex 32`. Keep the key stable. All app instances must use the same key to read enrolled authenticators.                                                                               |
| `FLEET_AUTH_ORIGIN`         | Canonical Fleet origin, with no trailing slash. Optional locally if Next sees the public origin directly. Set it when deploying behind a proxy.                                                                                          |

### Redis rate limits

Set `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD` in Fleet's environment using the same connection values as the backend. If the Redis endpoint uses TLS, set `REDIS_TLS=true`. Fleet connects to Redis directly and uses keys under `fastmet:fleet:auth:rate-limit:` with a separate suffix for each runtime environment. A shared Redis instance should use `noeviction` so counters survive until their time window expires.

Fleet uses fixed-window counters for sign-in, password changes, and authenticator or recovery codes. Redis updates the counters atomically. If Redis is unavailable, Fleet returns `503` for protected attempts. Existing MongoDB counters expire under their original TTL index while new counters start in Redis.

### Turnstile configuration

Create a **Managed** widget in the Cloudflare Turnstile dashboard with the **Rest of World** region and allow Fleet's actual sign-in hostname. Copy its **site key** into `NEXT_PUBLIC_FLEET_TURNSTILE_SITE_KEY` before building Fleet. Set its **secret key** in the server environment as `FLEET_TURNSTILE_SECRET_KEY`. Set `FLEET_TURNSTILE_HOSTNAME` to the exact sign-in hostname, without a scheme, port, or path. Fleet supplies the `fleet_login` action and `interaction-only` appearance when it renders the widget. If the deployment sets a Content Security Policy, allow `https://challenges.cloudflare.com` in `script-src` and `frame-src`.

For local development, copy `.env.example` to `.env.local` and fill in the authentication settings above. These public Cloudflare dummy keys exercise the success flow at `http://localhost:4001`.

```dotenv
NEXT_PUBLIC_FLEET_TURNSTILE_SITE_KEY=1x00000000000000000000AA
FLEET_TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
FLEET_TURNSTILE_HOSTNAME=localhost
```

Use `3x00000000000000000000FF` as the site key to test an interactive challenge. Swap in the secret key `2x0000000000000000000000000000000AA` to test failed server verification, or `3x0000000000000000000000000000000AA` to test a spent token. Fleet accepts dummy secrets only in development with a loopback hostname. Cloudflare dummy success responses use `example.com`, omit the action, and reuse a fixed test token. Use a real Managed widget on a test hostname to exercise live hostname, action, and replay enforcement. See [Cloudflare’s Turnstile testing guide](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).

### Start Fleet locally

Run `pnpm install --frozen-lockfile`. Create a fresh account and start the app on port 4001.

```bash
NODE_ENV=development FLEET_ALLOW_DEV_SEED=1 pnpm seed:fleet-auth
pnpm dev:custom
```

The seed prints a generated email and initial password once. It inserts a synthetic approved application with `mustChangePassword: true` and creates no admin decision, email, or document upload. It requires an explicit development flag and accepts only the FastMet development cluster or loopback MongoDB. Production Fleet authentication excludes these fixtures even if they are copied into another database.

Open `http://localhost:4001/login`. Enter the credentials, replace the initial password, and scan the QR in Google Authenticator. Enter the current code and save and acknowledge the recovery codes. At the next sign-in, use the replacement password and a fresh authenticator code.

Approved records from the previous Express experiment may still store `temporaryPasswordHash`. Follow `fastmet_backend/docs/fleet-registration/fleet-applications.md` and run the backend credential migration as part of the rollout. Fleet reads the single `password` field after migration.

## HTTP contract

The typed adapter in `src/lib/auth/adapter.ts` uses the endpoints under `/api/fleet/auth`. POST requests require same-origin JSON and all responses use `Cache-Control: no-store`.

| Method and path                    | Input and behavior                                                                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /login`                      | `{ email, password, keepSignedIn, turnstileToken }`. Rate limits the attempt, verifies the Turnstile challenge and credentials, then creates a restricted session. |
| `POST /change-password`            | `{ newPassword, confirmPassword }`. Requires the password-change step. The backend updates the existing hash and clears `mustChangePassword` in one write.         |
| `POST /two-factor/setup`           | `{}`. Returns the QR provisioning URI and its manual key for the current enrollment session.                                                                       |
| `POST /two-factor/confirm`         | `{ code }`. Verifies TOTP and returns recovery codes for acknowledgment.                                                                                           |
| `POST /two-factor/verify`          | `{ code }`. Verifies and consumes a fresh TOTP time step.                                                                                                          |
| `POST /two-factor/recovery`        | `{ code }`. Consumes a recovery code atomically.                                                                                                                   |
| `POST /recovery-codes/acknowledge` | `{}`. Clears the encrypted recovery delivery copy and grants an authenticated session after enrollment.                                                            |
| `POST /account-password`           | `{ currentPassword, newPassword, confirmPassword }`. Requires an authenticated session, replaces the hash, and returns the user to sign-in.                        |
| `GET /state`                       | Returns the current step or `SIGNED_OUT` from the cookie and database.                                                                                             |
| `POST /logout`                     | `{}`. Revokes the current session and clears the cookie.                                                                                                           |

Initial passwords do not expire. Pending sessions expire in ten minutes. A full session lasts at most seven days with the checkbox selected. Otherwise the browser-session cookie has an eight-hour server maximum and a 30-minute idle timeout. Session tokens rotate across authentication steps, and changing the password invalidates sessions bound to the previous hash. Confirmation values are validated in memory.

Fleet applies the same strength policy to initial password replacement and changes in Settings. New passwords are 15–128 Unicode characters. The policy rejects common and predictable choices, including passwords that rely on company or account details. Authentication still verifies existing bcrypt credentials. Newly saved passwords use salted scrypt (`scrypt-v1`), with NFC Unicode normalization and full-length verification. Fleet currently directs password-reset requests to the company administrator. Future reset flows in Fleet should enforce the same policy before writing the new hash.

The DAL checks session expiry, the current credential version, password replacement, and the enrolled authenticator before selecting a destination. Approved accounts reach `/operations/overview`. Linked accounts in `needs_update` or `under_review` reach `/application/requirements`. A correction request is required to submit new files. Rejection invalidates authorization immediately on the next request.

Dashboard pages and the layout use `requireDashboardAccess` through `requireFleetCompany`. Guard new private data reads, route handlers, and server actions at their data boundary. The Fleet requirements server forwards the opaque session bearer to the configured backend over HTTPS in production, and the backend validates the session and derives application ownership. Deploy Fleet with an ingress that accepts roughly 51 MiB per resubmission request so all five 10 MiB documents can be replaced in a single batch.

The database stores hashed session tokens, AES-GCM encrypted authenticator secrets, and hashed recovery codes. An encrypted delivery copy of recovery codes exists until acknowledgment so the enrollment can be resumed. MongoDB atomically records the last accepted TOTP time step to prevent replay across sessions. Requests are throttled using Redis counters.

Fleet checks Turnstile with Siteverify after applying the existing sign-in rate limits. The server validates the response, hostname, action, and token age. An expiring MongoDB record stores a digest of each verified token so simultaneous sign-in requests can consume it only once.

## Checks

Run `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm build`, and `pnpm test:fleet-auth`. The auth test starts Next, an isolated MongoDB instance, and an isolated Redis server. It requires `redis-server` on your PATH. It exercises rate-limit expiry, Turnstile and replay protection, password strength, TOTP enrollment, recovery codes, and logout. Run the test from a separate checkout if the Fleet development server is active.
