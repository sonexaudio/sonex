/*
  Warnings:

  - A unique constraint covering the columns `[clientId,projectId]` on the table `ClientProject` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "ClientProject_projectId_idx" ON "ClientProject"("projectId");

-- CreateIndex
CREATE INDEX "ClientProject_clientId_idx" ON "ClientProject"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProject_clientId_projectId_key" ON "ClientProject"("clientId", "projectId");
