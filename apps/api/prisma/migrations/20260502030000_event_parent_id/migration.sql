ALTER TABLE "EventRecord" ADD COLUMN "parentEventId" TEXT NOT NULL DEFAULT '';

CREATE INDEX "EventRecord_parentEventId_idx" ON "EventRecord"("parentEventId");
