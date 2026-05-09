CREATE TABLE "KidsRoomRecord" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "minAge" INTEGER NOT NULL,
  "maxAge" INTEGER NOT NULL,
  "capacity" INTEGER NOT NULL DEFAULT 0,
  "responsiblePersonIds" JSONB NOT NULL DEFAULT '[]',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "KidsRoomRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "KidsRoomRecord_isActive_idx" ON "KidsRoomRecord"("isActive");
CREATE INDEX "KidsRoomRecord_minAge_idx" ON "KidsRoomRecord"("minAge");

INSERT INTO "KidsRoomRecord" ("id", "name", "minAge", "maxAge", "capacity", "responsiblePersonIds", "isActive", "createdAt", "updatedAt")
VALUES
  ('kids_room_nursery', 'Berçario', 0, 2, 12, '[]', true, NOW(), NOW()),
  ('kids_room_toddler', 'Maternal', 3, 5, 18, '[]', true, NOW(), NOW()),
  ('kids_room_kids', 'Kids', 6, 8, 24, '[]', true, NOW(), NOW()),
  ('kids_room_juniors', 'Juniores', 9, 11, 24, '[]', true, NOW(), NOW()),
  ('kids_room_teens', 'Teens', 12, 17, 30, '[]', true, NOW(), NOW());
