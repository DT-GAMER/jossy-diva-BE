/*
  Warnings:

  - A unique constraint covering the columns `[receiptNumber]` on the table `Sale` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiptNumber` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "receiptNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Sale_receiptNumber_key" ON "Sale"("receiptNumber");
