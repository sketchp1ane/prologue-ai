-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_resumeId_fkey";

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;
