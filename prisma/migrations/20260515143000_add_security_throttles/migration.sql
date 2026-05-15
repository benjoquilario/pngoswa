CREATE TABLE "SecurityThrottle" (
    "key" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStartedAt" TIMESTAMP(3) NOT NULL,
    "blockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityThrottle_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "SecurityThrottle_action_windowStartedAt_idx" ON "SecurityThrottle"("action", "windowStartedAt");
CREATE INDEX "SecurityThrottle_blockedUntil_idx" ON "SecurityThrottle"("blockedUntil");
