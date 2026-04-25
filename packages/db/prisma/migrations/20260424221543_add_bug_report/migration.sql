-- CreateTable
CREATE TABLE "BugReport" (
    "id" TEXT NOT NULL,
    "message" TEXT,
    "digest" TEXT,
    "stack" TEXT,
    "browser" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BugReport_pkey" PRIMARY KEY ("id")
);
