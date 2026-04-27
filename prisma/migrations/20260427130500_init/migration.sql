-- CreateEnum
CREATE TYPE "ResumeStatus" AS ENUM ('UPLOADING', 'PARSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "ApplicationStage" AS ENUM ('PREPARING', 'APPLIED', 'COMMUNICATING', 'INTERVIEWING', 'OFFER', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AiFeature" AS ENUM ('RESUME_PARSE', 'JD_EXTRACT', 'DIAGNOSIS', 'REWRITE', 'GREETING', 'INTERVIEW_REVIEW', 'WEEKLY_INSIGHT');

-- CreateEnum
CREATE TYPE "GenerationStatus" AS ENUM ('SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT,
    "filePath" TEXT,
    "sourceText" TEXT,
    "parsedJson" JSONB,
    "status" "ResumeStatus" NOT NULL DEFAULT 'UPLOADING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeBullet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "sectionTitle" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "originalText" TEXT NOT NULL,
    "currentText" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeBullet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "location" TEXT,
    "jdText" TEXT NOT NULL,
    "stage" "ApplicationStage" NOT NULL DEFAULT 'PREPARING',
    "jdExtractJson" JSONB,
    "diagnosisJson" JSONB,
    "greetingJson" JSONB,
    "weeklyBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulletRewrite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeBulletId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "variantsJson" JSONB NOT NULL,
    "selectedVariantIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BulletRewrite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "feedback" TEXT,
    "aiReviewJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiGeneration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT,
    "resumeId" TEXT,
    "feature" "AiFeature" NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT,
    "inputHash" TEXT,
    "outputJson" JSONB,
    "outputText" TEXT,
    "usageJson" JSONB,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "estimatedCost" DECIMAL(10,6),
    "status" "GenerationStatus" NOT NULL,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Resume_userId_createdAt_idx" ON "Resume"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Resume_userId_status_idx" ON "Resume"("userId", "status");

-- CreateIndex
CREATE INDEX "ResumeBullet_resumeId_idx" ON "ResumeBullet"("resumeId");

-- CreateIndex
CREATE INDEX "ResumeBullet_userId_resumeId_idx" ON "ResumeBullet"("userId", "resumeId");

-- CreateIndex
CREATE INDEX "Application_resumeId_idx" ON "Application"("resumeId");

-- CreateIndex
CREATE INDEX "Application_userId_resumeId_idx" ON "Application"("userId", "resumeId");

-- CreateIndex
CREATE INDEX "Application_userId_stage_updatedAt_idx" ON "Application"("userId", "stage", "updatedAt");

-- CreateIndex
CREATE INDEX "BulletRewrite_applicationId_idx" ON "BulletRewrite"("applicationId");

-- CreateIndex
CREATE INDEX "BulletRewrite_resumeBulletId_idx" ON "BulletRewrite"("resumeBulletId");

-- CreateIndex
CREATE INDEX "BulletRewrite_userId_applicationId_idx" ON "BulletRewrite"("userId", "applicationId");

-- CreateIndex
CREATE INDEX "BulletRewrite_userId_resumeBulletId_idx" ON "BulletRewrite"("userId", "resumeBulletId");

-- CreateIndex
CREATE INDEX "InterviewReview_applicationId_idx" ON "InterviewReview"("applicationId");

-- CreateIndex
CREATE INDEX "InterviewReview_userId_applicationId_idx" ON "InterviewReview"("userId", "applicationId");

-- CreateIndex
CREATE INDEX "AiGeneration_applicationId_idx" ON "AiGeneration"("applicationId");

-- CreateIndex
CREATE INDEX "AiGeneration_resumeId_idx" ON "AiGeneration"("resumeId");

-- CreateIndex
CREATE INDEX "AiGeneration_userId_applicationId_idx" ON "AiGeneration"("userId", "applicationId");

-- CreateIndex
CREATE INDEX "AiGeneration_userId_feature_createdAt_idx" ON "AiGeneration"("userId", "feature", "createdAt");

-- CreateIndex
CREATE INDEX "AiGeneration_userId_resumeId_idx" ON "AiGeneration"("userId", "resumeId");

-- AddForeignKey
ALTER TABLE "ResumeBullet" ADD CONSTRAINT "ResumeBullet_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulletRewrite" ADD CONSTRAINT "BulletRewrite_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulletRewrite" ADD CONSTRAINT "BulletRewrite_resumeBulletId_fkey" FOREIGN KEY ("resumeBulletId") REFERENCES "ResumeBullet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewReview" ADD CONSTRAINT "InterviewReview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGeneration" ADD CONSTRAINT "AiGeneration_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGeneration" ADD CONSTRAINT "AiGeneration_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;
