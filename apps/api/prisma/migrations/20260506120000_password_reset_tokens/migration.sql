CREATE TABLE "PasswordResetTokenRecord" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PasswordResetTokenRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PasswordResetTokenRecord_tokenHash_idx" ON "PasswordResetTokenRecord"("tokenHash");
CREATE INDEX "PasswordResetTokenRecord_userId_idx" ON "PasswordResetTokenRecord"("userId");
