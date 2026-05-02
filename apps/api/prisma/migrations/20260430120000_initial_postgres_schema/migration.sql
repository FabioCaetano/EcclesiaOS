CREATE TABLE "ChurchProfileRecord" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "website" TEXT NOT NULL,
  "addressLine1" TEXT NOT NULL,
  "addressLine2" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "postalCode" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  CONSTRAINT "ChurchProfileRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserRecord" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  CONSTRAINT "UserRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserRecord_email_key" ON "UserRecord"("email");

CREATE TABLE "PersonRecord" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "birthDate" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "notes" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PersonRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroupRecord" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "leaderPersonId" TEXT NOT NULL,
  "memberPersonIds" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GroupRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AttendanceRecord" (
  "id" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "presentPersonIds" JSONB NOT NULL,
  "notes" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ServingPlanRecord" (
  "id" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "notes" TEXT NOT NULL,
  "assignments" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServingPlanRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FinancialTransactionRecord" (
  "id" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "fund" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinancialTransactionRecord_pkey" PRIMARY KEY ("id")
);
