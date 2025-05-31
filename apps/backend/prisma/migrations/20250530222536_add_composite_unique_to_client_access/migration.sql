/*
  Warnings:

  - A unique constraint covering the columns `[email,projectId]` on the table `ClientAccess` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ClientAccess_email_projectId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccess_email_projectId_key" ON "ClientAccess"("email", "projectId");
