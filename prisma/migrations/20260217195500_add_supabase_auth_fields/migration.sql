-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('NEXTAUTH', 'SUPABASE', 'HYBRID');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "authProvider" "AuthProvider" NOT NULL DEFAULT 'NEXTAUTH',
ADD COLUMN "supabaseAuthId" TEXT,
ADD COLUMN "supabaseLinkedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseAuthId_key" ON "User"("supabaseAuthId");
