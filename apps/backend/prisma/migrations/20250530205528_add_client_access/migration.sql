-- CreateTable
CREATE TABLE "ClientAccess" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccess_token_key" ON "ClientAccess"("token");

-- CreateIndex
CREATE INDEX "ClientAccess_email_projectId_idx" ON "ClientAccess"("email", "projectId");
