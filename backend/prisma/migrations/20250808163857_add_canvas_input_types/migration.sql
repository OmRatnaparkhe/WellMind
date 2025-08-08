-- AlterTable
ALTER TABLE "Drawing" ADD COLUMN     "inputType" TEXT NOT NULL DEFAULT 'draw',
ADD COLUMN     "textContent" TEXT;
