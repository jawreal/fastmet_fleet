# Fleet authentication requirements

The [Fleet authentication guide](authentication-api.md) documents the implementation and how to test it.

## Ownership

- FastMet Fleet is a Next.js App Router application. It owns authentication, the DAL, password management, TOTP enrollment, recovery codes, and sessions.
- FastMet Web collects public company applications. FastMet Backend owns application intake and review and serves Fleet business-data APIs. The shared approved application record supplies the company email and password hash.
- Administrator provisioning decisions and credential delivery are separate workflows.

## Account onboarding

- A company signs in using its registered email and initial password. The initial password stays valid until replaced.
- When `mustChangePassword` is set, the backend only permits password replacement. The new password overwrites the existing hash and clears that flag.
- The company enrolls Google Authenticator, confirms a current six-digit code and acknowledges its recovery codes. On later sign-ins, the company uses a fresh authenticator or unused recovery code after password verification.
- Full access requires a verified session issued after all applicable steps. Route redirects are part of navigation, and the DAL and each mutation enforce authorization.
- Keep the existing sign-in and setup pages, theme, component conventions, accessible inputs, QR and manual setup key. Do not add social sign-in or a real-2FA bypass.

## Session behavior

- Keep the seven-day option through onboarding and start that duration at successful authentication. Without the option, use a browser-session cookie and enforce maximum lifetime and idle expiry on the server.
- After logout or session expiry, require password and authenticator verification again. Authenticator enrollment persists across sign-ins.
- Keep plaintext credentials and authenticator material out of logs, URLs, and browser storage. Generate Google Authenticator codes from the setup key locally.
- Test with the guarded development seed and real auth endpoints. Production rejects the development accounts.
