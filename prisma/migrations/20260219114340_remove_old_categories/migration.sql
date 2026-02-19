/*
  Warnings:

  - The values [MEN_SHOES,WOMEN_SHOES,BODY_SPRAY] on the enum `ProductCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProductCategory_new" AS ENUM ('MEN_CLOTHINGS', 'WOMEN_CLOTHINGS', 'PERFUMES', 'SKIN_CARES', 'WATCHES', 'JEWELRIES', 'FASHION_GLASSES', 'BAGS');
ALTER TABLE "Product" ALTER COLUMN "category" TYPE "ProductCategory_new" USING ("category"::text::"ProductCategory_new");
ALTER TYPE "ProductCategory" RENAME TO "ProductCategory_old";
ALTER TYPE "ProductCategory_new" RENAME TO "ProductCategory";
DROP TYPE "public"."ProductCategory_old";
COMMIT;
