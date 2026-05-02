ALTER TABLE "EventRecord" ADD COLUMN "registrationEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "EventRecord" ADD COLUMN "registrationCapacity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "EventRecord" ADD COLUMN "registrationPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "EventRecord" ADD COLUMN "registrationCurrency" TEXT NOT NULL DEFAULT 'BRL';
ALTER TABLE "EventRecord" ADD COLUMN "registrationSlug" TEXT NOT NULL DEFAULT '';

UPDATE "EventRecord" SET "registrationSlug" = "id" WHERE "registrationSlug" = '';

CREATE UNIQUE INDEX "EventRecord_registrationSlug_key" ON "EventRecord"("registrationSlug");

CREATE TABLE "EventRegistrationRecord" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amountDue" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRegistrationRecord_pkey" PRIMARY KEY ("id")
);
