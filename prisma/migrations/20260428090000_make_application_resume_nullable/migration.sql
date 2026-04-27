ALTER TABLE "Application" DROP CONSTRAINT "Application_resumeId_fkey";

ALTER TABLE "Application" ALTER COLUMN "resumeId" DROP NOT NULL;

ALTER TABLE "Application"
  ADD CONSTRAINT "Application_resumeId_fkey"
  FOREIGN KEY ("resumeId") REFERENCES "Resume"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
