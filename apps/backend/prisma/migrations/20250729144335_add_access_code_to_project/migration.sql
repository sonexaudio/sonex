/*
  Warnings:

  - You are about to drop the column `projectId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `projectPermissions` on the `Client` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,userId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shareCode]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Client_email_projectId_userId_key";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "projectId",
DROP COLUMN "projectPermissions";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "shareCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_userId_key" ON "Client"("email", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_shareCode_key" ON "Project"("shareCode");
