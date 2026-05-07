CREATE TABLE "MessageTemplateRecord" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'manual',
  "subject" TEXT NOT NULL DEFAULT '',
  "body" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MessageTemplateRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MessageTemplateRecord_name_idx" ON "MessageTemplateRecord"("name");
