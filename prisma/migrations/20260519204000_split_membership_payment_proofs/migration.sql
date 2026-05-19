DO $$
BEGIN
  CREATE TYPE "MembershipPaymentCategory" AS ENUM (
    'WAIVED_FREE_MEMBERSHIP',
    'REGULAR_ANNUAL_MEMBERSHIP',
    'LIFETIME_NO_ANNUAL_MEMBERSHIP'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "MembershipDocumentType" ADD VALUE IF NOT EXISTS 'MEMBERSHIP_PAYMENT_PROOF';
ALTER TYPE "MembershipDocumentType" ADD VALUE IF NOT EXISTS 'SHIRT_ID_PAYMENT_PROOF';

ALTER TABLE "MembershipApplication"
ADD COLUMN IF NOT EXISTS "paymentCategory" "MembershipPaymentCategory";

UPDATE "MembershipApplication"
SET "paymentCategory" = CASE
  WHEN "membershipType" = 'LIFETIME' THEN 'LIFETIME_NO_ANNUAL_MEMBERSHIP'::"MembershipPaymentCategory"
  WHEN "membershipType" = 'HONORARY' OR "isConventionAttendee" = TRUE THEN 'WAIVED_FREE_MEMBERSHIP'::"MembershipPaymentCategory"
  ELSE 'REGULAR_ANNUAL_MEMBERSHIP'::"MembershipPaymentCategory"
END
WHERE "paymentCategory" IS NULL;

ALTER TABLE "MembershipApplication"
ALTER COLUMN "paymentCategory" SET DEFAULT 'WAIVED_FREE_MEMBERSHIP';

ALTER TABLE "MembershipApplication"
ALTER COLUMN "paymentCategory" SET NOT NULL;
