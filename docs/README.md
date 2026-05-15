# PNGOSWA Documentation

This folder explains how the PNGOSWA application is built, how the major features work, and how the current security layer protects sensitive membership data.

## Documentation Map

- [architecture.md](./architecture.md)
  Explains the overall system design, project structure, database models, and the main runtime building blocks.

- [features.md](./features.md)
  Lists the public, member, and admin features available in the application today.

- [security.md](./security.md)
  Documents the security model, rate limiting, auth flow, file protection, headers, and the key files involved such as `/lib/security`.

- [workflows.md](./workflows.md)
  Walks through the actual request and user flows for membership applications, magic-link login, document updates, and admin review.

- [deployment.md](./deployment.md)
  Covers local development, Docker, Prisma migrations, environment variables, and admin account syncing.

## Best Reading Order

If you are new to the project, start with:

1. [architecture.md](./architecture.md)
2. [features.md](./features.md)
3. [workflows.md](./workflows.md)
4. [security.md](./security.md)
5. [deployment.md](./deployment.md)

## Quick Summary

PNGOSWA is a Next.js App Router application for:

- presenting the public PNGOSWA website
- collecting membership applications and supporting documents
- sending member and admin magic-link access emails
- allowing members to view status and upload missing documents
- allowing admins to review, approve, reject, and follow up on applications

The application uses:

- `Next.js 16` with the `app/` directory
- `React 19`
- `Prisma` with PostgreSQL
- `Resend` for email delivery
- `UploadThing` plus local storage support for file handling
- a database-backed security throttle layer in `/lib/security.ts`
