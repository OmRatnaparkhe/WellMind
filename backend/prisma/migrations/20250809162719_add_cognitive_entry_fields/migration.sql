-- AlterTable
ALTER TABLE "CognitiveEntry" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "exerciseType" TEXT,
ADD COLUMN     "metadata" JSONB DEFAULT '{}',
ADD COLUMN     "score" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "RiskAlert" ADD COLUMN     "type" TEXT;
