CREATE TABLE "ServiceChecklistRecord" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL DEFAULT '',
  "title" TEXT NOT NULL,
  "date" TEXT NOT NULL DEFAULT '',
  "notes" TEXT NOT NULL DEFAULT '',
  "items" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServiceChecklistRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ServiceChecklistRecord_eventId_idx" ON "ServiceChecklistRecord"("eventId");
CREATE INDEX "ServiceChecklistRecord_date_idx" ON "ServiceChecklistRecord"("date");
