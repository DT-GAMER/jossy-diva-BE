/*
  Warnings:

  - Made the column `publicId` on table `ProductMedia` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProductMedia" ALTER COLUMN "publicId" SET NOT NULL;
