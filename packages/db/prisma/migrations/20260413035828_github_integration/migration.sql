-- AlterEnum
ALTER TYPE "TaskStatus" ADD VALUE 'CLOSED';

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "githubInstallationId" TEXT;

-- AlterTable
ALTER TABLE "_LabelToTask" ADD CONSTRAINT "_LabelToTask_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_LabelToTask_AB_unique";

-- AlterTable
ALTER TABLE "_TaskAssignees" ADD CONSTRAINT "_TaskAssignees_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_TaskAssignees_AB_unique";
