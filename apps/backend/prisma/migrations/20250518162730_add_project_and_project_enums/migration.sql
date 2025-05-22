-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Active', 'Complete', 'Archived', 'Private');

-- CreateEnum
CREATE TYPE "ProjectPaymentStatus" AS ENUM ('Free', 'Unpaid', 'Paid');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(65,30),
    "dueDate" TIMESTAMP(3),
    "status" "ProjectStatus" NOT NULL DEFAULT 'Active',
    "paymentStatus" "ProjectPaymentStatus" NOT NULL DEFAULT 'Unpaid',
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_title_userId_key" ON "Project"("title", "userId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
