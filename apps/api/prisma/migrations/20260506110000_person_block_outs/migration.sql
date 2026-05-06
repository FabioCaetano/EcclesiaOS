CREATE TABLE "PersonBlockOutRecord" (
  "id" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "startDate" TEXT NOT NULL,
  "endDate" TEXT NOT NULL,
  "reason" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL,
  "createdByUserId" TEXT NOT NULL DEFAULT '',
  CONSTRAINT "PersonBlockOutRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PersonBlockOutRecord_personId_idx" ON "PersonBlockOutRecord"("personId");
CREATE INDEX "PersonBlockOutRecord_startDate_idx" ON "PersonBlockOutRecord"("startDate");
