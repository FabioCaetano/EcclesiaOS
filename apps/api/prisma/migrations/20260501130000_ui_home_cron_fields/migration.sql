ALTER TABLE "ChurchProfileRecord" ADD COLUMN "youtubeChannelUrl" TEXT NOT NULL DEFAULT '';

ALTER TABLE "EventRecord" ADD COLUMN "recurrenceRule" TEXT NOT NULL DEFAULT '';
