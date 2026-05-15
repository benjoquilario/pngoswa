# Features

## Public Website

The public-facing site presents PNGOSWA as the Philippine NGO Social Workers Association and is designed to support brand search, public information, and membership discovery.

Current public features:

- homepage with organization overview, officers, objectives, gallery, FAQ, and CTA
- public `About` page
- public `Ethics` page
- public `Membership` page
- SEO metadata, structured data, sitemap, robots, and favicon configuration
- canonical production site URL support for `https://www.pngoswa.org`

Key files:

- `app/page.tsx`
- `app/about/page.tsx`
- `app/ethics/page.tsx`
- `app/layout.tsx`
- `app/sitemap.ts`
- `app/robots.ts`
- `app/manifest.ts`
- `components/seo/json-ld.tsx`
- `lib/seo.ts`

## Membership Information and Pricing

The membership page is not only informational. It also shows live membership progress data for the first `500` regular members whose membership fee is waived.

Current features:

- membership categories and privileges
- pricing and validity presentation
- live membership progress counter
- API endpoint for community stats

Key files:

- `app/membership/page.tsx`
- `components/membership/membership-page-client.tsx`
- `components/membership/membership-header-section.tsx`
- `components/membership/categories-section.tsx`
- `app/api/memberships/community/route.ts`
- `lib/membership.ts`

## Membership Application Form

Applicants can submit their membership form with supporting documents.

Current features:

- field validation for personal, professional, and membership information
- support for document uploads
- duplicate-application blocking by email
- duplicate-submission fingerprinting
- auto-creation or reuse of the member user record
- automatic member magic-link email after successful application save
- clearer duplicate warning with a member-login prompt

Key files:

- `app/membership/apply/page.tsx`
- `components/membership/application-form-section.tsx`
- `app/api/memberships/apply/route.ts`
- `lib/membership.ts`
- `lib/membership-form.ts`

## Member Portal

The member portal is where applicants and approved members track their status after submission.

Current features:

- magic-link member login
- profile page with best available membership record
- visible approved, follow-up, pending, and rejected states
- submitted document list
- requirement checklist
- review timeline
- communication log
- upload form for missing or replacement documents

Key files:

- `app/member/login/page.tsx`
- `app/member/profile/page.tsx`
- `app/member/actions.ts`
- `app/api/member/application-documents/route.ts`
- `components/portal/magic-link-request-form.tsx`
- `components/portal/member-document-update-form.tsx`
- `components/portal/status-badge.tsx`

## Admin Portal

The admin portal is designed for membership review and decision-making.

Current features:

- magic-link admin login
- dashboard with counts by status
- search by applicant name, email, organization, or application number
- filter by status
- detailed application review page
- requirement checklist
- private document access
- approve, reject, or send follow-up
- review timeline
- communication logging

Key files:

- `app/admin/login/page.tsx`
- `app/admin/dashboard/page.tsx`
- `app/admin/dashboard/applications/[id]/page.tsx`
- `app/admin/actions.ts`

## Email Workflows

The app uses email for secure access and membership communication.

Current features:

- member magic-link emails
- admin magic-link emails
- application approval emails
- follow-up request emails
- rejection/update emails
- communication log entries for sent and failed delivery attempts
- validated sender-domain checks for Resend

Key files:

- `lib/auth.ts`
- `lib/email.ts`
- `app/auth/verify/route.ts`

## File Management

The app handles sensitive membership documents and profile updates.

Current features:

- UploadThing-backed uploads for the current form flow
- local storage helper support for legacy file persistence
- secure document download route
- requirement-aware document replacement from member profile
- cleanup of replaced or failed uploads

Key files:

- `app/api/uploadthing/core.ts`
- `app/api/uploadthing/route.ts`
- `app/api/documents/[documentId]/route.ts`
- `lib/storage.ts`
- `lib/uploadthing.ts`
- `lib/membership.ts`

## Security Features Already Implemented

The application already includes a meaningful first security layer.

Implemented protections:

- magic-link authentication instead of password storage
- origin checks on sensitive POST endpoints
- database-backed rate limiting
- noindex protection on private routes and API responses
- secure cookies in production
- session expiration
- document authorization checks
- email sender validation for Resend
- global security headers via `next.config.ts`

For the full breakdown, see [security.md](./security.md).
