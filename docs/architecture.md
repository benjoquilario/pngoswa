# Architecture

## Overview

PNGOSWA is a full-stack Next.js application built around one core business process: collecting membership applications, reviewing them securely, and keeping both members and admins updated through portal pages and email.

At a high level, the system has four layers:

1. Public website pages in `app/` and `components/`
2. Business logic in `lib/`
3. Persistent data in PostgreSQL through Prisma
4. Operational services such as Resend, UploadThing, and Docker

## Tech Stack

- Framework: `Next.js 16.2.3`
- UI: `React 19`
- Styling: global CSS in `app/globals.css`
- Database ORM: `Prisma 7`
- Database: PostgreSQL via Prisma Postgres or another Postgres-compatible connection
- Email delivery: `Resend`
- File uploads: `UploadThing`
- Deployment target: Docker-ready, suitable for Dokploy or similar VPS platforms

## Application Areas

### Public Site

The public site is rendered from the `app/` directory and reusable sections in `components/home` and `components/membership`.

Important pages:

- `/` in `app/page.tsx`
- `/about` in `app/about/page.tsx`
- `/ethics` in `app/ethics/page.tsx`
- `/membership` in `app/membership/page.tsx`
- `/membership/apply` in `app/membership/apply/page.tsx`

### Member Portal

The member portal allows a member to:

- sign in with a magic link
- view membership status
- view review history and communication logs
- re-upload missing or replacement documents

Important files:

- `app/member/login/page.tsx`
- `app/member/profile/page.tsx`
- `app/member/actions.ts`
- `components/portal/member-document-update-form.tsx`

### Admin Portal

The admin portal allows an authorized PNGOSWA reviewer to:

- sign in with a magic link
- search and filter applications
- review documents
- approve, reject, or request follow-up
- send review emails to applicants

Important files:

- `app/admin/login/page.tsx`
- `app/admin/dashboard/page.tsx`
- `app/admin/dashboard/applications/[id]/page.tsx`
- `app/admin/actions.ts`

## Core Library Files

### `/lib/db.ts`

This is the Prisma bootstrap layer.

Responsibilities:

- creates the Prisma client lazily
- decodes `prisma+postgres://` connection strings when needed
- prevents `next build` from failing just because runtime DB credentials are absent
- normalizes some connection options for faster failure in development

### `/lib/auth.ts`

This file owns the authentication model.

Responsibilities:

- resolves admin and member identities
- generates and consumes magic-link tokens
- creates portal sessions
- sets secure cookies
- protects private routes through `requirePortalSession()`

Key idea:

The application does not use passwords. It uses email-based magic links with hashed tokens stored in the database.

### `/lib/membership.ts`

This is the largest business-logic file in the project.

Responsibilities:

- validates membership application input
- processes legacy and UploadThing-based uploads
- prevents duplicate submissions
- creates membership applications and documents
- computes membership counters
- formats status and membership labels
- updates member documents from the profile page

### `/lib/security.ts`

This file is the current request-hardening layer.

Responsibilities:

- extracts client IP addresses from trusted headers
- validates request origins
- enforces database-backed rate limits
- centralizes reusable rate-limit presets

This file is especially important because it protects the public endpoints that are most likely to be abused.

### `/lib/email.ts`

This file builds and sends PNGOSWA emails.

Responsibilities:

- creates admin/member magic-link email templates
- creates membership review emails
- validates the Resend sender domain
- sends emails through Resend
- creates short preview text for communication logs

### `/lib/storage.ts`

This file handles local file persistence for non-UploadThing files.

Responsibilities:

- writes uploaded files into `storage/memberships`
- sanitizes file paths
- safely reads stored files
- removes application-specific storage when cleanup is required

### `/lib/site-url.ts`

This file defines the canonical site origin used across metadata and email links.

Important production behavior:

- if the configured URL is invalid or points to an internal host such as `0.0.0.0` or `localhost`, production falls back to `https://www.pngoswa.org`

## Database Model

The Prisma schema is in `prisma/schema.prisma`.

Main tables and their roles:

- `User`
  Stores both admins and members

- `MembershipApplication`
  Stores the main form submission and status lifecycle

- `MembershipDocument`
  Stores uploaded document metadata linked to an application

- `MembershipReviewAction`
  Stores admin review timeline entries such as submitted, approved, rejected, and follow-up actions

- `MagicLinkToken`
  Stores hashed one-time sign-in tokens with expiry and usage state

- `AuthSession`
  Stores authenticated session records for admin and member portals

- `CommunicationLog`
  Stores a history of outbound communication attempts and email delivery outcomes

- `SecurityThrottle`
  Stores the counters used by the app-level rate-limiting system

## Request Flow Under The Hood

Most business requests follow this pattern:

1. A page, form, server action, or route handler receives input
2. Origin checks and rate limits run first for sensitive paths
3. Business logic in `lib/` validates the request
4. Prisma writes to or reads from the database
5. Optional side effects run, such as sending an email or storing a file
6. The response returns UI-friendly JSON or redirects to the correct page

Examples:

- membership apply: `app/api/memberships/apply/route.ts` -> `lib/membership.ts`
- member login: `app/member/actions.ts` -> `lib/auth.ts`
- admin review: `app/admin/actions.ts` -> Prisma + `lib/email.ts`
- document download: `app/api/documents/[documentId]/route.ts` -> auth check -> file read/stream

## Folder Guide

### `app/`

Owns routes, pages, route handlers, metadata, and server actions.

### `components/`

Owns presentational UI, grouped by feature area:

- `components/home`
- `components/membership`
- `components/portal`
- `components/seo`
- `components/ui`

### `lib/`

Owns business logic and infrastructure helpers.

### `prisma/`

Owns the schema and migrations.

### `public/`

Owns static assets such as officers, gallery images, and favicon images.

### `docker/`

Owns runtime container scripts such as `docker/start.sh`.

### `scripts/`

Owns one-off operational scripts such as `scripts/sync-admins.ts`.
