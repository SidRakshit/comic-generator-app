# Backend Service

## Database Migrations

Run Prisma migrations before starting the server:

```bash
cd apps/backend
npm install
npm run migrate:dev
```

This will apply the latest schema changes (credits, admin roles, audit logs, and Stripe event tracking).

To bootstrap an initial super admin, execute `prisma/seed.sql` with a valid `user_id` from the `users` table.

## Environment Variables

Ensure the following environment variables are configured:

- `DATABASE_URL`
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID`
- `OPENAI_API_KEY`
- `FRONTEND_URL`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL` (optional overrides)
- `ADMIN_SERVICE_TOKEN_HASH` (required for verifying admin service tokens)
- `ADMIN_SERVICE_TOKEN` (plain secret, only needed for the admin Next.js app)
- `ADMIN_SERVICE_USER_ID` (optional server-to-server access)
- `ADMIN_IMPERSONATION_SECRET` (used to sign admin impersonation exchanges)

### Generate a new admin service token

Run the helper script to rotate credentials:

```bash
npm run admin:token
```

This prints a random token and a hash. Store the hash as `ADMIN_SERVICE_TOKEN_HASH` in the backend environment, deploy, and finally update the admin app with the plain token. Never commit the plain token to source control.

### Admin MFA endpoints

The admin API exposes endpoints to manage TOTP-based MFA for console access:

- `POST /api/admin/security/mfa/setup` → returns a secret + otpauth URL for enrollment.
- `POST /api/admin/security/mfa/verify` with `{ code }` → confirms setup and enforces MFA on subsequent requests.
- `DELETE /api/admin/security/mfa` → disables MFA for the authenticated admin.

All verified admin requests must provide an `x-admin-mfa-code` header unless they are authenticated via the service token.

### Monitoring & rate limiting

- Prometheus metrics are exposed at `/metrics` (histograms for request latency plus default process metrics).
- Admin routes are protected by conservative rate limits (`120 req/min` per IP) and impersonation exchanges are limited to `20` attempts per 5 minutes.

## Development

```bash
npm run dev
```

The service exposes REST endpoints under `/api` and webhook handlers under `/api/webhooks`.
