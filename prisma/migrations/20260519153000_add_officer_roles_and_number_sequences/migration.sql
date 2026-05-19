ALTER TABLE "User"
ADD COLUMN "officerRoleName" TEXT;

ALTER TABLE "MembershipApplication"
ADD COLUMN "officerRoleName" TEXT;

CREATE TABLE "ApplicationNumberSequence" (
    "year" INTEGER NOT NULL,
    "lastGeneralSequence" INTEGER NOT NULL DEFAULT 10,
    "lastOfficerSequence" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationNumberSequence_pkey" PRIMARY KEY ("year")
);

INSERT INTO "PaymentSettings" (
    "id",
    "gcashNumber",
    "privacyMessage",
    "createdAt",
    "updatedAt"
)
VALUES (
    'default',
    '09094432115',
    'Your payment and personal information are protected and used only for membership verification, records, and official PNGOSWA communication.',
    NOW(),
    NOW()
)
ON CONFLICT ("id") DO UPDATE
SET
    "gcashNumber" = COALESCE("PaymentSettings"."gcashNumber", EXCLUDED."gcashNumber"),
    "privacyMessage" = COALESCE("PaymentSettings"."privacyMessage", EXCLUDED."privacyMessage"),
    "updatedAt" = NOW();
