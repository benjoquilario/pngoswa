# Deployment

## Runtime Model

PNGOSWA is designed to run as a Dockerized Next.js application with Prisma and PostgreSQL.

Important files:

- `Dockerfile`
- `docker/start.sh`
- `prisma/schema.prisma`
- `prisma.config.ts`

## Environment Variables

Recommended environment variables:

```env
DATABASE_URL=""
NEXT_PUBLIC_SITE_URL="https://www.pngoswa.org"
RUN_DB_MIGRATIONS="true"
RESEND_API_KEY=""
RESEND_FROM_EMAIL="PNGOSWA <info@pngoswa.org>"
RESEND_REPLY_TO_EMAIL="info@pngoswa.org"
UPLOADTHING_TOKEN=""
RATE_LIMIT_SECRET=""
ADMIN_EMAILS=""
```

## What Each Variable Does

- `DATABASE_URL`
  Database connection string. Required at runtime.

- `NEXT_PUBLIC_SITE_URL`
  Canonical site URL used for metadata, SEO, and email links.

- `RUN_DB_MIGRATIONS`
  Controls whether `prisma migrate deploy` runs on container startup.

- `RESEND_API_KEY`
  Enables transactional email delivery.

- `RESEND_FROM_EMAIL`
  Must use an address on the verified sending domain in Resend.

- `RESEND_REPLY_TO_EMAIL`
  Reply-to mailbox for outbound email.

- `UPLOADTHING_TOKEN`
  Enables UploadThing uploads.

- `RATE_LIMIT_SECRET`
  Salt used by the throttling system to hash identifiers more safely.

- `ADMIN_EMAILS`
  Comma-, space-, or semicolon-separated list of admin emails for the admin sync script.

## Local Development

Typical commands:

```bash
pnpm install
pnpm db:generate
pnpm dev
```

If you need migrations in local development:

```bash
pnpm db:migrate:dev -- --name your_migration_name
```

## Docker Build Process

The Dockerfile uses a multi-stage build:

1. `dependencies`
   Installs dependencies with the lockfile

2. `builder`
   Copies source code, runs `prisma generate`, and runs `next build`

3. `runner`
   Copies the standalone app, public assets, Prisma schema, and runtime dependencies into a smaller production image

Important runtime detail:

- the final container runs as the non-root `node` user

## Startup Flow

The entrypoint is `docker/start.sh`.

Behavior:

1. if `RUN_DB_MIGRATIONS=true`, the script runs `prisma migrate deploy`
2. if migrations succeed, it starts the standalone server with `node server.js`

This is a good fit for a single-app deployment on Dokploy.

## Prisma Notes

The Prisma client is generated into:

- `lib/generated/prisma`

The app uses a lazy Prisma client in `lib/db.ts` so the build can import route modules without requiring a live database connection during image build.

## Managed Prisma Postgres Support

The app supports managed Prisma Postgres URLs.

In `lib/db.ts`, if `DATABASE_URL` starts with `prisma+postgres://`, the app decodes the embedded runtime database URL from the `api_key` payload so Prisma can connect with the PostgreSQL adapter at runtime.

## Resend Configuration Notes

For production email sending:

- verify your domain in Resend
- use that exact verified domain in `RESEND_FROM_EMAIL`
- do not use Gmail or another public mailbox as the sender domain

Example:

```env
RESEND_FROM_EMAIL="PNGOSWA <info@pngoswa.org>"
```

## UploadThing Notes

The current app expects UploadThing to handle upload transport while PNGOSWA stores document metadata in the database.

Important files:

- `app/api/uploadthing/core.ts`
- `app/api/uploadthing/route.ts`
- `lib/uploadthing.ts`

## Admin Sync

To create or promote admins from `ADMIN_EMAILS`, run:

```bash
pnpm admins:sync
```

This script:

- creates missing users as admins
- promotes existing users to the `ADMIN` role when needed

## Recommended Production Checklist

1. Set `NEXT_PUBLIC_SITE_URL=https://www.pngoswa.org`
2. Set `DATABASE_URL`
3. Set `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL` to the verified Resend domain
5. Set `UPLOADTHING_TOKEN`
6. Set `RATE_LIMIT_SECRET`
7. Set `ADMIN_EMAILS`
8. Deploy the image
9. Confirm migrations ran successfully
10. Test member login, admin login, document download, and application submission
