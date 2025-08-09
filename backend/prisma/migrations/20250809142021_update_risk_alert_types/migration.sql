-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "category" TEXT;

-- AlterTable
ALTER TABLE "DailyChecklist" ADD COLUMN     "cognitiveTask" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "creativeTask" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moodCheckin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quizCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Drawing" ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "riskFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sentimentScore" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "baselineCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consentSettings" JSONB;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "category" TEXT,
ADD COLUMN     "duration" INTEGER;

-- CreateTable
CREATE TABLE "MoodEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "emoji" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentimentScore" DOUBLE PRECISION,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "riskFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CognitiveEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "comprehensionScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CognitiveEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "questions" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "surveyType" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WellnessScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "moodScore" DOUBLE PRECISION NOT NULL,
    "stressScore" DOUBLE PRECISION NOT NULL,
    "cognitiveScore" DOUBLE PRECISION NOT NULL,
    "sleepScore" DOUBLE PRECISION NOT NULL,
    "socialScore" DOUBLE PRECISION NOT NULL,
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weekOf" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WellnessScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusicUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "musicId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MusicUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Music" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "coverUrl" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Music_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapistContact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TherapistContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Therapist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "bio" TEXT,
    "contactInfo" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Therapist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WellnessScore_userId_weekOf_key" ON "WellnessScore"("userId", "weekOf");

-- CreateIndex
CREATE INDEX "RiskAlert_userId_idx" ON "RiskAlert"("userId");

-- CreateIndex
CREATE INDEX "RiskAlert_acknowledged_idx" ON "RiskAlert"("acknowledged");

-- AddForeignKey
ALTER TABLE "MoodEntry" ADD CONSTRAINT "MoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CognitiveEntry" ADD CONSTRAINT "CognitiveEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CognitiveEntry" ADD CONSTRAINT "CognitiveEntry_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResponse" ADD CONSTRAINT "QuizResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizResponse" ADD CONSTRAINT "QuizResponse_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WellnessScore" ADD CONSTRAINT "WellnessScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicUsage" ADD CONSTRAINT "MusicUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicUsage" ADD CONSTRAINT "MusicUsage_musicId_fkey" FOREIGN KEY ("musicId") REFERENCES "Music"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistContact" ADD CONSTRAINT "TherapistContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TherapistContact" ADD CONSTRAINT "TherapistContact_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
