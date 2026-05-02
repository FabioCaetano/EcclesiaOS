ALTER TABLE "ChildCheckInRecord" ADD COLUMN "childPersonId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ChildCheckInRecord" ADD COLUMN "guardianPersonId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ChildCheckInRecord" ADD COLUMN "checkedOutByPersonId" TEXT NOT NULL DEFAULT '';
