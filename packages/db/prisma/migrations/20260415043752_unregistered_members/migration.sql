-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "unregisteredAssignees" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "unregisteredReviewers" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "_TaskReviewers" (
    "A" BIGINT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaskReviewers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TaskReviewers_B_index" ON "_TaskReviewers"("B");

-- AddForeignKey
ALTER TABLE "_TaskReviewers" ADD CONSTRAINT "_TaskReviewers_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskReviewers" ADD CONSTRAINT "_TaskReviewers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
