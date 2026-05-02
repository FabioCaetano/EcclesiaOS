ALTER TABLE "AttendanceRecord" ADD COLUMN "eventId" TEXT NOT NULL DEFAULT '';

ALTER TABLE "EventRecord" ADD COLUMN "recurrence" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "EventRecord" ADD COLUMN "recurrenceUntil" TEXT NOT NULL DEFAULT '';
