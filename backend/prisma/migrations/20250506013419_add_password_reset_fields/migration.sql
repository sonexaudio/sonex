-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordLastChangedAt" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" VARCHAR(64),
ADD COLUMN     "resetTokenExpiresAt" TIMESTAMP(3);
