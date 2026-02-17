/*
  Warnings:

  - The values [CLOTHES,SHOES,CREAMS,JEWELRY] on the enum `ProductCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProductCategory_new" AS ENUM ('MEN_CLOTHINGS', 'WOMEN_CLOTHINGS', 'MEN_SHOES', 'WOMEN_SHOES', 'PERFUMES', 'SKIN_CARES', 'WATCHES', 'JEWELRIES', 'FASHION_GLASSES', 'BAGS', 'BODY_SPRAY');
ALTER TABLE "Product" ALTER COLUMN "category" TYPE "ProductCategory_new" USING (
  CASE "category"::text
    WHEN 'CLOTHES' THEN 'MEN_CLOTHINGS'
    WHEN 'SHOES' THEN 'MEN_SHOES'
    WHEN 'CREAMS' THEN 'SKIN_CARES'
    WHEN 'JEWELRY' THEN 'JEWELRIES'
    ELSE "category"::text
  END::"ProductCategory_new"
);
ALTER TYPE "ProductCategory" RENAME TO "ProductCategory_old";
ALTER TYPE "ProductCategory_new" RENAME TO "ProductCategory";
DROP TYPE "public"."ProductCategory_old";
COMMIT;
