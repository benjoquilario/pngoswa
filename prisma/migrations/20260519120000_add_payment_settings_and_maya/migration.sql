ALTER TYPE "PaymentModeOption" ADD VALUE IF NOT EXISTS 'MAYA';

CREATE TABLE "PaymentSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "gcashNumber" TEXT,
    "mayaNumber" TEXT,
    "privacyMessage" TEXT,
    "qrCodeStoredName" TEXT,
    "qrCodeOriginalName" TEXT,
    "qrCodeUrl" TEXT,
    "qrCodeMimeType" TEXT,
    "qrCodeSizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSettings_pkey" PRIMARY KEY ("id")
);
