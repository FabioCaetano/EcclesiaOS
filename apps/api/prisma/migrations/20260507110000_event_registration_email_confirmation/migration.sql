ALTER TABLE "EventRecord" ADD COLUMN "registrationRequiresEmailConfirmation" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "EventRegistrationRecord" ADD COLUMN "emailConfirmationTokenHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "EventRegistrationRecord" ADD COLUMN "emailConfirmationExpiresAt" TEXT NOT NULL DEFAULT '';
