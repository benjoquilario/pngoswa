# Security

## Security Goal

PNGOSWA handles sensitive personal and professional membership data. The goal of the current security model is to reduce abuse, prevent unauthorized access, and keep private files and portal routes from being exposed through the public website.

This document explains what is already implemented and where the most security-critical code lives.

## Main Security Files

### `/lib/security.ts`

This is the main protection layer for request abuse.

It currently does four important jobs:

1. extracts the client IP from trusted headers
2. validates whether the incoming request origin is allowed
3. enforces database-backed rate limits
4. provides reusable limit presets for the rest of the app

### `/lib/auth.ts`

This file owns the sign-in model and session behavior.

It protects the app by:

- hashing magic-link tokens before database storage
- expiring tokens after a short lifetime
- storing session tokens as hashed values
- issuing `httpOnly` cookies
- using `secure` cookies in production
- using `sameSite: "strict"`
- reducing account enumeration with generic login success messages

### `/app/auth/verify/route.ts`

This route consumes magic-link tokens.

It protects the app by:

- rate limiting verification attempts
- validating token format before lookup
- rejecting invalid or expired tokens
- setting a session cookie only after a valid match

### `/app/api/documents/[documentId]/route.ts`

This route protects private uploaded files.

It protects the app by:

- requiring an authenticated admin or member session
- ensuring a member can only access their own application documents
- rate limiting repeated downloads
- serving files through the app instead of redirecting users straight to a remote file URL
- adding private and noindex response headers

### `/next.config.ts`

This file adds global browser security headers.

Implemented headers:

- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `Strict-Transport-Security`

## Current Rate Limits

The application stores throttle counters in the `SecurityThrottle` table.

Current presets in `/lib/security.ts`:

- membership apply by IP: `8` requests per `15` minutes, block `30` minutes
- membership apply by email: `3` requests per `24` hours, block `24` hours
- member magic-link by IP: `5` requests per `15` minutes, block `60` minutes
- member magic-link by email: `4` requests per `30` minutes, block `60` minutes
- admin magic-link by IP: `3` requests per `15` minutes, block `2` hours
- admin magic-link by email: `3` requests per `60` minutes, block `2` hours
- uploads by IP: `25` requests per `15` minutes, block `60` minutes
- auth verification by IP: `20` requests per `15` minutes, block `60` minutes
- member document updates by user and IP: `20` requests per `15` minutes, block `60` minutes
- document downloads by authenticated actor and IP: `120` requests per `15` minutes, block `30` minutes

## Where The Protections Are Applied

### Membership Apply

File: `app/api/memberships/apply/route.ts`

Protections:

- origin validation
- IP and email rate limiting
- duplicate submission blocking
- noindex API response headers

### Member Magic-Link Request

File: `app/member/actions.ts`

Protections:

- server action origin validation
- member login rate limiting by IP and email
- generic success response to reduce user enumeration

### Admin Magic-Link Request

File: `app/admin/actions.ts`

Protections:

- server action origin validation
- admin login rate limiting by IP and email
- generic success response to reduce admin enumeration

### UploadThing Route

File: `app/api/uploadthing/route.ts`

Protections:

- origin validation
- upload rate limiting
- noindex headers

### Member Document Updates

File: `app/api/member/application-documents/route.ts`

Protections:

- member session required
- origin validation
- rate limiting per member and IP
- noindex headers

## Sensitive Data Protection

The most sensitive data in this app includes:

- membership identity information
- contact details
- organization and employment details
- uploaded documents such as resumes, endorsements, payment proof, and ID photos
- communication history

The app currently protects this data by:

- keeping private portal pages separate from public pages
- marking private routes as `noindex`
- avoiding public direct links for document access
- requiring session checks before document access
- keeping auth tokens hashed in the database

## Email Security Notes

File: `/lib/email.ts`

Important protections:

- blocks use of public sender domains like Gmail for `RESEND_FROM_EMAIL`
- requires the sender to use a verified Resend domain in production
- logs provider failure information for troubleshooting

This matters because using a Gmail sender with Resend can cause `403` delivery errors and breaks trust in the sign-in flow.

## Session and Auth Notes

Admin and member sessions are intentionally shorter now:

- admin session lifetime: `12` hours
- member session lifetime: `3` days

This reduces the chance that a leaked or forgotten browser session remains valid too long.

## Infrastructure Security Already In Place

The Docker runtime also includes a few good defaults:

- Prisma migrations run at container startup only when enabled
- the container runs as the non-root `node` user
- Prisma client files are copied with the correct ownership

Key files:

- `Dockerfile`
- `docker/start.sh`

## Important Remaining Security Work

The current hardening pass is strong for an application-level baseline, but it is not the end of the security story.

Recommended next steps:

1. Put the application behind a CDN and WAF such as Cloudflare
2. Add bot protection and edge rate limiting outside the app itself
3. Bind UploadThing uploads even more tightly to authenticated user or application context
4. Add audit dashboards or alerts for repeated abuse
5. Add log retention and data-retention policies for sensitive documents
6. Consider private object storage with signed URLs if file volume grows

## Threats This Security Layer Helps Reduce

- brute-force login attempts
- magic-link abuse
- account enumeration
- repeated spam submissions
- basic upload abuse
- unauthorized document browsing
- clickjacking
- accidental indexing of private pages

## What This Security Layer Does Not Fully Solve Alone

- large-scale DDoS attacks
- infrastructure compromise
- stolen email inboxes
- insider misuse
- malware on a user device

Those risks need operational controls in addition to application code.
