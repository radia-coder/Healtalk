-- AlterEnum
ALTER TYPE "PsychologistStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Psychologist" ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT;
