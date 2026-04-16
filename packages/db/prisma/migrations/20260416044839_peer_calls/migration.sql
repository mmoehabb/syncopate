-- AlterTable
ALTER TABLE "BoardMember" ADD COLUMN     "lastVoicePing" TIMESTAMP(3),
ADD COLUMN     "voicePeerId" TEXT;
