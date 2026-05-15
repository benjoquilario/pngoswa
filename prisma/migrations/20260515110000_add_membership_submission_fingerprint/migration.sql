ALTER TABLE "MembershipApplication"
ADD COLUMN "submissionFingerprint" TEXT;

CREATE UNIQUE INDEX "MembershipApplication_submissionFingerprint_key"
ON "MembershipApplication"("submissionFingerprint");
