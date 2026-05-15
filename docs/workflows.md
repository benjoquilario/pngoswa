# Workflows

## 1. Public Visitor To Membership Applicant

### User Journey

1. A visitor lands on `/`
2. They navigate to `/membership`
3. They review membership categories, pricing, and benefits
4. They open `/membership/apply`
5. They complete the application form and upload requirements

### Under The Hood

1. The form submits to `app/api/memberships/apply/route.ts`
2. The route checks origin and rate limits
3. The route calls `createMembershipApplication()` in `lib/membership.ts`
4. The membership library validates fields and documents
5. The system checks for existing applications by email and submission fingerprint
6. The app upserts a `User`
7. The app creates a `MembershipApplication`
8. The app creates `MembershipDocument` records
9. The app automatically requests a member magic link through `lib/auth.ts`
10. A communication log entry is written when the sign-in email is attempted

### Important Result

If the applicant already exists, the app blocks duplicate creation and tells the user to log in through the member portal instead.

## 2. Member Login With Magic Link

### User Journey

1. The user opens `/member/login`
2. The user enters their email
3. The app sends a sign-in link if the account is eligible
4. The user clicks the email link
5. The user is redirected to `/member/profile`

### Under The Hood

1. `app/member/actions.ts` validates origin and rate limits the request
2. `requestMagicLink()` in `lib/auth.ts` looks up the user and latest application
3. The app creates a hashed `MagicLinkToken`
4. The app sends the email through `lib/email.ts`
5. The user opens `/auth/verify?token=...&scope=member`
6. `app/auth/verify/route.ts` validates format, rate limits the request, and consumes the token
7. `lib/auth.ts` creates an `AuthSession`
8. The app sets the member session cookie
9. The user lands in `/member/profile`

## 3. Member Profile And Document Update

### User Journey

Once signed in, the member can:

- view current status
- review uploaded documents
- read the communication log
- upload missing or replacement documents

### Under The Hood

1. `app/member/profile/page.tsx` loads all applications for the signed-in user
2. The page chooses the best record to show, prioritizing approved records first
3. The page renders:
   - status
   - metadata
   - requirement checklist
   - review timeline
   - communication log
   - document update form
4. The update form posts to `app/api/member/application-documents/route.ts`
5. The route verifies the member session and rate limits the request
6. `updateMembershipApplicationDocumentsForMember()` in `lib/membership.ts` validates the payload
7. Existing `MembershipDocument` rows are created or replaced
8. Old UploadThing files are cleaned up after replacement

## 4. Admin Login

### User Journey

1. An admin opens `/admin/login`
2. The admin requests a magic link
3. The admin clicks the secure email link
4. The admin lands on `/admin/dashboard`

### Under The Hood

1. `app/admin/actions.ts` validates origin and rate limits the request
2. `lib/auth.ts` confirms the user exists and has `role: ADMIN`
3. The app stores a `MagicLinkToken`
4. The app sends the sign-in email through Resend
5. `/auth/verify` consumes the token and creates an `AuthSession`
6. The admin session cookie is set

## 5. Admin Review Workflow

### User Journey

1. An admin opens `/admin/dashboard`
2. They filter or search the queue
3. They open an application detail page
4. They review documents and applicant details
5. They approve, reject, or request follow-up

### Under The Hood

1. `app/admin/dashboard/page.tsx` loads counts and recent applications
2. `app/admin/dashboard/applications/[id]/page.tsx` loads the full application record
3. The review form submits to `reviewMembershipAction()` in `app/admin/actions.ts`
4. The action updates the application status
5. The action creates a `MembershipReviewAction`
6. The action sends an email to the applicant
7. The action creates a `CommunicationLog`
8. The action revalidates admin and member pages

### Status Effects

- approve:
  sets `status = APPROVED` and `approvedAt`

- follow-up:
  sets `status = FOLLOW_UP`, stores `followUpMessage`, and updates `lastFollowUpSentAt`

- reject:
  sets `status = REJECTED` and `rejectedAt`

## 6. Secure Document Download

### User Journey

1. A member or admin clicks a document link
2. The browser opens `/api/documents/{documentId}`

### Under The Hood

1. The route checks for an admin or member session
2. The route rate limits repeated downloads
3. The route loads the `MembershipDocument`
4. Members are restricted to their own application files
5. The file is loaded from local storage or fetched from the remote storage path
6. The app streams the file back with private headers

## 7. Membership Community Counter

### User Journey

Visitors on the membership page can see how many approved regular members already count toward the first `500` free slots.

### Under The Hood

1. `app/membership/page.tsx` calls `getMembershipCommunityStats()`
2. `lib/membership.ts` counts distinct approved members
3. The UI shows used and remaining free regular-member slots
4. The API mirror is available at `app/api/memberships/community/route.ts`

## 8. Deployment Startup Workflow

### Docker Build

1. Dependencies are installed
2. Prisma client is generated
3. Next.js runs `next build`
4. The standalone production app is copied into the runner image

### Container Startup

1. `docker/start.sh` checks `RUN_DB_MIGRATIONS`
2. If enabled, it runs `prisma migrate deploy`
3. The standalone Next.js server starts with `node server.js`

## 9. Admin Account Sync Workflow

The project includes a bootstrap script for admin accounts.

1. `scripts/sync-admins.ts` reads `ADMIN_EMAILS`
2. It connects directly to PostgreSQL
3. It creates missing admin users or promotes matching users to `ADMIN`

Use case:

This is useful for initial setup or when adding a new admin email without manually editing the database.
