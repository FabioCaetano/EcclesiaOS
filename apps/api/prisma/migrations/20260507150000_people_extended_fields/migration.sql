ALTER TABLE "PersonRecord" ADD COLUMN "membershipDate" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PersonRecord" ADD COLUMN "address" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PersonRecord" ADD COLUMN "baptized" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "PersonRecord" ADD COLUMN "gender" TEXT NOT NULL DEFAULT 'unspecified';
