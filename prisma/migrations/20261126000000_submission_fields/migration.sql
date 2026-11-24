-- AlterTable
ALTER TABLE "PublicSubmission" ADD COLUMN     "handledById" TEXT,
ADD COLUMN     "ipHash" TEXT,
ADD COLUMN     "payload" JSONB;

-- CreateIndex
CREATE INDEX "PublicSubmission_createdAt_idx" ON "PublicSubmission"("createdAt");

-- AddForeignKey
ALTER TABLE "PublicSubmission" ADD CONSTRAINT "PublicSubmission_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
