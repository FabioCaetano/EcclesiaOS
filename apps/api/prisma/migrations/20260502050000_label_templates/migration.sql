CREATE TABLE "LabelTemplateRecord" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "printerModel" TEXT NOT NULL DEFAULT '',
  "widthMm" DOUBLE PRECISION NOT NULL DEFAULT 62,
  "heightMm" DOUBLE PRECISION NOT NULL DEFAULT 100,
  "isContinuous" BOOLEAN NOT NULL DEFAULT false,
  "layout" TEXT NOT NULL DEFAULT 'kids_checkin',
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LabelTemplateRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LabelTemplateRecord_layout_idx" ON "LabelTemplateRecord"("layout");

CREATE UNIQUE INDEX "LabelTemplateRecord_layout_default_unique" ON "LabelTemplateRecord"("layout") WHERE "isDefault" = true;
