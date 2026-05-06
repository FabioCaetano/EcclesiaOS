CREATE TABLE "PeopleMessageRecord" (
  "id" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'manual',
  "recipientPersonIds" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL,
  "createdByUserId" TEXT NOT NULL DEFAULT '',
  "createdByName" TEXT NOT NULL DEFAULT '',
  CONSTRAINT "PeopleMessageRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PeopleMessageRecord_createdAt_idx" ON "PeopleMessageRecord"("createdAt");
