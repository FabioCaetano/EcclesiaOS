ALTER TABLE "EventRecord" ADD COLUMN "requestedTeamIds" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "ServingPlanRecord" ADD COLUMN "eventId" TEXT NOT NULL DEFAULT '';

CREATE INDEX "ServingPlanRecord_eventId_idx" ON "ServingPlanRecord"("eventId");

CREATE INDEX "ServingPlanRecord_groupId_idx" ON "ServingPlanRecord"("groupId");
