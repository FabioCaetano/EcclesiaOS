CREATE TABLE "CustomFormRecord" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "slug" TEXT NOT NULL,
  "responsiblePersonIds" JSONB NOT NULL DEFAULT '[]',
  "fields" JSONB NOT NULL DEFAULT '[]',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomFormRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomFormResponseRecord" (
  "id" TEXT NOT NULL,
  "formId" TEXT NOT NULL,
  "answers" JSONB NOT NULL DEFAULT '{}',
  "submittedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomFormResponseRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CustomFormRecord_slug_key" ON "CustomFormRecord"("slug");
CREATE INDEX "CustomFormRecord_slug_idx" ON "CustomFormRecord"("slug");
CREATE INDEX "CustomFormResponseRecord_formId_idx" ON "CustomFormResponseRecord"("formId");
CREATE INDEX "CustomFormResponseRecord_submittedAt_idx" ON "CustomFormResponseRecord"("submittedAt");
