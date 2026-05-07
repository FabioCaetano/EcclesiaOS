CREATE TABLE "SongRecord" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "artist" TEXT NOT NULL DEFAULT '',
  "defaultKey" TEXT NOT NULL DEFAULT '',
  "bpm" INTEGER NOT NULL DEFAULT 0,
  "theme" TEXT NOT NULL DEFAULT '',
  "lyrics" TEXT NOT NULL DEFAULT '',
  "chords" TEXT NOT NULL DEFAULT '',
  "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SongRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorshipSetRecord" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL DEFAULT '',
  "title" TEXT NOT NULL,
  "date" TEXT NOT NULL DEFAULT '',
  "notes" TEXT NOT NULL DEFAULT '',
  "items" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorshipSetRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SongRecord_title_idx" ON "SongRecord"("title");
CREATE INDEX "WorshipSetRecord_eventId_idx" ON "WorshipSetRecord"("eventId");
CREATE INDEX "WorshipSetRecord_date_idx" ON "WorshipSetRecord"("date");
