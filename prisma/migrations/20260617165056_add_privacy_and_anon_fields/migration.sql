-- AlterTable
ALTER TABLE "manifests" ADD COLUMN     "is_anonymous_target" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_private" BOOLEAN NOT NULL DEFAULT false;
