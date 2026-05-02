ALTER TABLE "EventRegistrationRecord" ADD COLUMN "ticketCode" TEXT NOT NULL DEFAULT '';
ALTER TABLE "EventRegistrationRecord" ADD COLUMN "checkedInAt" TEXT NOT NULL DEFAULT '';
ALTER TABLE "EventRegistrationRecord" ADD COLUMN "checkedInByUserId" TEXT NOT NULL DEFAULT '';
