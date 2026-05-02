CREATE TABLE "EventCheckInRecord" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL,

    CONSTRAINT "EventCheckInRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChildCheckInRecord" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "childName" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "guardianPhone" TEXT NOT NULL,
    "securityCode" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL,
    "checkedOutAt" TEXT NOT NULL,
    "notes" TEXT NOT NULL,

    CONSTRAINT "ChildCheckInRecord_pkey" PRIMARY KEY ("id")
);
