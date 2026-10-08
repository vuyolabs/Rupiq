-- Brings the database in line with schema.prisma:
--  * categories added to the schema after the initial migration
--  * Account bank-detail columns
--  * Supabase Auth link on User (replaces local password auth)
--  * AiMessage table storing AI SDK UIMessages

-- AlterEnum
ALTER TYPE "TransactionCategory" ADD VALUE IF NOT EXISTS 'INCENTIVE_BONUS';
ALTER TYPE "TransactionCategory" ADD VALUE IF NOT EXISTS 'SNACKS_TEA';
ALTER TYPE "TransactionCategory" ADD VALUE IF NOT EXISTS 'PERSONAL_HABITS';
ALTER TYPE "TransactionCategory" ADD VALUE IF NOT EXISTS 'GROCERIES';
ALTER TYPE "TransactionCategory" ADD VALUE IF NOT EXISTS 'ONLINE_SHOPPING';
ALTER TYPE "TransactionCategory" ADD VALUE IF NOT EXISTS 'MOBILE_RECHARGE';
ALTER TYPE "TransactionCategory" ADD VALUE IF NOT EXISTS 'STREAMING_OTT';

-- AlterTable
ALTER TABLE "Account" ADD COLUMN IF NOT EXISTS "accountNumber" TEXT,
ADD COLUMN IF NOT EXISTS "ifsc" TEXT,
ADD COLUMN IF NOT EXISTS "branch" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "password",
DROP COLUMN IF EXISTS "googleId",
ADD COLUMN IF NOT EXISTS "authId" UUID,
ADD COLUMN IF NOT EXISTS "avatar" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_authId_key" ON "User"("authId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "AiMessage" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parts" JSONB,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AiMessage_userId_createdAt_idx" ON "AiMessage"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "AiMessage" ADD CONSTRAINT "AiMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
